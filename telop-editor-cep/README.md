# Telop Editor - CEP Extension for Premiere Pro

Premiere Pro用のテロップ作成エクステンション

## 機能

### ✅ 実装済み
- 複数レイヤーの同時選択（Ctrl/Shift+クリック、矩形選択）
- 一括編集機能（フォント、サイズ、カラー、エフェクト等）
- .telop形式プロジェクトファイル（Save/Load対応）
- PNG/MP4書き出し
- Premiere Pro連携の基盤（CEPエクステンション）

### 🚧 開発中
- MOGRT（モーショングラフィックステンプレート）書き出し
- After Effects連携
- タイムライン直接編集

## セットアップ

### 必要要件
- Adobe Premiere Pro CC 2020以降
- Windows 10/11 または macOS 10.14以降

### インストール手順

#### 1. エクステンションフォルダにコピー

**Windows:**
```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TelopEditor\
```

**macOS:**
```
/Library/Application Support/Adobe/CEP/extensions/TelopEditor/
```

#### 2. デバッグモードを有効化（開発時のみ）

**Windows:**
1. レジストリエディタを開く（Win+R → `regedit`）
2. 以下のキーを作成：
   ```
   HKEY_CURRENT_USER\Software\Adobe\CSXS.10
   ```
3. 文字列値 `PlayerDebugMode` を作成し、値を `1` に設定

**macOS:**
ターミナルで以下を実行：
```bash
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
```

#### 3. CSInterface.jsをダウンロード

Adobe CEP GitHub リポジトリから `CSInterface.js` をダウンロードし、`client/js/` フォルダに配置：

https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/CSInterface.js

#### 4. Premiere Proを再起動

#### 5. エクステンションを開く

Premiere Pro メニュー:
```
ウィンドウ > エクステンション > Telop Editor
```

## 使い方

### スタンドアローンモード（Webブラウザ）
エクステンションとしてインストールせずに使用する場合：

1. `telop-editor/new_index.html` をWebブラウザで開く
2. テロップを作成・編集
3. PNG/MP4として書き出し
4. Premiere Proの「メディアブラウザー」からインポート

### CEPエクステンションモード（Premiere Pro内）

1. Premiere Proでエクステンションを起動
2. テロップを作成・編集
3. 「タイムラインに追加」ボタンをクリック
4. 自動的にタイムラインに挿入されます

## ディレクトリ構造

```
telop-editor-cep/
├── CSXS/
│   └── manifest.xml        # エクステンション設定
├── client/                 # パネルUI
│   ├── index.html         # メインHTML
│   ├── css/
│   │   └── style.css      # スタイルシート
│   └── js/
│       ├── main.js        # CEP統合コード
│       └── CSInterface.js # Adobe CEPライブラリ
├── host/                   # Premiere Pro連携
│   └── index.jsx          # ExtendScript
└── README.md
```

## 主な機能

### 1. テキスト編集
- 横書き・縦書き対応
- 文字単位のスタイル変更
- グラデーション塗り
- ストローク（縁取り）複数レイヤー対応
- 影・光沢エフェクト

### 2. 複数選択・一括編集
- Ctrl/Shiftキーで複数オブジェクト選択
- ドラッグで矩形選択
- 選択オブジェクトの一括プロパティ変更

### 3. プロジェクト管理
- .telop形式でプロジェクト保存
- 下位互換性のある読み込み
- バージョン管理対応

### 4. 書き出し
- PNG画像書き出し（透過対応）
- MP4動画書き出し
- Premiere Proタイムラインへの直接追加

## トラブルシューティング

### エクステンションが表示されない
1. デバッグモードが有効になっているか確認
2. エクステンションフォルダのパスが正しいか確認
3. Premiere Proを完全に再起動

### 「CEP not initialized」エラー
1. `CSInterface.js` が正しく配置されているか確認
2. manifest.xmlの設定を確認

### タイムラインへの追加が失敗する
1. アクティブなシーケンスが開いているか確認
2. 「シーケンス情報」ボタンで接続を確認

## 開発者向け情報

### デバッグ
Chrome DevToolsでデバッグ可能：
```
http://localhost:8092/
```

### ExtendScript実行
```javascript
csInterface.evalScript('TelopEditor.test()', function(result) {
    console.log(result);
});
```

### ログ出力
```javascript
console.log('Debug message');
```
ログは Chrome DevTools のコンソールに表示されます。

## ライセンス

MIT License

## サポート

バグ報告や機能要望は GitHub Issues へお願いします。

## 今後の予定

- [ ] MOGRT書き出し機能の完全実装
- [ ] After Effects連携
- [ ] テンプレートライブラリ
- [ ] クラウド同期機能
- [ ] エッセンシャルグラフィックス完全対応

## バージョン履歴

### v1.0.0 (2025-11-20)
- 初回リリース
- 基本的なテロップ編集機能
- 複数選択・一括編集
- .telop形式プロジェクトファイル
- CEPエクステンション基盤

---

© 2025 Telop Editor. All rights reserved.
