#!/bin/bash

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "Telop Editor - macOS PKG Builder"
echo "========================================"
echo ""

# macOSチェック
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}[エラー] このスクリプトはmacOS専用です${NC}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build-pkg"
PAYLOAD_DIR="$BUILD_DIR/payload"
SCRIPTS_DIR="$BUILD_DIR/scripts"
PKG_OUTPUT="$SCRIPT_DIR/package/TelopEditor-macOS.pkg"
INSTALL_LOCATION="/Library/Application Support/Adobe/CEP/extensions"

VERSION="1.1.0"
IDENTIFIER="com.telopeditor.cep.premiere"

echo -e "${BLUE}バージョン: $VERSION${NC}"
echo ""

# [1/7] クリーンアップ
echo "[1/7] 前回のビルドをクリーンアップ..."
rm -rf "$BUILD_DIR"
mkdir -p "$PAYLOAD_DIR"
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$(dirname "$PKG_OUTPUT")"
echo -e "${GREEN}✓ クリーンアップ完了${NC}"

# [2/7] ペイロード準備
echo "[2/7] ペイロードファイルを準備..."
PAYLOAD_CEP="$PAYLOAD_DIR/Library/Application Support/Adobe/CEP/extensions/TelopEditor"
mkdir -p "$PAYLOAD_CEP"

# ファイルコピー
cp -r "$SCRIPT_DIR/CSXS" "$PAYLOAD_CEP/"
cp -r "$SCRIPT_DIR/client" "$PAYLOAD_CEP/"
cp -r "$SCRIPT_DIR/host" "$PAYLOAD_CEP/"
cp "$SCRIPT_DIR/README.md" "$PAYLOAD_CEP/" 2>/dev/null || true
cp "$SCRIPT_DIR/INSTALL.md" "$PAYLOAD_CEP/" 2>/dev/null || true

# index.html を実ファイルとしてコピー
if [ -L "$PAYLOAD_CEP/client/index.html" ]; then
    rm "$PAYLOAD_CEP/client/index.html"
fi

TARGET_HTML="$SCRIPT_DIR/../telop-editor/new_index.html"
if [ -f "$TARGET_HTML" ]; then
    cp "$TARGET_HTML" "$PAYLOAD_CEP/client/index.html"
    echo -e "${GREEN}✓ index.html をコピーしました${NC}"
else
    echo -e "${RED}✗ new_index.html が見つかりません${NC}"
    exit 1
fi

# CSInterface.js チェック
if [ ! -f "$PAYLOAD_CEP/client/js/CSInterface.js" ]; then
    echo -e "${YELLOW}! CSInterface.js が見つかりません${NC}"
    echo "  ダウンロードを試みます..."

    curl -L "https://raw.githubusercontent.com/Adobe-CEP/CEP-Resources/master/CEP_10.x/CSInterface.js" \
         -o "$PAYLOAD_CEP/client/js/CSInterface.js" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ CSInterface.js ダウンロード成功${NC}"
    else
        echo -e "${RED}✗ CSInterface.js のダウンロードに失敗${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ ペイロード準備完了${NC}"

# [3/7] postinstallスクリプト作成
echo "[3/7] インストール後スクリプトを作成..."
cat > "$SCRIPTS_DIR/postinstall" << 'POSTINSTALL_EOF'
#!/bin/bash

# デバッグモード有効化
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1

# パーミッション設定
chmod -R 755 "/Library/Application Support/Adobe/CEP/extensions/TelopEditor"

echo "Telop Editor CEP Extension がインストールされました。"
echo "Premiere Pro を再起動してください。"

exit 0
POSTINSTALL_EOF

chmod +x "$SCRIPTS_DIR/postinstall"
echo -e "${GREEN}✓ postinstall スクリプト作成完了${NC}"

# [4/7] コンポーネントパッケージをビルド
echo "[4/7] コンポーネントパッケージをビルド..."
COMPONENT_PKG="$BUILD_DIR/TelopEditor-component.pkg"

pkgbuild --root "$PAYLOAD_DIR" \
         --identifier "$IDENTIFIER" \
         --version "$VERSION" \
         --scripts "$SCRIPTS_DIR" \
         --install-location "/" \
         "$COMPONENT_PKG"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ pkgbuild に失敗しました${NC}"
    exit 1
fi

echo -e "${GREEN}✓ コンポーネントパッケージ作成成功${NC}"

# [5/7] distribution.xml 作成
echo "[5/7] distribution.xml を作成..."
cat > "$BUILD_DIR/distribution.xml" << DIST_EOF
<?xml version="1.0" encoding="utf-8"?>
<installer-gui-script minSpecVersion="1">
    <title>Telop Editor for Premiere Pro</title>
    <organization>com.telopeditor</organization>
    <domains enable_localSystem="true"/>
    <options customize="never" require-scripts="true" hostArchitectures="x86_64,arm64"/>

    <welcome file="welcome.html" mime-type="text/html"/>
    <license file="license.txt" mime-type="text/plain"/>
    <conclusion file="conclusion.html" mime-type="text/html"/>

    <pkg-ref id="$IDENTIFIER"/>

    <options customize="never" require-scripts="false"/>

    <choices-outline>
        <line choice="default">
            <line choice="$IDENTIFIER"/>
        </line>
    </choices-outline>

    <choice id="default"/>
    <choice id="$IDENTIFIER" visible="false">
        <pkg-ref id="$IDENTIFIER"/>
    </choice>

    <pkg-ref id="$IDENTIFIER" version="$VERSION" onConclusion="none">TelopEditor-component.pkg</pkg-ref>
</installer-gui-script>
DIST_EOF

echo -e "${GREEN}✓ distribution.xml 作成完了${NC}"

# [6/7] リソースファイル作成
echo "[6/7] リソースファイルを作成..."
RESOURCES_DIR="$BUILD_DIR/resources"
mkdir -p "$RESOURCES_DIR"

# welcome.html
cat > "$RESOURCES_DIR/welcome.html" << 'WELCOME_EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif; padding: 20px; }
        h1 { color: #333; }
        p { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>Telop Editor for Premiere Pro へようこそ</h1>
    <p>このインストーラーは、Adobe Premiere Pro用のテロップエディタ CEP Extension をインストールします。</p>
    <p><strong>インストール内容:</strong></p>
    <ul>
        <li>CEPエクステンションファイル</li>
        <li>デバッグモード設定（CSXS.10, CSXS.11）</li>
    </ul>
    <p><strong>インストール先:</strong><br>
    /Library/Application Support/Adobe/CEP/extensions/TelopEditor</p>
    <p>インストール後、Premiere Pro を再起動してください。</p>
</body>
</html>
WELCOME_EOF

# license.txt
cat > "$RESOURCES_DIR/license.txt" << 'LICENSE_EOF'
MIT License

Copyright (c) 2025 Telop Editor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
LICENSE_EOF

# conclusion.html
cat > "$RESOURCES_DIR/conclusion.html" << 'CONCLUSION_EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif; padding: 20px; }
        h1 { color: #28a745; }
        p { line-height: 1.6; }
        .important { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>✓ インストール完了</h1>
    <p>Telop Editor CEP Extension が正常にインストールされました。</p>

    <div class="important">
        <strong>次のステップ:</strong>
        <ol>
            <li>Adobe Premiere Pro を<strong>再起動</strong>してください</li>
            <li>メニューから <strong>ウィンドウ &gt; エクステンション &gt; Telop Editor</strong> を選択</li>
        </ol>
    </div>

    <p><strong>デバッグ:</strong><br>
    Chrome DevTools: <a href="http://localhost:8092/">http://localhost:8092/</a></p>

    <p><strong>アンインストール:</strong><br>
    ターミナルで以下を実行:<br>
    <code>sudo rm -rf "/Library/Application Support/Adobe/CEP/extensions/TelopEditor"</code></p>
</body>
</html>
CONCLUSION_EOF

echo -e "${GREEN}✓ リソースファイル作成完了${NC}"

# [7/7] 配布パッケージをビルド
echo "[7/7] 配布パッケージをビルド..."

productbuild --distribution "$BUILD_DIR/distribution.xml" \
             --resources "$RESOURCES_DIR" \
             --package-path "$BUILD_DIR" \
             "$PKG_OUTPUT"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ productbuild に失敗しました${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 配布パッケージ作成成功${NC}"

# クリーンアップ
echo ""
echo "ビルドディレクトリをクリーンアップ..."
rm -rf "$BUILD_DIR"

# 結果表示
echo ""
echo "========================================"
echo -e "${GREEN}パッケージング完了！${NC}"
echo "========================================"
echo ""
echo "出力ファイル:"
echo "  $PKG_OUTPUT"
echo ""
FILE_SIZE=$(du -h "$PKG_OUTPUT" | cut -f1)
echo "ファイルサイズ: $FILE_SIZE"
echo ""
echo "インストール方法:"
echo "1. TelopEditor-macOS.pkg をダブルクリック"
echo "2. インストーラーの指示に従う"
echo "3. Premiere Pro を再起動"
echo ""
echo "アンインストール方法:"
echo "  sudo rm -rf \"/Library/Application Support/Adobe/CEP/extensions/TelopEditor\""
echo ""
