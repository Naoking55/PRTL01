# セッション引き継ぎ: PRTL完全実装 (TextChain + DrawObject + Style)

## 📋 実装タスク概要

**目標**: TextChain、DrawObject、Style の完全サポート実装

## 🎯 現在の状況

### ✅ 完了済み
1. **基本的なPRTLエクスポート機能** (`src/services/prtlExporter.ts`)
   - TextLayerの基本実装
   - DrawObjectの基本的なシェイプサポート (Rectangle, Ellipse)
   - TextChainの基本的なサポート

2. **MOGRTエクスポート機能** (`src/services/mogrtExporter.ts`)
   - 基本的なDrawObject対応
   - TextChainの基本サポート

3. **参照ファイルの準備**
   - `docs/reference-prtl-files/` に各種サンプルPRTLファイルを配置
   - サンプルデータ構造の分析完了

### 🔄 実装中・未完了

#### 1. TextChain の完全サポート
**ファイル**: `src/services/prtlExporter.ts`, `src/services/mogrtExporter.ts`

**必要な実装**:
```typescript
// TextChain プロパティの完全サポート
interface TextChain {
  // 基本プロパティ (実装済み)
  text: string;
  font: string;
  size: number;
  color: Color;

  // 未実装プロパティ
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;

  // テキスト配置
  align?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';

  // 高度なスタイリング
  letterSpacing?: number;
  lineHeight?: number;
  wordSpacing?: number;

  // テキスト変形
  scale?: { x: number; y: number };
  skew?: { x: number; y: number };

  // エフェクト
  shadow?: Shadow;
  stroke?: Stroke;
  gradient?: Gradient;

  // アニメーション
  animation?: Animation;
}
```

**参照ファイル**:
- `docs/reference-prtl-files/text-chain-*.prtl` (TextChainの各種サンプル)
- 既存実装: `src/services/prtlExporter.ts:200-250` (現在の TextChain 実装)

#### 2. DrawObject の完全サポート
**ファイル**: `src/services/prtlExporter.ts`, `src/services/mogrtExporter.ts`

**必要な実装**:
```typescript
// DrawObject シェイプタイプの完全サポート
type ShapeType =
  | 'Rectangle'    // ✅ 実装済み
  | 'Ellipse'      // ✅ 実装済み
  | 'Line'         // ❌ 未実装
  | 'Polygon'      // ❌ 未実装
  | 'Polyline'     // ❌ 未実装
  | 'Path'         // ❌ 未実装
  | 'Star'         // ❌ 未実装
  | 'Arc'          // ❌ 未実装
  | 'RoundRect'    // ❌ 未実装
  | 'Triangle';    // ❌ 未実装

// 各シェイプタイプの固有プロパティ
interface ShapeProperties {
  // Line
  line?: {
    start: Point;
    end: Point;
    thickness: number;
  };

  // Polygon/Star
  polygon?: {
    points: Point[];
    sides?: number;
    innerRadius?: number; // for Star
  };

  // Path
  path?: {
    d: string; // SVG path data
    closed?: boolean;
  };

  // RoundRect
  roundRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius: number;
  };

  // Arc
  arc?: {
    center: Point;
    radius: number;
    startAngle: number;
    endAngle: number;
  };
}
```

**参照ファイル**:
- `docs/reference-prtl-files/draw-object-*.prtl` (各シェイプタイプのサンプル)
- 既存実装: `src/services/prtlExporter.ts:300-400` (現在の DrawObject 実装)

#### 3. Style の完全サポート
**ファイル**: `src/services/prtlExporter.ts`, `src/services/mogrtExporter.ts`

**必要な実装**:
```typescript
// Style の完全実装
interface Style {
  // 基本スタイル (部分的に実装済み)
  fill?: Fill;
  stroke?: Stroke;

  // 未実装スタイル
  gradient?: Gradient;
  pattern?: Pattern;
  shadow?: Shadow;
  glow?: Glow;
  blur?: Blur;
  opacity?: number;
  blendMode?: BlendMode;
}

// Gradient サポート
interface Gradient {
  type: 'linear' | 'radial' | 'angular';
  stops: GradientStop[];
  // Linear
  start?: Point;
  end?: Point;
  // Radial
  center?: Point;
  radius?: number;
  // Angular
  angle?: number;
}

interface GradientStop {
  offset: number; // 0.0 - 1.0
  color: Color;
}

// Pattern サポート
interface Pattern {
  type: 'image' | 'texture';
  source: string; // base64 or URL
  repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  scale?: number;
}

// Shadow サポート
interface Shadow {
  color: Color;
  offset: { x: number; y: number };
  blur: number;
  spread?: number;
}

// Stroke の拡張
interface Stroke {
  color: Color;
  width: number;
  // 未実装プロパティ
  dashArray?: number[];
  dashOffset?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
  miterLimit?: number;
}
```

**参照ファイル**:
- `docs/reference-prtl-files/style-*.prtl` (各スタイルタイプのサンプル)
- `docs/reference-prtl-files/gradient-*.prtl` (グラデーションサンプル)

## 🛠️ 実装アプローチ

### フェーズ 1: TextChain 完全実装 (優先度: 高)
1. `src/services/prtlExporter.ts` の `exportTextChain()` メソッドを拡張
2. テキストスタイルプロパティの追加
3. テキストエフェクト（Shadow, Stroke, Gradient）の実装
4. テキストアニメーションのサポート

**実装箇所**:
```
src/services/prtlExporter.ts:200-250  // exportTextChain メソッド
src/types/prtl.ts                      // TextChain型定義の拡張
```

### フェーズ 2: DrawObject 完全実装 (優先度: 高)
1. `src/services/prtlExporter.ts` の `exportDrawObject()` メソッドを拡張
2. 各シェイプタイプのサポート追加
   - Line, Polygon, Path, Star, Arc, RoundRect, Triangle
3. シェイプ固有プロパティの実装

**実装箇所**:
```
src/services/prtlExporter.ts:300-400  // exportDrawObject メソッド
src/types/prtl.ts                      // DrawObject型定義の拡張
```

### フェーズ 3: Style 完全実装 (優先度: 高)
1. Gradient サポートの実装
   - Linear, Radial, Angular グラデーション
   - GradientStop の処理
2. Pattern サポートの実装
3. Shadow/Glow/Blur エフェクトの実装
4. BlendMode のサポート

**実装箇所**:
```
src/services/prtlExporter.ts:150-200  // Style関連メソッド
src/types/prtl.ts                      // Style型定義の拡張
```

## 📁 重要なファイル

### 実装対象ファイル
1. **`src/services/prtlExporter.ts`** - メインのPRTLエクスポートロジック
2. **`src/services/mogrtExporter.ts`** - MOGRTエクスポートロジック
3. **`src/types/prtl.ts`** - PRTL型定義
4. **`src/types/layer.ts`** - レイヤー型定義

### 参照ファイル
1. **`docs/reference-prtl-files/*.prtl`** - 実装参考用のサンプルPRTLファイル
   - `text-chain-basic.prtl` - 基本的なTextChain
   - `text-chain-styled.prtl` - スタイル付きTextChain
   - `draw-object-shapes.prtl` - 各種シェイプ
   - `style-gradient.prtl` - グラデーションスタイル
   - `style-effects.prtl` - エフェクトスタイル

2. **`docs/PRTL-format-specification.md`** - PRTLフォーマット仕様（もしあれば）

## 🧪 テスト方法

### 1. ユニットテスト作成
```bash
# テストファイルの作成/更新
src/services/__tests__/prtlExporter.test.ts
src/services/__tests__/mogrtExporter.test.ts
```

### 2. 手動テスト
```bash
# アプリケーションを起動
npm run dev

# テロップエディタで以下をテスト:
# 1. TextChain の各プロパティ（太字、斜体、配置など）
# 2. DrawObject の各シェイプタイプ
# 3. Style の各エフェクト（グラデーション、シャドウなど）
```

### 3. 出力検証
```bash
# エクスポートされたPRTLファイルを確認
# 参照ファイルと構造を比較
```

## 💡 実装のヒント

### TextChain 実装のヒント
```typescript
// フォントスタイルの変換例
const fontStyle = {
  bold: textChain.bold ? 'bold' : 'normal',
  italic: textChain.italic ? 'italic' : 'normal',
  weight: textChain.bold ? 700 : 400
};

// テキスト配置の変換
const textAlign = {
  left: 'start',
  center: 'middle',
  right: 'end',
  justify: 'justify'
}[textChain.align || 'left'];
```

### DrawObject 実装のヒント
```typescript
// シェイプタイプ別の処理
switch (drawObject.shapeType) {
  case 'Line':
    return this.exportLine(drawObject);
  case 'Polygon':
    return this.exportPolygon(drawObject);
  case 'Path':
    return this.exportPath(drawObject);
  // ... 他のシェイプタイプ
}

// Path データの変換 (SVG形式)
const pathData = drawObject.path?.d || 'M 0,0';
```

### Style 実装のヒント
```typescript
// グラデーションの処理
if (style.gradient) {
  const gradient = {
    type: style.gradient.type,
    stops: style.gradient.stops.map(stop => ({
      offset: stop.offset,
      color: this.colorToHex(stop.color)
    }))
  };

  if (style.gradient.type === 'linear') {
    gradient.start = style.gradient.start;
    gradient.end = style.gradient.end;
  } else if (style.gradient.type === 'radial') {
    gradient.center = style.gradient.center;
    gradient.radius = style.gradient.radius;
  }
}

// Shadow の処理
if (style.shadow) {
  return {
    color: this.colorToHex(style.shadow.color),
    offsetX: style.shadow.offset.x,
    offsetY: style.shadow.offset.y,
    blur: style.shadow.blur,
    spread: style.shadow.spread || 0
  };
}
```

## 🔍 デバッグ情報

### ログ出力の追加
```typescript
// エクスポート時の詳細ログ
console.log('[PRTL Export] TextChain:', JSON.stringify(textChain, null, 2));
console.log('[PRTL Export] DrawObject:', JSON.stringify(drawObject, null, 2));
console.log('[PRTL Export] Style:', JSON.stringify(style, null, 2));
```

### エラーハンドリング
```typescript
// エラー時の詳細情報
try {
  const exported = this.exportTextChain(textChain);
} catch (error) {
  console.error('[PRTL Export Error]', {
    error,
    textChain,
    stack: error.stack
  });
  throw error;
}
```

## 📊 進捗チェックリスト

### TextChain 実装
- [ ] 基本テキストプロパティ（font, size, color）
- [ ] テキストスタイル（bold, italic, underline, strikethrough）
- [ ] テキスト配置（align, verticalAlign）
- [ ] 文字間隔（letterSpacing, lineHeight, wordSpacing）
- [ ] テキスト変形（scale, skew）
- [ ] テキストエフェクト（shadow, stroke, gradient）
- [ ] アニメーション

### DrawObject 実装
- [x] Rectangle
- [x] Ellipse
- [ ] Line
- [ ] Polygon
- [ ] Polyline
- [ ] Path
- [ ] Star
- [ ] Arc
- [ ] RoundRect
- [ ] Triangle

### Style 実装
- [ ] Gradient (Linear, Radial, Angular)
- [ ] Pattern
- [ ] Shadow
- [ ] Glow
- [ ] Blur
- [ ] Opacity
- [ ] BlendMode
- [ ] Stroke拡張（dashArray, lineCap, lineJoin）

## 🚀 実装開始コマンド

```bash
# 1. ブランチ確認
git status

# 2. 参照ファイルの確認
ls -la docs/reference-prtl-files/

# 3. 実装対象ファイルを開く
# - src/services/prtlExporter.ts
# - src/services/mogrtExporter.ts
# - src/types/prtl.ts

# 4. 実装開始（フェーズ1から）
# TextChain の完全実装から始める
```

## 📝 コミット戦略

### コミットメッセージの例
```bash
git commit -m "feat: Add complete TextChain support with advanced styling"
git commit -m "feat: Add all DrawObject shape types support"
git commit -m "feat: Add complete Style support with gradients and effects"
git commit -m "test: Add comprehensive tests for PRTL export functionality"
```

### 最終プッシュ
```bash
git push -u origin claude/review-session-handoff-01YL9ku57gPXYiK387SU24n3
```

## ⚠️ 注意事項

1. **後方互換性**: 既存の基本実装を壊さないように注意
2. **型安全性**: TypeScript の型定義を適切に更新
3. **パフォーマンス**: 大量のオブジェクトをエクスポートする際のパフォーマンスに注意
4. **エラーハンドリング**: 不正なデータに対する適切なエラーハンドリング
5. **ドキュメント**: 実装した機能についてコメントやドキュメントを追加

## 🎯 成功基準

- [ ] TextChain の全プロパティが正しくエクスポートされる
- [ ] DrawObject の全シェイプタイプがサポートされる
- [ ] Style の全エフェクトが正しく適用される
- [ ] 参照PRTLファイルと同等の出力が生成される
- [ ] ユニットテストが全て通過する
- [ ] 既存機能が壊れていない

---

**次のセッションで最初に実行すべきこと**:
1. この引き継ぎドキュメントを読む
2. 参照ファイル (`docs/reference-prtl-files/`) の内容を確認
3. TextChain の完全実装から開始（フェーズ1）
4. 各実装後にコミット
5. 全実装完了後にプッシュ

頑張ってください！🚀
