# 🎬 PRTL Editor

Adobe Premiere Pro の**レガシータイトル機能**を再現したWebベースのPRTLファイルエディタ

## 📋 概要

PRTL Editor は、Adobe Premiere Pro の廃止されたレガシータイトル機能を完全に再現し、さらに拡張したWebアプリケーションです。ブラウザ上で直感的にテキストタイトルを編集し、PRTLファイルとして出力できます。

## ✨ 主な機能

### ベーシック機能
- ✅ テキスト編集（フォント、サイズ、スタイル、色）
- ✅ 位置調整（X/Y座標、配置）
- ✅ リアルタイムプレビュー
- ✅ 複数解像度対応（Full HD, 4K, HD, NTSC）
- ✅ 日本語フォント対応
- ✅ UTF-16 LE エンコーディング対応
- ✅ ワンクリックPRTLファイル出力

### 対応解像度
- 1920x1080 (Full HD)
- 3840x2160 (4K UHD)
- 1280x720 (HD)
- 720x480 (NTSC)

## 🚀 セットアップ

### 必要環境
- モダンなWebブラウザ（Chrome, Firefox, Edge, Safari等）
- ローカルサーバー（開発時）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Naoking55/PRTL01.git
cd PRTL01

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:8080/src/index.html` を開きます。

### 簡易起動（npxの場合）

```bash
# プロジェクトフォルダで実行
npx http-server -p 8080 -o
```

## 📖 使い方

### 基本的な使い方

1. **テキスト入力**
   - 「タイトルテキスト」欄にテキストを入力

2. **スタイル設定**
   - フォント、サイズ、スタイル、色を選択

3. **位置調整**
   - X/Y座標で位置を指定
   - 水平・垂直方向の配置を選択

4. **プレビュー確認**
   - リアルタイムでプレビューが更新されます
   - 「プレビュー更新」ボタンで手動更新も可能

5. **ファイル生成**
   - 「PRTLファイル生成」ボタンをクリック
   - `.prtl` ファイルがダウンロードされます

### Premiere Pro での使用方法

1. Premiere Pro を起動
2. 「ファイル」→「読み込み」
3. 生成した `.prtl` ファイルを選択
4. プロジェクトパネルに追加されます
5. タイムラインにドラッグ&ドロップして使用

## 🏗️ プロジェクト構造

```
PRTL01/
├── src/
│   ├── index.html           # メインエディタUI
│   └── prtl-generator.js    # PRTL生成ロジック
├── templates/
│   └── template.js          # ベーステンプレート
├── dist/                    # ビルド出力（今後）
├── package.json
├── PRTL_File_Analysis_Complete_Guide.md  # PRTL仕様書
└── README.md
```

## 🔧 技術仕様

### PRTLファイル形式
- **フォーマット**: XMLベース
- **エンコーディング**: UTF-16 LE (BOM付き)
- **ファイル拡張子**: `.prtl`

### 主要コンポーネント

#### `PRTLGenerator` クラス
PRTLファイルを生成するメインクラス

**主要メソッド**:
- `setText(index, text)` - テキスト設定
- `setFont(index, name, size, face)` - フォント設定
- `setTextColor(index, r, g, b)` - 色設定
- `setPosition(index, x, y)` - 位置設定
- `setResolution(width, height)` - 解像度設定
- `download(filename)` - ファイルダウンロード

## 📚 参考資料

- [PRTL_File_Analysis_Complete_Guide.md](./PRTL_File_Analysis_Complete_Guide.md) - 詳細なPRTL仕様解析ドキュメント

## 🛣️ ロードマップ

### Phase 1: ベーシック機能（✅ 完了）
- [x] テキスト編集
- [x] フォント設定
- [x] 位置調整
- [x] PRTL生成

### Phase 2: 拡張機能（予定）
- [ ] 図形描画（矩形、楕円、線）
- [ ] ドロップシャドウ
- [ ] グラデーション
- [ ] ストローク（縁取り）

### Phase 3: 高度な機能（予定）
- [ ] 複数テキストレイヤー
- [ ] テンプレート保存・管理
- [ ] 一括生成機能
- [ ] AI連携（テキスト提案）

### Phase 4: Premiere Pro連携（予定）
- [ ] UXP エクステンション化
- [ ] 直接タイムライン挿入
- [ ] リアルタイム編集

## 🤝 コントリビューション

プルリクエストを歓迎します！以下の流れでお願いします：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 👤 作者

**NAOKI**

## 🙏 謝辞

- Adobe Premiere Pro のレガシータイトル機能にインスパイアされました
- PRTL ファイル仕様解析に多大な時間を費やしました

---

**Note**: このプロジェクトはAdobe社とは無関係の個人プロジェクトです。
