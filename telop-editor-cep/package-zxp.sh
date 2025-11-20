#!/bin/bash

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "Telop Editor - ZXP Package Builder"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
PACKAGE_DIR="$SCRIPT_DIR/package"
ZXP_OUTPUT="TelopEditor.zxp"
CERT_FILE="cert.p12"

# ZXPSignCmd チェック
if ! command -v ZXPSignCmd &> /dev/null; then
    echo -e "${RED}[エラー] ZXPSignCmd が見つかりません${NC}"
    echo ""
    echo "ZXPSignCmd をインストールしてください:"
    echo "https://github.com/Adobe-CEP/Getting-Started-guides"
    echo ""
    echo "macOS (Homebrew):"
    echo "  brew install zxpsigncmd"
    echo ""
    echo "または直接ダウンロード:"
    echo "  https://github.com/Adobe-CEP/Getting-Started-guides/tree/master/ZXPSignCMD"
    exit 1
fi

echo -e "${GREEN}✓ ZXPSignCmd が見つかりました${NC}"
echo ""

# [1/5] ビルドディレクトリ準備
echo "[1/5] ビルドディレクトリ準備..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/TelopEditor"
mkdir -p "$PACKAGE_DIR"
echo -e "${GREEN}✓ ディレクトリ作成完了${NC}"

# [2/5] ファイルコピー
echo "[2/5] 必要なファイルをコピー..."
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

# [3/5] 証明書チェック/作成
echo "[3/5] 証明書チェック..."
cd "$SCRIPT_DIR"

if [ ! -f "$CERT_FILE" ]; then
    echo -e "${YELLOW}証明書が見つかりません。自己署名証明書を作成します${NC}"
    echo ""

    read -p "国コード (例: JP): " COUNTRY
    read -p "都市 (例: Tokyo): " CITY
    read -p "組織名 (例: MyCompany): " ORG
    read -p "証明書名 (例: TelopEditor): " CERT_NAME
    read -sp "パスワード: " PASSWORD
    echo ""

    COUNTRY=${COUNTRY:-JP}
    CITY=${CITY:-Tokyo}
    ORG=${ORG:-TelopEditor}
    CERT_NAME=${CERT_NAME:-TelopEditor}
    PASSWORD=${PASSWORD:-password}

    ZXPSignCmd -selfSignedCert "$COUNTRY" "$CITY" "$ORG" "$CERT_NAME" "$PASSWORD" "$CERT_FILE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 自己署名証明書を作成しました${NC}"
    else
        echo -e "${RED}✗ 証明書作成に失敗${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ 既存の証明書を使用します${NC}"
    read -sp "証明書のパスワードを入力: " PASSWORD
    echo ""
fi

# [4/5] ZXP パッケージング
echo "[4/5] ZXP パッケージング中..."

ZXPSignCmd -sign "$BUILD_DIR/TelopEditor" "$PACKAGE_DIR/$ZXP_OUTPUT" "$CERT_FILE" "$PASSWORD"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ZXP パッケージング成功${NC}"
else
    echo -e "${RED}✗ ZXP パッケージングに失敗${NC}"
    exit 1
fi

# [5/5] クリーンアップ
echo "[5/5] クリーンアップ..."
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
echo "インストール方法:"
echo "1. Adobe Extension Manager または ExManCmd を使用"
echo "2. または Anastasiy's Extension Manager:"
echo "   https://install.anastasiy.com/"
echo ""
echo "コマンドラインインストール:"
echo "  ExManCmd /install $PACKAGE_DIR/$ZXP_OUTPUT"
echo ""
