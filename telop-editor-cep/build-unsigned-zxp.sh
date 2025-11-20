#!/bin/bash

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "Telop Editor - Unsigned ZXP Builder"
echo "（署名なし開発用ZXPビルダー）"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
PACKAGE_DIR="$SCRIPT_DIR/package"
ZXP_OUTPUT="TelopEditor-unsigned.zxp"

echo -e "${YELLOW}注意: これは署名なしの開発用ZXPです${NC}"
echo "本番環境では package-zxp.sh で署名付きZXPを作成してください"
echo ""

# [1/4] ビルドディレクトリ準備
echo "[1/4] ビルドディレクトリ準備..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/TelopEditor"
mkdir -p "$PACKAGE_DIR"
echo -e "${GREEN}✓ ディレクトリ作成完了${NC}"

# [2/4] ファイルコピー
echo "[2/4] 必要なファイルをコピー..."
cp -r "$SCRIPT_DIR/CSXS" "$BUILD_DIR/TelopEditor/"
cp -r "$SCRIPT_DIR/client" "$BUILD_DIR/TelopEditor/"
cp -r "$SCRIPT_DIR/host" "$BUILD_DIR/TelopEditor/"
cp "$SCRIPT_DIR/README.md" "$BUILD_DIR/TelopEditor/" 2>/dev/null || true
cp "$SCRIPT_DIR/INSTALL.md" "$BUILD_DIR/TelopEditor/" 2>/dev/null || true

# index.html を実ファイルとしてコピー
if [ -L "$BUILD_DIR/TelopEditor/client/index.html" ]; then
    rm "$BUILD_DIR/TelopEditor/client/index.html"
fi

TARGET_HTML="$SCRIPT_DIR/../telop-editor/new_index.html"
if [ -f "$TARGET_HTML" ]; then
    cp "$TARGET_HTML" "$BUILD_DIR/TelopEditor/client/index.html"
    echo -e "${GREEN}✓ index.html をコピーしました${NC}"
else
    echo -e "${RED}✗ new_index.html が見つかりません${NC}"
    exit 1
fi

# CSInterface.js チェック
if [ ! -f "$BUILD_DIR/TelopEditor/client/js/CSInterface.js" ]; then
    echo -e "${YELLOW}! CSInterface.js が見つかりません${NC}"
    echo "  ダウンロードを試みます..."

    curl -L "https://raw.githubusercontent.com/Adobe-CEP/CEP-Resources/master/CEP_10.x/CSInterface.js" \
         -o "$BUILD_DIR/TelopEditor/client/js/CSInterface.js" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ CSInterface.js ダウンロード成功${NC}"
    else
        echo -e "${RED}✗ CSInterface.js のダウンロードに失敗${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ ファイルコピー完了${NC}"

# [3/4] ZIPファイル作成（ZXPは実質ZIP）
echo "[3/4] ZXP（ZIP）パッケージング中..."

cd "$BUILD_DIR"
zip -r -q "$PACKAGE_DIR/$ZXP_OUTPUT" TelopEditor/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ZXP パッケージング成功${NC}"
else
    echo -e "${RED}✗ ZIP作成に失敗${NC}"
    exit 1
fi

cd "$SCRIPT_DIR"

# [4/4] クリーンアップ
echo "[4/4] クリーンアップ..."
rm -rf "$BUILD_DIR"
echo -e "${GREEN}✓ 一時ファイル削除完了${NC}"

# 結果表示
echo ""
echo "========================================"
echo -e "${GREEN}パッケージング完了！${NC}"
echo "========================================"
echo ""
echo "出力ファイル:"
echo "  $PACKAGE_DIR/$ZXP_OUTPUT"
echo ""
FILE_SIZE=$(du -h "$PACKAGE_DIR/$ZXP_OUTPUT" | cut -f1)
echo "ファイルサイズ: $FILE_SIZE"
echo ""
echo -e "${YELLOW}⚠️ これは署名なしの開発用ZXPです${NC}"
echo ""
echo "インストール方法:"
echo "1. Anastasiy's Extension Manager を使用"
echo "   https://install.anastasiy.com/"
echo ""
echo "2. または手動で解凍してインストール:"
echo "   unzip $ZXP_OUTPUT -d /path/to/CEP/extensions/TelopEditor"
echo ""
echo "本番用には署名付きZXPを作成してください:"
echo "  bash package-zxp.sh  # macOS環境で実行"
echo ""
