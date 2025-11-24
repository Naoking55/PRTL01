# MOGRT書き出し対応 - クイックサマリー

## 結論：MOGRT対応に必要なもの

### 🔴 必須要件

1. **Adobe After Effects** (ソフトウェア)
   - ユーザーがインストールしている必要がある
   - または、サーバーサイドでライセンスを保有

2. **ExtendScript知識**
   - After Effectsの自動化スクリプト言語
   - JavaScript風の構文

3. **通信機構**
   - ブラウザ ↔ After Effects の通信
   - CEP (Common Extensibility Platform) または
   - ローカルサーバー経由

### 🟡 技術的課題

| 課題 | 難易度 | 解決策 |
|------|--------|--------|
| .aepファイルの生成 | ⭐⭐⭐⭐⭐ | ExtendScript APIを使用（推奨） |
| Essential Graphicsメタデータ | ⭐⭐⭐⭐ | `addToMotionGraphicsTemplate()` |
| ブラウザ↔AE通信 | ⭐⭐⭐ | CEPまたはローカルサーバー |
| ZIPアーカイブ作成 | ⭐ | 標準ライブラリで対応可能 |

---

## 実装アプローチの比較

### ❌ 非推奨：完全自動生成 (ブラウザのみ)

```
ブラウザ → .aep生成 → .aegraphic → .mogrt
```

**理由：**
- .aepはプロプライエタリなバイナリ形式
- リバースエンジニアリングが必要
- 実装難易度が極めて高い
- メンテナンス不可能

**実装難易度：** ⭐⭐⭐⭐⭐
**推奨度：** 0%

---

### ✅ 推奨：ExtendScript経由

```
ブラウザ → JSON → ExtendScript → After Effects → .mogrt
```

**理由：**
- Adobe公式API
- 安定性が高い
- バージョンアップに強い
- 実装例が豊富

**実装難易度：** ⭐⭐⭐
**推奨度：** 90%

**必要な実装：**

1. **ExtendScriptスクリプト** (After Effects側)
```javascript
function createMOGRT(data) {
    var comp = app.project.items.addComp(data.name, 1920, 1080, 1.0, 5, 30);
    var textLayer = comp.layers.addText(data.text);
    textLayer.property("Source Text").addToMotionGraphicsTemplate(comp);
    comp.exportAsMotionGraphicsTemplate(true, new File(data.output));
}
```

2. **通信ブリッジ** (ブラウザ ↔ After Effects)
   - CEP拡張機能（本格的）
   - またはローカルサーバー（簡易的）

3. **データ変換** (Canvas → After Effects形式)

**実装期間：** 1〜2ヶ月

---

### 🟡 次点：サーバーサイド変換

```
ブラウザ → サーバー → After Effects → .mogrt → ダウンロード
```

**理由：**
- クライアント環境に依存しない
- ユーザーはAfter Effects不要

**デメリット：**
- サーバーインフラが必要
- ライセンスコストが高い
- 運用コストが高い

**実装難易度：** ⭐⭐⭐⭐
**推奨度：** 50%
**実装期間：** 2〜3ヶ月

---

## 推奨実装戦略

### フェーズ1：PRTL完全実装（最優先）

**理由：**
- PRTLはXMLベースで実装が容易
- Premiere Proで直接使用可能
- MOGRTより実装が簡単

**実装すべき機能：**

```
✅ 基本テキスト情報 (実装済み)
⚠️ ストローク情報の完全実装
⚠️ シャドウ、グロスの実装
⚠️ グラデーション
⚠️ 複数テキストオブジェクト
⚠️ 図形要素
```

**参考ファイル：** `/home/user/PRTL01/PRTL_File_Analysis_Complete_Guide.md`

---

### フェーズ2：PRTL↔Premiere Pro連携ガイド

ユーザー向けドキュメントを整備：

1. PRTLファイルのPremiere Proへのインポート手順
2. Premiere ProでPRTLを編集する方法
3. Premiere ProからMOGRTへの変換手順

**実装期間：** 1週間

---

### フェーズ3：MOGRT対応検討

**前提条件：**
- PRTLが完全に動作している
- ユーザーからの強い要望がある
- After Effects所有率の調査結果

**実装方法：**
1. ExtendScriptベースの実装
2. CEP拡張機能またはローカルサーバー
3. 段階的リリース（ベータ版 → 正式版）

**実装期間：** 1〜2ヶ月

---

## 技術的詳細

### MOGRTファイル構造

```
sample.mogrt (ZIPアーカイブ)
├── definition.json
├── thumb.png
└── project.aegraphic (ZIPアーカイブ)
    ├── project.aep (After Effectsプロジェクト)
    ├── thumb.png
    └── preview.mp4
```

### ExtendScript API (重要なメソッド)

```javascript
// コンポジション作成
var comp = app.project.items.addComp(name, width, height, pixelAspect, duration, frameRate);

// テキストレイヤー追加
var textLayer = comp.layers.addText(text);

// Essential Graphicsに追加
property.addToMotionGraphicsTemplate(comp);
property.addToMotionGraphicsTemplateAs(comp, displayName);

// MOGRT書き出し
comp.exportAsMotionGraphicsTemplate(doOverWriteFileIfExisting, file);
```

---

## まとめ

### MOGRT対応は可能か？

**回答：可能だが、条件付き**

### 必要なもの

1. ✅ After Effects (ユーザーまたはサーバー)
2. ✅ ExtendScript実装
3. ✅ ブラウザ↔AE通信機構
4. ✅ 実装期間 (1〜2ヶ月)

### 推奨アクション

**今すぐ：**
1. ✅ PRTL形式の完全実装に注力
2. ✅ ストローク、シャドウ、グロスを追加
3. ✅ 参考PRTLとの完全互換性を確保

**次のステップ：**
1. ⚠️ ユーザー調査（After Effects所有率）
2. ⚠️ 需要の確認（MOGRT vs PRTL）
3. ⚠️ 実装の優先順位を決定

**将来的に：**
1. 🔵 ExtendScriptベースのMOGRT実装
2. 🔵 CEP拡張機能の開発
3. 🔵 サーバーサイド変換の検討

---

## 参考資料

### 公式ドキュメント
- [Adobe After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
- [Essential Graphics API Reference](https://ae-scripting.docsforadobe.dev/introduction/essentialgraphics.html)
- [Scripts in After Effects](https://helpx.adobe.com/after-effects/using/scripts.html)

### Web記事
- [The Complete MOGRT Guide for After Effects 2024](https://blog.frame.io/2024/08/12/mogrt-guide-after-effects-2024-motion-graphics-workflow/)
- [MOGRT File Extension - What is it?](https://filext.com/file-extension/MOGRT)
- [Creating MOGRTs in After Effects](https://aejuice.com/blog/how-to-create-mogrt-files-in-after-effects/)

### ツール・フレームワーク
- [Nexrender - After Effects Automation](https://github.com/inlife/nexrender)
- [MoDeck.io - MOGRT Automation Service](https://modeck.io/)

---

**最終更新：** 2025年11月24日
**作成者：** PRTL01プロジェクトチーム
