#!/bin/bash

# CSInterface.jsをダウンロード
echo "Downloading CSInterface.js..."

CSINTERFACE_URL="https://raw.githubusercontent.com/Adobe-CEP/CEP-Resources/master/CEP_10.x/CSInterface.js"
TARGET_DIR="./client/js"

mkdir -p "$TARGET_DIR"

# curlまたはwgetを使用してダウンロード
if command -v curl &> /dev/null; then
    curl -L "$CSINTERFACE_URL" -o "$TARGET_DIR/CSInterface.js"
    echo "Downloaded CSInterface.js using curl"
elif command -v wget &> /dev/null; then
    wget "$CSINTERFACE_URL" -O "$TARGET_DIR/CSInterface.js"
    echo "Downloaded CSInterface.js using wget"
else
    echo "Error: Neither curl nor wget is available. Please install one of them."
    echo "Alternatively, manually download from: $CSINTERFACE_URL"
    echo "and save it to: $TARGET_DIR/CSInterface.js"
    exit 1
fi

echo "✓ CSInterface.js download complete"
echo ""
echo "Next steps:"
echo "1. Review the INSTALL.md file for installation instructions"
echo "2. Copy this folder to Premiere Pro's CEP extensions directory"
echo "3. Enable debug mode (see INSTALL.md)"
echo "4. Restart Premiere Pro"
