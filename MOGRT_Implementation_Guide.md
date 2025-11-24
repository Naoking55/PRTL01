# MOGRT書き出し機能 実装ガイド

## 目次
1. [MOGRT概要](#mogrt概要)
2. [MOGRTファイル構造](#mogrtファイル構造)
3. [実装に必要な要素](#実装に必要な要素)
4. [実装アプローチの比較](#実装アプローチの比較)
5. [推奨実装戦略](#推奨実装戦略)
6. [技術的課題](#技術的課題)
7. [代替案](#代替案)

---

## MOGRT概要

### MOGRTとは
**MOGRT** (Motion Graphics Template) は、Adobe After EffectsとAdobe Premiere Proで使用できるモーショングラフィックステンプレートファイル形式です。

### PRTLとの比較

| 項目 | PRTL | MOGRT |
|------|------|-------|
| 作成ツール | Premiere Pro (レガシータイトル) | After Effects |
| ファイル形式 | XML (UTF-16 LE) | ZIP archive (nested) |
| 複雑度 | シンプル | 非常に複雑 |
| アニメーション | 限定的 | 完全対応 |
| エフェクト | 基本的 | 高度 |
| 公式仕様書 | なし | なし |
| プログラム生成 | 可能 (XMLベース) | 困難 (プロプライエタリ) |

---

## MOGRTファイル構造

### 階層構造

```
sample.mogrt (ZIPアーカイブ)
├── sample.aegraphic (ZIPアーカイブ)
│   ├── sample.aep (After Effectsプロジェクト)
│   ├── メタデータファイル
│   ├── プレビュー画像
│   └── その他リソース
└── manifest情報
```

### 詳細な内部構造

```
.mogrt ファイル (ZIP)
│
├── project.aegraphic (ZIP)
│   │
│   ├── project.aep (After Effects Project - バイナリ)
│   │   ├── コンポジション情報
│   │   ├── レイヤー構造
│   │   ├── エフェクト設定
│   │   ├── キーフレームデータ
│   │   └── エクスプレッション
│   │
│   ├── Essential Graphics メタデータ
│   │   ├── コントロール定義 (JSON形式)
│   │   ├── カスタマイズ可能なプロパティ
│   │   └── プロパティのグルーピング
│   │
│   ├── プレビュー素材
│   │   ├── thumb.png (サムネイル)
│   │   └── preview.mp4 (プレビュー動画)
│   │
│   └── リソース
│       ├── フォント参照情報
│       ├── 画像・映像素材
│       └── オーディオファイル
│
├── definition.json
│   ├── テンプレート名
│   ├── バージョン情報
│   ├── 互換性情報
│   └── プロパティ定義
│
└── thumb.png (メインサムネイル)
```

### 実際のファイル構造例

MOGRTファイルの拡張子を `.mogrt.zip` に変更して解凍すると以下のような構造になります：

```
MyTitle.mogrt
├── definition.json          # テンプレート定義
├── thumb.png               # サムネイル画像
└── project.aegraphic       # コア部分（これもZIP）

project.aegraphic (解凍後)
├── project.aep             # After Effectsプロジェクト
├── thumb.png               # プレビュー画像
├── preview.mp4             # プレビュー動画（オプション）
└── [その他リソース]
```

### definition.json の例

```json
{
  "version": "1.0",
  "name": "MyTitle",
  "author": "Author Name",
  "description": "タイトルテンプレート",
  "category": "Titles",
  "properties": {
    "text": {
      "type": "string",
      "default": "サンプルテキスト",
      "displayName": "テキスト"
    },
    "fontSize": {
      "type": "number",
      "default": 100,
      "min": 10,
      "max": 500,
      "displayName": "フォントサイズ"
    },
    "color": {
      "type": "color",
      "default": [1, 0.84, 0, 1],
      "displayName": "テキストカラー"
    }
  }
}
```

---

## 実装に必要な要素

### 1. After Effectsプロジェクト (.aep) の生成

**必要な知識:**
- After Effectsのプロジェクト構造
- バイナリファイル形式（非公開仕様）
- レイヤー、コンポジション、エフェクトのデータ構造

**難易度:** ⭐⭐⭐⭐⭐ (極めて困難)

**理由:**
- .aepはAdobe独自のバイナリ形式
- 公式の仕様書が存在しない
- リバースエンジニアリングが必要

### 2. Essential Graphics メタデータの生成

**必要な知識:**
- Essential Graphics APIの理解
- プロパティのエクスポート方法
- UIコントロールの定義

**難易度:** ⭐⭐⭐⭐ (困難)

**理由:**
- 内部形式が非公開
- After EffectsのGUIを通じてのみ作成可能

### 3. ZIPアーカイブの構築

**必要な知識:**
- ZIP形式の作成
- ファイル階層の構築
- 適切な拡張子の設定

**難易度:** ⭐ (簡単)

**理由:**
- 標準的なZIP形式
- ライブラリが豊富

### 4. Adobe Creative Cloud互換性の確保

**必要な知識:**
- バージョン管理
- 互換性チェック
- マニフェスト形式

**難易度:** ⭐⭐⭐ (中程度)

---

## 実装アプローチの比較

### アプローチ1: 完全自動生成 (ブラウザ/Python)

```
ブラウザ/Python
    ↓
After Effectsプロジェクト(.aep)を生成
    ↓
Essential Graphicsメタデータを生成
    ↓
.aegraphicにZIP圧縮
    ↓
.mogrtにZIP圧縮
    ↓
完成
```

**メリット:**
- ユーザーがAfter Effectsを持っていなくても動作
- 完全自動化

**デメリット:**
- .aepの内部形式が非公開
- リバースエンジニアリングが必要
- 実装難易度が極めて高い
- メンテナンスコストが高い
- Adobe側のバージョンアップで動作しなくなるリスク

**実装難易度:** ⭐⭐⭐⭐⭐ (極めて困難)

**実装期間:** 6ヶ月〜1年以上

---

### アプローチ2: ExtendScript/JSX経由 (After Effects自動化)

```
ブラウザ/Python
    ↓
テンプレートデータを生成 (JSON)
    ↓
ExtendScriptに送信
    ↓
After Effectsを自動操作
    ↓
Essential Graphicsパネルで書き出し
    ↓
.mogrt完成
```

**メリット:**
- Adobe公式のスクリプトAPI
- 安定性が高い
- バージョンアップに強い

**デメリット:**
- ユーザーがAfter Effectsを所有・インストールしている必要がある
- After Effectsを起動する必要がある
- ライセンス認証が必要

**実装難易度:** ⭐⭐⭐ (中程度)

**実装期間:** 1〜2ヶ月

**実装例:**
```javascript
// ExtendScript (After Effects)
function createMOGRTFromData(data) {
    // 新規コンポジションを作成
    var comp = app.project.items.addComp(
        data.name,
        data.width,
        data.height,
        1.0,
        data.duration,
        data.frameRate
    );

    // テキストレイヤーを作成
    var textLayer = comp.layers.addText(data.text);
    var textProp = textLayer.property("Source Text");
    var textDocument = textProp.value;
    textDocument.fontSize = data.fontSize;
    textDocument.fillColor = data.color;
    textDocument.font = data.fontName;
    textProp.setValue(textDocument);

    // 位置を設定
    textLayer.property("Position").setValue([data.x, data.y]);

    // Essential Graphics パネルに追加
    var controlName = "Text - " + textLayer.name;
    textProp.addToMotionGraphicsTemplateAs(comp, controlName);

    // 位置もEssential Graphicsに追加
    textLayer.property("Position").addToMotionGraphicsTemplateAs(comp, "Position - " + textLayer.name);

    // MOGRTテンプレート名を設定
    comp.motionGraphicsTemplateName = data.name;

    // Essential Graphicsパネルを開く（オプション）
    comp.openInEssentialGraphics();

    // MOGRT書き出し
    var outputFile = new File(data.outputPath);
    return comp.exportAsMotionGraphicsTemplate(true, outputFile);
}

// 使用例
var templateData = {
    name: "MyTitle",
    width: 1920,
    height: 1080,
    duration: 5,
    frameRate: 30,
    text: "サンプルテキスト",
    fontSize: 100,
    color: [1, 0.84, 0], // RGB (0-1 range)
    fontName: "Arial",
    x: 960,
    y: 540,
    outputPath: "/path/to/output.mogrt"
};

createMOGRTFromData(templateData);
```

**JavaScriptからExtendScriptを呼び出す方法:**

```javascript
// ブラウザ側 (JavaScript)
async function exportMOGRT() {
    const canvas = getCurrentCanvas();
    const textObjects = canvas.textObjects;

    // After Effects用のデータを準備
    const mogrtData = {
        name: "Title_" + Date.now(),
        width: canvas.width,
        height: canvas.height,
        duration: 5,
        frameRate: 30,
        textObjects: textObjects.map(obj => ({
            text: obj.text,
            fontSize: obj.fontSize,
            color: [obj.color.r / 255, obj.color.g / 255, obj.color.b / 255],
            fontName: obj.fontFamily,
            x: obj.x,
            y: obj.y
        })),
        outputPath: "/path/to/output.mogrt"
    };

    // ExtendScriptを呼び出す
    // 注: これにはAfter Effectsとの通信機構が必要
    // CEP (Common Extensibility Platform) または
    // ローカルサーバー経由での通信が必要

    // 方法1: CEP拡張機能を使用
    if (window.cep) {
        const script = generateExtendScript(mogrtData);
        window.cep.evalScript(script, function(result) {
            if (result === "true") {
                alert("MOGRT書き出しが完了しました！");
            } else {
                alert("エラー: " + result);
            }
        });
    }

    // 方法2: ローカルサーバー経由
    else {
        const response = await fetch('http://localhost:3000/generate-mogrt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mogrtData)
        });

        if (response.ok) {
            const blob = await response.blob();
            downloadFile(blob, mogrtData.name + ".mogrt");
        }
    }
}

function generateExtendScript(data) {
    return `
        (function() {
            var data = ${JSON.stringify(data)};
            // ExtendScript code here
            return createMOGRTFromData(data);
        })();
    `;
}
```

---

### アプローチ3: サーバーサイド変換 (クラウドAPI)

```
ブラウザ
    ↓
サーバーにリクエスト送信
    ↓
サーバー側でAfter Effectsを実行
    ↓
MOGRT生成
    ↓
ダウンロードURLを返す
```

**メリット:**
- クライアント側の環境に依存しない
- 高度な処理が可能

**デメリット:**
- サーバーインフラが必要
- After Effectsライセンスコスト
- レンダリング時間がかかる
- 運用コストが高い

**実装難易度:** ⭐⭐⭐⭐ (困難)

**実装期間:** 2〜3ヶ月

**必要なもの:**
- サーバー (AWS, GCP, Azure)
- After Effectsライセンス (自動実行用)
- API設計
- キュー管理システム

---

### アプローチ4: サードパーティAPI利用

既存のMOGRT生成サービスを利用:
- **MoDeck.io**: After Effectsテンプレート自動化サービス
- その他商用API

**メリット:**
- 実装が簡単
- メンテナンス不要

**デメリット:**
- 月額費用が発生
- カスタマイズ性が低い
- サービス依存のリスク

**実装難易度:** ⭐ (簡単)

**実装期間:** 1週間

---

## 推奨実装戦略

### 短期的推奨 (現実的アプローチ)

**PRTL形式を優先し、MOGRTは段階的に対応**

```
Phase 1: PRTL完全実装 (優先度: 高)
  ├── ✅ 基本的なPRTL書き出し (実装済み)
  ├── ⚠️ スタイル情報の完全実装
  ├── ⚠️ エフェクト情報の実装
  └── ⚠️ アニメーション情報の実装

Phase 2: 変換ツール提供 (優先度: 中)
  ├── PRTLからPremiere Proへのインポート手順書
  ├── Premiere ProからMOGRTへの変換ガイド
  └── バッチ処理スクリプトの提供

Phase 3: MOGRT対応検討 (優先度: 低)
  ├── ExtendScriptベースの実装調査
  ├── ユーザー環境の確認 (After Effects所有率)
  └── 費用対効果の分析
```

### 中期的推奨 (本格実装)

**アプローチ2: ExtendScript/JSX経由**

理由:
1. **安定性**: Adobe公式API
2. **メンテナンス性**: バージョンアップに強い
3. **実装難易度**: 現実的な範囲
4. **品質**: 完全なMOGRT生成

実装ステップ:
```
Step 1: ExtendScriptの学習
├── After Effects Scripting Guide の読解
├── Essential Graphics API の理解
└── サンプルスクリプトの作成

Step 2: ブリッジの構築
├── ブラウザ → After Effects通信
├── JSON形式でのデータ転送
└── エラーハンドリング

Step 3: テンプレート生成
├── コンポジション作成
├── テキストレイヤー追加
├── エフェクト適用
└── Essential Graphicsへの追加

Step 4: MOGRT書き出し
├── exportAsMotionGraphicsTemplate()
├── プレビュー生成
└── バリデーション
```

---

## 技術的課題

### 課題1: After Effectsプロジェクトのバイナリ形式

**.aepファイルの構造:**
- プロプライエタリなバイナリ形式
- 公式仕様書なし
- リバースエンジニアリングが必要

**解決策:**
- ExtendScript APIを使用 (推奨)
- または既存の.aepをテンプレートとして使用

### 課題2: Essential Graphics メタデータ

**問題:**
- 内部形式が非公開
- GUIを通じてのみ編集可能

**解決策:**
- ExtendScriptの `addToMotionGraphicsTemplate()` を使用

### 課題3: バージョン互換性

**問題:**
- After Effectsのバージョンによる差異
- Premiere Proとの互換性

**解決策:**
- 最新版を基準に実装
- バージョン情報をマニフェストに記載

### 課題4: ライセンスとコスト

**問題:**
- After Effectsライセンスが必要
- 自動化にはAPI実行環境が必要

**解決策:**
- エンドユーザーがAfter Effectsを所有していることを前提とする
- またはサーバーサイドでライセンスを一元管理

---

## 代替案

### 代替案1: PRTLの完全実装を優先

**理由:**
- PRTLはXMLベースで実装が容易
- Premiere Proで直接使用可能
- アニメーション不要な場合は十分

**実装優先度:**
```
✅ 基本テキスト情報 (実装済み)
⚠️ ストローク、シャドウ、グロス
⚠️ 複雑なレイアウト
⚠️ 図形要素
⚠️ グラデーション
```

### 代替案2: PNG/GIF/WebM書き出し

**現在の実装:**
- PNG書き出し: 実装済み
- GIF書き出し: 実装済み
- WebM書き出し: 実装済み

**メリット:**
- 完全に動作する
- After Effects不要
- どの編集ソフトでも使用可能

**デメリット:**
- テキスト編集不可 (ラスタライズされる)
- 再編集には元データが必要

### 代替案3: 段階的な機能提供

```
現在: PNG/GIF/WebM
    ↓
次: PRTL (基本)
    ↓
次: PRTL (完全)
    ↓
将来: MOGRT (ExtendScript経由)
```

---

## まとめ

### MOGRT書き出しに必要なもの

#### 最低限必要:
1. ✅ After Effects (ソフトウェア)
2. ✅ ExtendScript知識
3. ✅ Essential Graphics APIの理解
4. ✅ ZIPアーカイブ生成機能

#### 理想的には必要:
5. ⚠️ サーバー環境 (クラウド実行の場合)
6. ⚠️ After Effectsライセンス (自動化用)
7. ⚠️ レンダリングキュー管理
8. ⚠️ エラーハンドリング機構

### 推奨される実装順序

**優先度1 (緊急):** PRTL形式の完全実装
- ストローク、シャドウ、グロスの実装
- 参考PRTLとの完全互換性

**優先度2 (重要):** ドキュメント・ガイドの整備
- PRTLからPremiere Proへのインポート手順
- Premiere ProからMOGRTへの変換ガイド

**優先度3 (将来):** MOGRT対応
- ExtendScriptベースの実装
- After Effects自動化

### 現実的な結論

**MOGRTの完全な自動生成は、以下の理由から推奨しません:**
1. 実装難易度が極めて高い
2. .aep形式がプロプライエタリ
3. メンテナンスコストが高い
4. After Effects環境が必要

**推奨アプローチ:**
1. **短期**: PRTLの完全実装に注力
2. **中期**: ExtendScriptベースのMOGRT生成を検討
3. **長期**: サーバーサイド変換サービスの構築を検討

---

**参考資料:**
- [Adobe After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
- [Essential Graphics Panel API](https://ae-scripting.docsforadobe.dev/introduction/essentialgraphics.html)
- [Nexrender - After Effects Automation](https://github.com/inlife/nexrender)
- [MoDeck.io - MOGRT Automation Service](https://modeck.io/)

---

**最終更新**: 2025年11月24日
**作成者**: PRTL01プロジェクトチーム
