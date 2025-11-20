# Client フォルダ

このフォルダはCEPエクステンションのクライアントサイド（UIパネル）を含みます。

## ファイル構成

```
client/
├── index.html          # メインHTML（telop-editor/new_index.htmlからリンク/コピー）
├── css/                # スタイルシート（index.html内に含まれる場合は空）
└── js/
    ├── CSInterface.js  # Adobe CEP API（含まれています）
    └── main.js         # CEP統合コード
```

## index.html について

`index.html` は以下の方法で配置されます：

### 開発時
シンボリックリンクを作成（推奨）：
```bash
# macOS/Linux
cd client
ln -s ../../telop-editor/new_index.html index.html

# Windows（管理者権限）
cd client
mklink index.html ..\..\telop-editor\new_index.html
```

### インストール時
インストーラーが自動的に配置します。

## CSInterface.js について

Adobe CEP APIライブラリです。このファイルは：
- リポジトリに含まれています
- ソース: https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/CSInterface.js
- ライセンス: Adobe
