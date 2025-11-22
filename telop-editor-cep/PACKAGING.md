# Telop Editor - パッケージング手順

このドキュメントでは、Telop Editor CEPエクステンションをインストール可能な形式にパッケージングする手順を説明します。

## 目次
1. [開発モード（デバッグ）インストール](#開発モードデバッグインストール)
2. [ZXPパッケージの作成](#zxpパッケージの作成)
3. [配布](#配布)

---

## 開発モード（デバッグ）インストール

開発・テスト用に、署名なしでエクステンションをインストールする方法です。

### 1. 依存関係のダウンロード

```bash
cd telop-editor-cep
bash download-deps.sh
```

または手動でCSInterface.jsをダウンロード：
```bash
curl -L https://raw.githubusercontent.com/Adobe-CEP/CEP-Resources/master/CEP_10.x/CSInterface.js \
  -o client/js/CSInterface.js
```

### 2. Premiere ProのCEPエクステンションフォルダにコピー

#### Windows
```cmd
xcopy /E /I telop-editor-cep "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TelopEditor"
```

または PowerShell:
```powershell
Copy-Item -Recurse -Force telop-editor-cep "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TelopEditor"
```

#### macOS
```bash
sudo cp -r telop-editor-cep "/Library/Application Support/Adobe/CEP/extensions/TelopEditor"
```

#### Linux (Wine環境など)
```bash
cp -r telop-editor-cep ~/.wine/drive_c/Program\ Files\ \(x86\)/Common\ Files/Adobe/CEP/extensions/TelopEditor
```

### 3. デバッグモードを有効化

#### Windows (レジストリエディタ)
1. `Win + R` → `regedit`
2. 以下のキーに移動または作成:
   ```
   HKEY_CURRENT_USER\Software\Adobe\CSXS.10
   ```
3. 文字列値 `PlayerDebugMode` を作成し、値を `1` に設定

#### Windows (PowerShell - 管理者権限)
```powershell
New-Item -Path "HKCU:\Software\Adobe\CSXS.10" -Force
New-ItemProperty -Path "HKCU:\Software\Adobe\CSXS.10" -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force
```

#### macOS
```bash
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
```

**バージョン別対応:**
- CC 2019: CSXS.9
- CC 2020: CSXS.10
- CC 2021-2022: CSXS.11

### 4. Premiere Proを再起動

完全に終了してから再起動してください。

### 5. エクステンションを開く

Premiere Pro メニュー:
```
ウィンドウ > エクステンション > Telop Editor
```

---

## ZXPパッケージの作成

本番環境用の署名付きパッケージを作成する方法です。

### 必要なツール

**ZXPSignCmd** をダウンロード:
- GitHub: https://github.com/Adobe-CEP/Getting-Started-guides
- または Adobe Exchange: https://exchange.adobe.com/

### 1. 自己署名証明書を作成

初回のみ実行：

```bash
ZXPSignCmd -selfSignedCert \
  JP \
  Tokyo \
  YourCompany \
  TelopEditor \
  your-password \
  cert.p12
```

パラメータ:
- `JP` - 国コード
- `Tokyo` - 都市名
- `YourCompany` - 組織名
- `TelopEditor` - 一般名
- `your-password` - 証明書パスワード（安全に保管）
- `cert.p12` - 出力ファイル名

### 2. ZXPパッケージを作成

```bash
ZXPSignCmd -sign \
  telop-editor-cep \
  TelopEditor-v1.0.0.zxp \
  cert.p12 \
  your-password
```

パラメータ:
- `telop-editor-cep` - ソースディレクトリ
- `TelopEditor-v1.0.0.zxp` - 出力ZXPファイル名
- `cert.p12` - 証明書ファイル
- `your-password` - 証明書パスワード

**成功すると:**
```
Sign ZXP successfully: TelopEditor-v1.0.0.zxp
```

### 3. ZXPの検証（オプション）

```bash
ZXPSignCmd -verify TelopEditor-v1.0.0.zxp
```

正常な場合:
```
Signature is valid
```

---

## 配布

### ZXPファイルの配布方法

#### 1. Adobe Exchange（推奨）
- 公式マーケットプレイス
- 審査あり
- 無料・有料配布可能
- URL: https://exchange.adobe.com/

#### 2. 直接配布
ユーザーは以下のいずれかの方法でインストール：

**A. ExMan (Extension Manager) - 推奨**
- ダウンロード: https://www.adobeexchange.com/creativecloud
- ZXPファイルをドラッグ&ドロップでインストール

**B. Anastasiy's Extension Manager**
- 無料のサードパーティツール
- ダウンロード: https://install.anastasiy.com/
- より高速・使いやすい

**C. コマンドライン (ExManCmd)**
```bash
ExManCmd /install TelopEditor-v1.0.0.zxp
```

### 配布パッケージに含めるもの

```
release/
├── TelopEditor-v1.0.0.zxp          # 署名付きパッケージ
├── README.md                        # 使い方説明
├── INSTALL.md                       # インストール手順
├── CHANGELOG.md                     # 変更履歴
└── screenshots/                     # スクリーンショット
    ├── telop-editor-01.png
    ├── telop-editor-02.png
    └── telop-editor-03.png
```

---

## トラブルシューティング

### ZXPSignCmdが見つからない

**解決策:**
1. ZXPSignCmdのダウンロードページから最新版を入手
2. 実行権限を付与（macOS/Linux）:
   ```bash
   chmod +x ZXPSignCmd
   ```
3. PATHに追加、または絶対パスで実行

### 証明書エラー

**エラー:** `Certificate is invalid or expired`

**解決策:**
1. 証明書を再作成
2. パスワードが正しいか確認
3. 証明書ファイル（.p12）が破損していないか確認

### ZXPインストール時のエラー

**エラー:** `Extension is incompatible with this version`

**原因:** manifest.xmlのホストバージョン指定が間違っている

**解決策:** manifest.xmlを編集:
```xml
<Host Name="PPRO" Version="[14.0,99.9]"/>
```

### エクステンションが表示されない

**確認事項:**
1. ZXPが正しくインストールされているか
   - Windows: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TelopEditor`
   - macOS: `/Library/Application Support/Adobe/CEP/extensions/TelopEditor`
2. Premiere Proのバージョンが対応しているか
3. manifest.xmlの設定が正しいか

---

## 開発者向け情報

### ディレクトリ構造

```
telop-editor-cep/
├── .debug                          # デバッグ設定
├── CSXS/
│   └── manifest.xml               # エクステンション設定
├── client/                        # フロントエンド
│   ├── index.html                # メインUI
│   └── js/
│       ├── CSInterface.js        # Adobe CEPライブラリ
│       └── main.js               # CEP統合コード
├── host/                          # バックエンド
│   └── index.jsx                 # ExtendScript
├── icons/                         # アイコン（オプション）
│   ├── icon-normal.png
│   ├── icon-rollover.png
│   └── ...
├── README.md
├── INSTALL.md
├── PACKAGING.md                   # このファイル
└── download-deps.sh              # 依存関係ダウンロード
```

### ビルド自動化（オプション）

package.jsonとビルドスクリプトの例:

```json
{
  "name": "telop-editor-cep",
  "version": "1.0.0",
  "scripts": {
    "download-deps": "bash download-deps.sh",
    "package": "ZXPSignCmd -sign telop-editor-cep TelopEditor-v$npm_package_version.zxp cert.p12 $PASSWORD",
    "install-dev": "bash install-dev.sh"
  }
}
```

install-dev.sh:
```bash
#!/bin/bash
if [[ "$OSTYPE" == "darwin"* ]]; then
    sudo cp -r telop-editor-cep "/Library/Application Support/Adobe/CEP/extensions/TelopEditor"
    defaults write com.adobe.CSXS.10 PlayerDebugMode 1
else
    cp -r telop-editor-cep "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TelopEditor"
fi
echo "Installed! Restart Premiere Pro."
```

---

## 参考リンク

- Adobe CEP Resources: https://github.com/Adobe-CEP/CEP-Resources
- Getting Started Guide: https://github.com/Adobe-CEP/Getting-Started-guides
- Premiere Pro Scripting: https://ppro-scripting.docsforadobe.dev/
- ZXPSignCmd: https://github.com/Adobe-CEP/Getting-Started-guides
- Extension Manager: https://www.adobeexchange.com/creativecloud

---

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHub Issuesで報告してください。
