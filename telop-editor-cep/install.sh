#!/bin/bash

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "Telop Editor CEP Extension - Installer"
echo "========================================"
echo ""

# sudo権限チェック
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[エラー] このスクリプトはsudo権限で実行する必要があります${NC}"
    echo "再実行: sudo bash install.sh"
    exit 1
fi

# macOS/Linux判定
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macOS"
    CEP_DIR="/Library/Application Support/Adobe/CEP/extensions/TelopEditor"
else
    OS_TYPE="Linux"
    CEP_DIR="/usr/share/Adobe/CEP/extensions/TelopEditor"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}OS: $OS_TYPE${NC}"
echo "インストール元: $SCRIPT_DIR"
echo "インストール先: $CEP_DIR"
echo ""

# [1/6] ディレクトリ作成
echo "[1/6] インストールディレクトリ作成..."
if [ -d "$CEP_DIR" ]; then
    echo -e "${YELLOW}! 既存のディレクトリが見つかりました${NC}"
    read -p "上書きインストールしますか？ [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "インストールをキャンセルしました。"
        exit 0
    fi
    rm -rf "$CEP_DIR"
fi

mkdir -p "$CEP_DIR"
echo -e "${GREEN}✓ ディレクトリを作成しました${NC}"

# [2/6] ファイルコピー
echo "[2/6] ファイルをコピー中..."
cp -r "$SCRIPT_DIR/CSXS" "$CEP_DIR/"
cp -r "$SCRIPT_DIR/client" "$CEP_DIR/"
cp -r "$SCRIPT_DIR/host" "$CEP_DIR/"
cp "$SCRIPT_DIR/README.md" "$CEP_DIR/" 2>/dev/null || true
cp "$SCRIPT_DIR/INSTALL.md" "$CEP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ ファイルコピー完了${NC}"

# [3/6] シンボリックリンク作成（index.html）
echo "[3/6] index.html のシンボリックリンク作成..."
if [ -f "$CEP_DIR/client/index.html" ]; then
    rm -f "$CEP_DIR/client/index.html"
fi

TARGET_HTML="$SCRIPT_DIR/../telop-editor/new_index.html"
if [ -f "$TARGET_HTML" ]; then
    ln -s "$TARGET_HTML" "$CEP_DIR/client/index.html" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ シンボリックリンク作成成功${NC}"
    else
        echo -e "${YELLOW}! シンボリックリンク作成失敗。ファイルをコピーします...${NC}"
        cp "$TARGET_HTML" "$CEP_DIR/client/index.html"
        echo -e "${GREEN}✓ index.html をコピーしました${NC}"
    fi
else
    echo -e "${YELLOW}! new_index.html が見つかりません（スキップ）${NC}"
fi

# [4/6] CSInterface.js チェック
echo "[4/6] CSInterface.js チェック..."
if [ ! -f "$CEP_DIR/client/js/CSInterface.js" ]; then
    echo -e "${YELLOW}! CSInterface.js が見つかりません${NC}"
    echo ""
    echo "以下のURLからダウンロードして、手動で配置してください："
    echo "https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/CSInterface.js"
    echo ""
    echo "配置先: $CEP_DIR/client/js/CSInterface.js"
    echo ""

    # curlでダウンロードを試みる
    read -p "今すぐダウンロードを試みますか？ [y/N]: " download
    if [[ "$download" =~ ^[Yy]$ ]]; then
        echo "ダウンロード中..."
        mkdir -p "$CEP_DIR/client/js"
        curl -L "https://raw.githubusercontent.com/Adobe-CEP/CEP-Resources/master/CEP_10.x/CSInterface.js" \
             -o "$CEP_DIR/client/js/CSInterface.js" 2>/dev/null

        if [ $? -eq 0 ] && [ -f "$CEP_DIR/client/js/CSInterface.js" ]; then
            echo -e "${GREEN}✓ CSInterface.js ダウンロード成功${NC}"
        else
            echo -e "${RED}✗ ダウンロード失敗。手動で配置してください${NC}"
        fi
    fi
else
    echo -e "${GREEN}✓ CSInterface.js が存在します${NC}"
fi

# [5/6] パーミッション設定
echo "[5/6] パーミッション設定..."
chmod -R 755 "$CEP_DIR"
echo -e "${GREEN}✓ パーミッション設定完了${NC}"

# [6/6] デバッグモード有効化
echo "[6/6] デバッグモード有効化..."
if [[ "$OS_TYPE" == "macOS" ]]; then
    defaults write com.adobe.CSXS.10 PlayerDebugMode 1
    defaults write com.adobe.CSXS.11 PlayerDebugMode 1
    echo -e "${GREEN}✓ デバッグモード有効化成功 (CSXS.10, CSXS.11)${NC}"
else
    echo -e "${YELLOW}! Linux環境ではデバッグモードの自動設定をスキップします${NC}"
    echo "  必要に応じて手動で設定してください"
fi

echo ""
echo "========================================"
echo -e "${GREEN}インストール完了！${NC}"
echo "========================================"
echo ""
echo "次のステップ:"
echo "1. Adobe Premiere Pro を再起動してください"
echo "2. ウィンドウ > エクステンション > Telop Editor を選択"
echo ""
if [ ! -f "$CEP_DIR/client/js/CSInterface.js" ]; then
    echo -e "${YELLOW}※ CSInterface.js が未配置の場合は手動でダウンロードしてください${NC}"
    echo ""
fi

echo "デバッグ用Chrome DevTools:"
echo "  http://localhost:8092/"
echo ""
