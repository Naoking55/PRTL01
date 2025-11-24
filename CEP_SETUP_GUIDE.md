# PRTL01 CEPエクステンション セットアップガイド

## 📋 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [ディレクトリ構造](#ディレクトリ構造)
4. [インストール方法](#インストール方法)
5. [開発モードでの実行](#開発モードでの実行)
6. [トラブルシューティング](#トラブルシューティング)
7. [本番環境への配布](#本番環境への配布)

---

## 概要

PRTL01は、Adobe Premiere ProとAfter Effectsで動作するテロップエディタのCEPエクステンションです。

**実装方式:** 単一HTML方式
- `telop-editor/new_index.html` に全機能が統合されています
- 外部スクリプトへの依存がなく、シンプルな構成です

**対応ソフト:**
- Adobe Premiere Pro CC 2020以降
- Adobe After Effects CC 2020以降

---

## 前提条件

### 必須

- Adobe Premiere Pro CC 2020以降 または Adobe After Effects CC 2020以降
- Windows 10/11 または macOS 10.14以降

### 開発時に必要

- テキストエディタ（VS Code推奨）
- デバッグ用のポート設定権限

---

## ディレクトリ構造

```
PRTL01/
├── CSXS/
│   └── manifest.xml          # CEPエクステンション設定（必須）
├── .debug                     # デバッグモード設定（開発時のみ）
├── jsx/
│   └── hostscript.jsx        # ExtendScript（Premiere Pro/AE連携）
├── telop-editor/
│   └── new_index.html        # メインHTML（単一ファイル、全機能内蔵）
├── icons/                     # アイコン画像（オプション）
│   ├── icon-normal.png
│   ├── icon-rollover.png
│   ├── icon-disabled.png
│   ├── icon-dark-normal.png
│   └── icon-dark-rollover.png
└── CEP_SETUP_GUIDE.md        # このファイル
```

---

## インストール方法

### Windows

1. **エクステンションフォルダを配置**

   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PRTL01\
   ```

   または

   ```
   %APPDATA%\Adobe\CEP\extensions\PRTL01\
   ```

2. **ディレクトリ全体をコピー**

   ```batch
   xcopy /E /I PRTL01 "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PRTL01"
   ```

### macOS

1. **エクステンションフォルダを配置**

   ```
   /Library/Application Support/Adobe/CEP/extensions/PRTL01/
   ```

   または

   ```
   ~/Library/Application Support/Adobe/CEP/extensions/PRTL01/
   ```

2. **ディレクトリ全体をコピー**

   ```bash
   cp -R PRTL01 "/Library/Application Support/Adobe/CEP/extensions/"
   ```

---

## 開発モードでの実行

### ステップ1: デバッグモードを有効化

**Windows:**

1. レジストリエディタを開く
2. 以下のキーを作成：
   ```
   HKEY_CURRENT_USER\Software\Adobe\CSXS.9
   ```
3. 新しい文字列値を作成：
   - 名前: `PlayerDebugMode`
   - 値: `1`

**macOS:**

ターミナルで以下を実行：

```bash
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
```

**注意:** CSXS.9 は Adobe CC 2019以降用。他のバージョンの場合は数字を変更：
- CC 2018: CSXS.8
- CC 2019: CSXS.9
- CC 2020以降: CSXS.10, CSXS.11

### ステップ2: 署名なし拡張機能を許可

**Windows:**

レジストリエディタで以下のキーを作成：
```
HKEY_CURRENT_USER\Software\Adobe\CSXS.9
```
新しい文字列値：
- 名前: `LogLevel`
- 値: `6`

**macOS:**

```bash
defaults write com.adobe.CSXS.9 LogLevel 6
```

### ステップ3: アプリケーションを再起動

Premiere Pro または After Effects を再起動します。

### ステップ4: エクステンションを開く

1. Premiere Pro / After Effects を起動
2. メニューから：
   - **Windows:** `ウィンドウ` → `エクステンション` → `PRTL01 エディタ`
   - **macOS:** `Window` → `Extensions` → `PRTL01 エディタ`

---

## トラブルシューティング

### エクステンションが表示されない

**確認事項:**

1. **ディレクトリ配置が正しいか**
   ```
   extensions/PRTL01/CSXS/manifest.xml
   ```
   が存在することを確認

2. **デバッグモードが有効か**
   レジストリ/defaults設定を再確認

3. **アプリケーションを再起動したか**
   設定変更後は必ず再起動が必要

4. **manifest.xmlの構文が正しいか**
   XMLのエラーがないか確認

### パネルは開くが真っ白

**原因:**
- HTMLファイルのパスが間違っている
- HTMLに構文エラーがある

**確認:**
1. `manifest.xml` の `<MainPath>` を確認
2. ブラウザの開発者ツールで確認（後述）

### 開発者ツールを開く方法

**Windows:**
1. エクステンションパネルを右クリック
2. 「デバッグ」を選択
3. Chrome DevToolsが開く

**または:**

ブラウザで以下にアクセス：
```
http://localhost:8088  # Premiere Pro
http://localhost:8089  # After Effects
```

---

## 本番環境への配布

### ステップ1: 署名の作成

CEPエクステンションを配布するには、署名が必要です。

**ZXPSignCmd ツールのダウンロード:**
```
https://github.com/Adobe-CEP/CEP-Resources/tree/master/ZXPSignCmdTools
```

**自己署名証明書を作成:**

```bash
# Windows
ZXPSignCmd.exe -selfSignedCert JP Tokyo CompanyName PRTL01 password cert.p12

# macOS
./ZXPSignCmd -selfSignedCert JP Tokyo CompanyName PRTL01 password cert.p12
```

### ステップ2: ZXPパッケージの作成

```bash
# Windows
ZXPSignCmd.exe -sign PRTL01/ PRTL01.zxp cert.p12 password

# macOS
./ZXPSignCmd -sign PRTL01/ PRTL01.zxp cert.p12 password
```

### ステップ3: 配布

生成された `PRTL01.zxp` ファイルを配布します。

ユーザーは以下の方法でインストール：

1. **Adobe Extension Manager** (廃止)
2. **Anastasiy's Extension Manager**
   - https://install.anastasiy.com/
3. **ExManCmd** (コマンドライン)
4. **ZXPInstaller**
   - https://zxpinstaller.com/

---

## アイコンの作成（オプション）

エクステンションパネルにカスタムアイコンを表示する場合：

**必要なアイコン:**
```
icons/
├── icon-normal.png       (23x23px, 通常状態)
├── icon-rollover.png     (23x23px, ホバー状態)
├── icon-disabled.png     (23x23px, 無効状態)
├── icon-dark-normal.png  (23x23px, ダークテーマ通常)
└── icon-dark-rollover.png (23x23px, ダークテーマホバー)
```

**推奨フォーマット:**
- PNG形式（透過背景）
- 解像度: 23x23ピクセル、46x46ピクセル（Retina対応）

アイコンがない場合は、デフォルトアイコンが使用されます。

---

## 詳細設定

### manifest.xmlの主要設定

```xml
<!-- ホストアプリケーションのバージョン指定 -->
<Host Name="PPRO" Version="[14.0,99.9]" />  <!-- Premiere Pro -->
<Host Name="AEFT" Version="[17.0,99.9]" />  <!-- After Effects -->

<!-- パネルサイズ -->
<Size>
    <Height>800</Height>    <!-- 初期高さ -->
    <Width>1200</Width>     <!-- 初期幅 -->
</Size>

<!-- 最小/最大サイズ -->
<MinSize>
    <Height>400</Height>
    <Width>600</Width>
</MinSize>
```

### ポート番号の変更

`.debug` ファイルでデバッグポートを変更できます：

```xml
<Host Name="PPRO" Port="8088" />
<Host Name="AEFT" Port="8089" />
```

---

## ExtendScript連携

### CSInterface ライブラリ

ホストアプリケーション（Premiere Pro/After Effects）との通信には`CSInterface`を使用します。

**ダウンロード:**
```
https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_9.x
```

`CSInterface.js` を `telop-editor/` に配置し、HTMLで読み込み：

```html
<script src="./CSInterface.js"></script>
<script>
    var csInterface = new CSInterface();

    // ExtendScriptを実行
    csInterface.evalScript('testConnection()', function(result) {
        console.log('Result:', result);
    });
</script>
```

### hostscript.jsx 関数リファレンス

**共通関数:**
- `testConnection()` - 接続テスト
- `getHostInfo()` - ホストアプリ情報取得

**Premiere Pro専用:**
- `getActiveSequenceInfo()` - アクティブシーケンス情報
- `importPRTLToTimeline(path)` - PRTLをタイムラインに追加
- `getProjectPath()` - プロジェクトパス取得

**After Effects専用:**
- `getActiveCompInfo()` - アクティブコンポジション情報
- `createMOGRTComp(data)` - MOGRTコンポジション作成
- `exportMOGRT(compName, outputPath)` - MOGRT書き出し

---

## 単一HTML方式の利点

**現在の実装（`telop-editor/new_index.html`）:**
- ✅ すべての機能が1ファイルに統合
- ✅ 外部依存なし
- ✅ パス解決の問題なし
- ✅ 配布が簡単

**ファイルサイズ:** 523KB（単一ファイル）

**将来的な拡張:**
- モジュール化が必要な場合は、`<script src="...">`で外部JSを読み込み可能
- CSS、画像なども外部ファイル化可能

---

## リファレンス

### 公式ドキュメント

- CEP Resources: https://github.com/Adobe-CEP/CEP-Resources
- CEP Cookbook: https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_9.x/Documentation/CEP%209.0%20HTML%20Extension%20Cookbook.md
- ExtendScript Toolkit: https://extendscript.docsforadobe.dev/

### コミュニティ

- Adobe CEP Forum: https://community.adobe.com/
- Davideバリエント: https://www.davidebarranca.com/

---

## 更新履歴

### Version 1.0.0 (2025-11-24)

- ✅ 初期リリース
- ✅ PRTL読み込み・書き出し機能
- ✅ ストローク・シャドウ対応
- ✅ 単一HTML方式での実装

---

## サポート

問題が発生した場合は、以下を確認してください：

1. Adobe CCのバージョンが対応しているか
2. デバッグモードが有効になっているか
3. manifest.xmlにエラーがないか
4. Chrome DevToolsでコンソールエラーを確認

---

**作成者:** PRTL01プロジェクトチーム
**最終更新:** 2025年11月24日
**バージョン:** 1.0.0
