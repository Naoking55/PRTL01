# Telop Editor CEP Extension - Installation Guide

## クイックスタート

### 1. ファイルの準備

#### a. CSInterface.jsをダウンロード
Adobe CEP Resources GitHubから最新版をダウンロード：

https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/CSInterface.js

ダウンロード後、以下のパスに配置：
```
telop-editor-cep/client/js/CSInterface.js
```

#### b. クライアントHTMLファイルを配置
`telop-editor/new_index.html` を以下にコピー：
```
telop-editor-cep/client/index.html
```

または、シンボリックリンクを作成（推奨）：

**Windows (管理者権限コマンドプロンプト):**
```cmd
cd telop-editor-cep\client
mklink index.html ..\..\telop-editor\new_index.html
```

**macOS/Linux:**
```bash
cd telop-editor-cep/client
ln -s ../../telop-editor/new_index.html index.html
```

#### c. main.jsスクリプトを読み込むように修正

`client/index.html` の `</body>` 直前に以下を追加：
```html
<!-- CEP Integration -->
<script src="./js/CSInterface.js"></script>
<script src="./js/main.js"></script>
```

### 2. Premiere Proのエクステンションフォルダにインストール

#### Windows
```cmd
xcopy /E /I telop-editor-cep "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TelopEditor"
```

#### macOS
```bash
sudo cp -r telop-editor-cep "/Library/Application Support/Adobe/CEP/extensions/TelopEditor"
```

### 3. デバッグモードを有効化

#### Windows
1. `Win + R` → `regedit` でレジストリエディタを開く
2. 以下のパスに移動：
   ```
   HKEY_CURRENT_USER\Software\Adobe
   ```
3. 新しいキー `CSXS.10` を作成
4. 文字列値 `PlayerDebugMode` を作成し、値を `1` に設定
5. レジストリエディタを閉じる

#### macOS
ターミナルで実行：
```bash
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
```

バージョン別の対応：
- CC 2019: CSXS.9
- CC 2020: CSXS.10
- CC 2021: CSXS.11
- CC 2022以降: CSXS.11

### 4. Premiere Proを再起動

完全に終了してから再起動してください。

### 5. エクステンションを開く

Premiere Pro メニュー：
```
ウィンドウ > エクステンション > Telop Editor
```

## デバッグ

### Chrome DevToolsでデバッグ

1. Premiere Proでエクステンションを開く
2. ブラウザで以下にアクセス：
   ```
   http://localhost:8092/
   ```
3. デバッグ対象のパネルをクリック
4. Chrome DevToolsが開きます

### ログファイル

Windows:
```
C:\Users\<ユーザー名>\AppData\Local\Temp\cep_cache\
```

macOS:
```
~/Library/Logs/CSXS/
```

## よくある問題

### エクステンションが表示されない

**原因1: デバッグモードが無効**
- 上記の「デバッグモードを有効化」手順を再確認

**原因2: フォルダ名が間違っている**
- フォルダ名は `TelopEditor`（manifest.xmlのExtensionBundleIdと一致）

**原因3: manifest.xmlの設定ミス**
- XMLの構文エラーをチェック
- ホストバージョンが一致しているか確認

### 「CSInterface is not defined」エラー

**原因: CSInterface.jsが読み込まれていない**

1. `client/js/CSInterface.js` が存在するか確認
2. `client/index.html` で正しくscriptタグで読み込んでいるか確認：
   ```html
   <script src="./js/CSInterface.js"></script>
   ```

### タイムラインへの追加が動作しない

**原因1: アクティブシーケンスがない**
- Premiere Proでシーケンスを開いてください

**原因2: ExtendScriptエラー**
- Chrome DevToolsのコンソールでエラーをチェック
- `TelopEditor.test()` で接続テストを実行

### パネルが真っ白

**原因: HTMLファイルが見つからない**
- `client/index.html` が存在するか確認
- manifest.xmlのMainPathが正しいか確認

## アンインストール

### Windows
```cmd
rmdir /S "C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TelopEditor"
```

### macOS
```bash
sudo rm -rf "/Library/Application Support/Adobe/CEP/extensions/TelopEditor"
```

## 署名付きエクステンションとしてパッケージング（本番用）

開発が完了したら、ZXPSignCmdで署名してパッケージング：

1. ZXPSignCmdをダウンロード:
   https://github.com/Adobe-CEP/Getting-Started-guides

2. 自己署名証明書を作成:
   ```bash
   ZXPSignCmd -selfSignedCert JP Tokyo MyCompany TelopEditor password cert.p12
   ```

3. ZXPファイルを作成:
   ```bash
   ZXPSignCmd -sign telop-editor-cep TelopEditor.zxp cert.p12 password
   ```

4. ユーザーはExMan（Extension Manager）でZXPファイルをインストール

## トラブルシューティング参考リンク

- Adobe CEP Documentation:
  https://github.com/Adobe-CEP/CEP-Resources

- Debugging CEP Extensions:
  https://github.com/Adobe-CEP/Getting-Started-guides

- Premiere Pro Scripting Guide:
  https://ppro-scripting.docsforadobe.dev/

---

問題が解決しない場合は、GitHub Issuesで報告してください。
