#!/bin/bash

# カラー出力設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================"
echo "Telop Editor CEP Extension - Uninstaller"
echo "============================================"
echo ""

# sudo権限チェック
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[エラー] このスクリプトはsudo権限で実行する必要があります${NC}"
    echo "再実行: sudo bash uninstall.sh"
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

echo -e "${BLUE}OS: $OS_TYPE${NC}"
echo "アンインストール対象: $CEP_DIR"
echo ""

# 存在チェック
if [ ! -d "$CEP_DIR" ]; then
    echo -e "${YELLOW}[情報] Telop Editor はインストールされていません${NC}"
    echo ""
    exit 0
fi

# 確認
echo -e "${RED}⚠ 本当にアンインストールしますか？${NC}"
echo "この操作は元に戻せません。"
echo ""
read -p "続行しますか？ [y/N]: " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "アンインストールをキャンセルしました。"
    exit 0
fi

echo ""

# [1/3] Premiere Pro 実行チェック
echo "[1/3] Adobe Premiere Pro の終了確認..."
if [[ "$OS_TYPE" == "macOS" ]]; then
    if pgrep -x "Adobe Premiere Pro" > /dev/null; then
        echo -e "${YELLOW}⚠ Premiere Pro が実行中です${NC}"
        echo "  終了してからアンインストールしてください。"
        exit 1
    fi
else
    if pgrep -x "premiere" > /dev/null; then
        echo -e "${YELLOW}⚠ Premiere Pro が実行中です${NC}"
        echo "  終了してからアンインストールしてください。"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Premiere Pro は実行されていません${NC}"

# [2/3] ファイル削除
echo "[2/3] ファイル削除中..."
rm -rf "$CEP_DIR"

if [ -d "$CEP_DIR" ]; then
    echo -e "${RED}✗ ファイル削除に失敗しました${NC}"
    echo "  ファイルが使用中の可能性があります"
    exit 1
else
    echo -e "${GREEN}✓ ファイル削除完了${NC}"
fi

# [3/3] デバッグモード無効化（オプション）
echo "[3/3] デバッグモード無効化..."
echo ""
echo "デバッグモードを無効化しますか？"
echo "（他のCEPエクステンションを使用している場合は「n」を推奨）"
read -p "無効化する？ [y/N]: " disable_debug

if [[ "$disable_debug" =~ ^[Yy]$ ]]; then
    if [[ "$OS_TYPE" == "macOS" ]]; then
        defaults delete com.adobe.CSXS.10 PlayerDebugMode 2>/dev/null
        defaults delete com.adobe.CSXS.11 PlayerDebugMode 2>/dev/null
        echo -e "${GREEN}✓ デバッグモードを無効化しました${NC}"
    else
        echo -e "${YELLOW}- デバッグモードの自動無効化はLinuxではサポートされていません${NC}"
        echo "  必要に応じて手動で無効化してください"
    fi
else
    echo "- デバッグモードは維持されます"
fi

echo ""
echo "============================================"
echo -e "${GREEN}アンインストール完了！${NC}"
echo "============================================"
echo ""
echo "Telop Editor CEP Extension が削除されました。"
echo "Premiere Pro を再起動すると、エクステンションメニューから消えます。"
echo ""
