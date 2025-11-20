# PRTL01 - Telop Editor for Premiere Pro

Adobe Premiere Pro用の高機能テロップエディタ

## ✨ 主な機能

### 🎨 基本機能
- 横書き・縦書きテキスト編集
- 文字単位のスタイル変更
- グラデーション塗り・複数ストローク
- 影・光沢エフェクト

### 🎯 複数選択・一括編集
- Ctrl/Shift+クリックで複数選択
- ドラッグ矩形選択
- 一括プロパティ変更
- グループ化機能

### 🎭 プリセット・テンプレート ⭐NEW
- スタイルプリセット保存/読込
- テンプレート管理
- デフォルトプリセット内蔵
- インポート/エクスポート対応

### 📊 バッチ処理 ⭐NEW
- CSV一括生成
- 字幕ファイル（SRT/Premiere XML）対応
- 音声文字起こし（Web Speech API / 外部API）
- テンプレート変数置換
- 一括書き出し

### 🎬 アニメーション強化 ⭐NEW
- キーフレームシステム
- 15種類のイージング
- アニメーションプリセット
- Premiere Pro連携

### ⚡ パフォーマンス最適化 ⭐NEW
- レンダリングキャッシュ
- オフスクリーンキャンバスプール
- メモリ自動管理
- 仮想スクロール

### 🔌 Premiere Pro連携
- CEPエクステンション
- タイムライン直接追加
- 自動フォント読み込み
- ExtendScript API

## 📦 ファイル構成

```
PRTL01/
├── telop-editor/
│   ├── new_index.html          # メインエディタ
│   ├── presets.js              # プリセット管理
│   ├── batch.js                # バッチ処理
│   ├── animation.js            # アニメーション
│   └── performance.js          # パフォーマンス最適化
├── telop-editor-cep/           # CEPエクステンション
│   ├── CSXS/manifest.xml       # エクステンション設定
│   ├── client/                 # パネルUI
│   └── host/index.jsx          # ExtendScript
├── FEATURES.md                 # 詳細機能一覧
└── README.md                   # このファイル
```

## 🚀 使い方

### スタンドアローン版
1. `telop-editor/new_index.html` をブラウザで開く
2. テロップを作成・編集
3. PNG/MP4/プロジェクトファイルとして書き出し

### CEPエクステンション版

**簡単インストール（推奨）:**

Windows:
```cmd
cd telop-editor-cep
右クリック install.bat → 管理者として実行
```

macOS:
```bash
# 方法1: PKGインストーラー（推奨 - GUIで簡単）
cd telop-editor-cep
bash build-mac-pkg.sh
# 生成された package/TelopEditor-macOS.pkg をダブルクリック

# 方法2: シェルスクリプト
sudo bash install.sh
```

Linux:
```bash
cd telop-editor-cep
sudo bash install.sh
```

**ZXPパッケージインストール（クロスプラットフォーム）:**
```bash
# パッケージビルド
cd telop-editor-cep
bash package-zxp.sh  # または package-zxp.bat

# インストール
# Anastasiy's Extension Manager を使用:
# https://install.anastasiy.com/
```

詳細: [CEPインストールガイド](telop-editor-cep/INSTALL.md)

**使い方:**
1. Premiere Proで起動（ウィンドウ > エクステンション > Telop Editor）
2. テロップ作成・編集
3. タイムラインに直接追加可能

## 📚 ドキュメント

- [詳細機能一覧](FEATURES.md)
- [CEPインストールガイド](telop-editor-cep/INSTALL.md)
- [CEP README](telop-editor-cep/README.md)

## 🔧 必要要件

### スタンドアローン版
- Chrome/Edge（推奨）
- Firefox/Safari

### CEPエクステンション版
- Adobe Premiere Pro CC 2020以降
- Windows 10/11 または macOS 10.14+

## 📝 更新履歴

### v1.1.0 (2025-11-20)
- ⭐ プリセット・テンプレート機能追加
- ⭐ バッチ処理機能追加（CSV/SRT/Premiere XML対応）
- ⭐ 音声文字起こし機能（Web Speech API / 外部API対応）
- ⭐ アニメーション強化（キーフレーム・イージング）
- ⭐ パフォーマンス最適化実装
- ✅ フォント読み込み改善
- ✅ 複数選択バグ修正

### v1.0.0 (2025-11-20)
- 初回リリース
- 複数レイヤー同時選択・一括編集
- .telop形式プロジェクトファイル
- CEPエクステンション基盤

## 📄 ライセンス

MIT License

## 🤝 コントリビュート

バグ報告や機能要望は GitHub Issues へお願いします。

---

© 2025 Telop Editor. All rights reserved.
