# Adobe Premiere Pro PRTLファイル 完全解析ガイド

## 目次
1. [基本情報](#基本情報)
2. [ファイル構造概要](#ファイル構造概要)
3. [主要構成要素](#主要構成要素)
4. [重要な発見事項](#重要な発見事項)
5. [日本語表示問題](#日本語表示問題)
6. [クラッシュ要因分析](#クラッシュ要因分析)
7. [安全な編集ガイドライン](#安全な編集ガイドライン)
8. [自動生成システム構築の提案](#自動生成システム構築の提案)

---

## 基本情報

### PRTLファイルとは
Adobe Premiere Proのレガシータイトル機能で使用されるタイトルテンプレートファイル。ビデオ編集プロジェクトでテキストタイトルやグラフィック要素を作成するために使用される。

### 基本仕様

| 項目 | 詳細 |
|------|------|
| ファイル形式 | XMLベース |
| 文字エンコーディング | UTF-16 LE (BOM付き) |
| ファイル先頭 | `ff fe 3c 00 3f 00 78 00` |
| ファイル末尾 | `6f 00 6f 00 74 00 3e 00` |
| 圧縮 | なし（Zlib圧縮は使用されていない） |

### サンプルファイル分析結果

**Info Screen 1003.prtl**
- ファイルサイズ: 155,914バイト（約152.26KB）
- テキスト要素: 6個のタイトル（"Title One"〜"Title Six"）
- 図形要素: 2本の横線、1個の背景矩形

**Balloons2 list.prtl**
- drawObjects: 2
- textLines: 7（6個のリストアイテム + 1個のタイトル）
- mergeGroups: 4
- 外部テクスチャ参照: `balloons_creditsBkgd.tga`

---

## ファイル構造概要

### XMLアーキテクチャの階層構造

```xml
<?xml version="1.0" encoding="UTF-16"?>
<PremiereData Version="3">
  <TitleSpecifics>
    <Width>●●●</Width>
    <Height>●●●</Height>
    <PixelAspectRatio>●●●</PixelAspectRatio>
    <FieldType>●●●</FieldType>
    <AudioStreamSpecs>...</AudioStreamSpecs>
    
    <!-- 描画オブジェクト -->
    <DrawObjects>
      <NumDrawObjects>●</NumDrawObjects>
      <DrawObject Index="●">
        <DrawClassName>●●●</DrawClassName>
        <DrawObjectPaintingRange>●●●</DrawObjectPaintingRange>
        <!-- テキスト or 図形の定義 -->
      </DrawObject>
    </DrawObjects>
    
    <!-- テキストライン -->
    <TextLines>
      <NumTextLines>●</NumTextLines>
      <TextLine Index="●">
        <RunCount>●●</RunCount>
        <Text>●●●●●●●●●●●●●●</Text>
        <DispPrevTextStyles>...</DispPrevTextStyles>
        <!-- スタイル定義 -->
      </TextLine>
    </TextLines>
    
    <!-- 結合グループ -->
    <MergeGroups>
      <NumMergeGroups>●</NumMergeGroups>
      <MergeGroup Index="●">
        <!-- レイヤー結合情報 -->
      </MergeGroup>
    </MergeGroups>
    
    <!-- ペインタースタイル -->
    <PainterStyles>
      <NumPainterStyles>●●</NumPainterStyles>
      <PainterStyle ID="●●●●">
        <!-- 色、エフェクト定義 -->
      </PainterStyle>
    </PainterStyles>
    
    <!-- シェーダー参照 -->
    <ShaderReferences>
      <NumShaderReferences>●●</NumShaderReferences>
      <ShaderReference ID="●●●●">
        <!-- シェーダー設定 -->
      </ShaderReference>
    </ShaderReferences>
  </TitleSpecifics>
</PremiereData>
```

---

## 主要構成要素

### 1. TitleSpecifics（解像度設定）★★★★★

解像度に応じた設定が異なる。

| 解像度 | Width | Height | PixelAspectRatio | FieldType |
|--------|-------|--------|------------------|-----------|
| 720x480 (NTSC) | 720 | 480 | 0.9 | upperField |
| 720x576 (PAL) | 720 | 576 | 1.067 | upperField |
| 1280x720 (HD) | 1280 | 720 | 1.0 | progressiveScan |
| 1920x1080 (Full HD) | 1920 | 1080 | 1.0 | upperField or progressiveScan |
| 3840x2160 (4K UHD) | 3840 | 2160 | 1.0 | progressiveScan |

**注意**: 解像度変更時は、Width、Height、PixelAspectRatio、FieldType を同時に更新する必要がある。

### 2. DrawObjects（描画オブジェクト）★★★★★

テキストと図形（矩形、楕円など）を管理。

```xml
<DrawObject Index="0">
  <DrawClassName>cTextDraw</DrawClassName>  <!-- テキスト -->
  <DrawObjectPaintingRange>normalLayout</DrawObjectPaintingRange>
  <DrawObjectLayoutInfo>
    <TextLineReferenceArraySize>1</TextLineReferenceArraySize>
    <TextLineReferenceIndex0>0</TextLineReferenceIndex0>
  </DrawObjectLayoutInfo>
  <DrawObjectPosition>
    <HorizontalPos>960</HorizontalPos>
    <VerticalPos>540</VerticalPos>
  </DrawObjectPosition>
</DrawObject>

<DrawObject Index="1">
  <DrawClassName>cRectangleDraw</DrawClassName>  <!-- 矩形 -->
  <DrawObjectPaintingRange>normalLayout</DrawObjectPaintingRange>
  <DrawObjectLayoutInfo>
    <ShaderReferenceID>4240</ShaderReferenceID>
  </DrawObjectLayoutInfo>
  <DrawObjectPosition>
    <HorizontalPos>960</HorizontalPos>
    <VerticalPos>100</VerticalPos>
  </DrawObjectPosition>
  <DrawObjectSize>
    <Width>1920</Width>
    <Height>200</Height>
  </DrawObjectSize>
</DrawObject>
```

**DrawClassName の種類**:
- `cTextDraw`: テキスト
- `cRectangleDraw`: 矩形（線を描く場合も高さ1〜2pxの矩形として定義）
- `cEllipseDraw`: 楕円
- `cPolygonDraw`: 多角形

### 3. TextLines（テキスト情報）★★★★★

```xml
<TextLine Index="0">
  <RunCount>12</RunCount>  <!-- 重要: 文字数+1または特定ルール -->
  <Text>Title One</Text>
  <DispPrevTextStyles>1</DispPrevTextStyles>
  <TextStyleArraySize>1</TextStyleArraySize>
  
  <TextStyle Index="0">
    <RunStart>0</RunStart>
    <RunCount>12</RunCount>  <!-- 全TextLineのRunCountが12に統一される現象 -->
    <DispPrevTextStyles>1</DispPrevTextStyles>
    <FontName>Times New Roman</FontName>
    <FontSize>100</FontSize>
    <FontFace>BoldFace</FontFace>
    <FontColor>255 215 0</FontColor>  <!-- RGB値 -->
    <PainterStyleID>4099</PainterStyleID>
  </TextStyle>
  
  <MarginArraySize>0</MarginArraySize>
  <VerticalAlignmentAttribute>top</VerticalAlignmentAttribute>
  <HorizontalAlignmentAttribute>center</HorizontalAlignmentAttribute>
  <LeadingType>auto</LeadingType>
  <LeadingValue>120</LeadingValue>
  <BaselineShift>0</BaselineShift>
  <LineBasedParagraphAlignment>false</LineBasedParagraphAlignment>
</TextLine>
```

#### **RunCount 調整ルールの発見**
- 実際の文字数に関係なく、全TextLineの`RunCount`が`12`に統一される現象が観測された
- 理由は不明だが、Premiere Pro内部の文字列処理ルールに起因する可能性が高い
- **自動生成時の推奨**: `文字数 + 1` または既存テンプレートの値を継承

### 4. PainterStyles（スタイル定義）★★★★

テキストや図形に適用される視覚エフェクト。

```xml
<PainterStyle ID="4099">
  <annotation>65538</annotation>  <!-- 65538: メインテキスト要素 -->
  <PainterStyleArraySize>1</PainterStyleArraySize>
  
  <PainterStyle Index="0">
    <PainterClassName>cPainterSolidColor</PainterClassName>
    <enablePainting>true</enablePainting>
    <paintingMethod>compositeColorBehind</paintingMethod>
    <paintingRange>normalLayout</paintingRange>
    <SolidColorPainterAttributes>
      <SolidColorColor>255 215 0</SolidColorColor>  <!-- ゴールド色 -->
    </SolidColorPainterAttributes>
  </PainterStyle>
</PainterStyle>

<PainterStyle ID="4100">
  <annotation>65537</annotation>  <!-- 65537: ドロップシャドウ -->
  <PainterStyleArraySize>1</PainterStyleArraySize>
  
  <PainterStyle Index="0">
    <PainterClassName>cPainterDropShadow</PainterClassName>
    <enablePainting>true</enablePainting>
    <paintingMethod>compositeColorBehind</paintingMethod>
    <DropShadowPainterAttributes>
      <DropShadowColor>0 0 0 153</DropShadowColor>  <!-- RGBA -->
      <DropShadowAngle>135</DropShadowAngle>
      <DropShadowDistance>10</DropShadowDistance>
      <DropShadowBlurRadius>5</DropShadowBlurRadius>
    </DropShadowPainterAttributes>
  </PainterStyle>
</PainterStyle>
```

**annotation値のマッピング**:
- `65538`: メインテキスト要素
- `65537`: ドロップシャドウ
- `65539`-`65540`: エフェクトレイヤー

### 5. ShaderReferences（シェーダー参照）★★★

図形やテクスチャに適用されるシェーダー設定。

```xml
<ShaderReference ID="4240">
  <annotation>131073</annotation>
  <ShaderReferenceArraySize>1</ShaderReferenceArraySize>
  
  <ShaderReference Index="0">
    <fragmentName>flatLit</fragmentName>
    <placeHolderShaderIndex>4294967295</placeHolderShaderIndex>  <!-- マジックナンバー -->
    <eFragmentType>0</eFragmentType>
    <painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix>
    <alpha>255</alpha>
  </ShaderReference>
</ShaderReference>
```

**fragmentName の種類**:
- `flatLit`: 基本的なフラット描画
- `textured`: テクスチャ適用
- `gradientFill`: グラデーション塗りつぶし

**eFragmentType の分類**:
- `0`: 基本描画
- `5`: 特殊エフェクト（角度-45°、size=0の設定と組み合わせ）

### 6. SafeArea（セーフエリア設定）★★

```xml
<SafeArea>
  <SafeAction>0.1</SafeAction>  <!-- 10% -->
  <SafeTitle>0.2</SafeTitle>    <!-- 20% -->
</SafeArea>
```

### 7. 外部リソース参照（VLS）★★★

外部テクスチャファイルを参照する場合。

```xml
<VLS>
  <SEClass>2</SEClass>
  <SECode>1001</SECode>
  <MiscOptions>5</MiscOptions>
  <FilePath>C:\Program Files\Adobe\Premiere Pro\Presets\Textures\balloons_creditsBkgd.tga</FilePath>
</VLS>
```

### 8. 未解明制御機構★

```xml
<placeHolderShaderIndex>4294967295</placeHolderShaderIndex>
<painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix>
<TXMarker>Booyah</TXMarker>  <!-- 用途不明だが複数のサンプルで確認 -->
```

これらはAdobe内部実装に関わるマジックナンバーで、変更すると予期せぬ動作を引き起こす可能性がある。

---

## 重要な発見事項

### 1. RunCount調整ルールの発見

**観察された現象**:
- 実際の文字数: 9文字（"Title One"）
- 設定されているRunCount: 12
- 他のTextLineでも同様に全て`12`に統一

**仮説**:
1. Premiere Pro内部で文字列処理時に固定バッファを使用している
2. 何らかの内部整合性チェックのための値
3. フォント描画エンジンの要件

**推奨対応**:
- 自動生成時は `文字数 + 1` を基本とする
- ただし、既存テンプレートの値を継承する方が安全

### 2. Fragment Type分類によるエフェクトシステムの体系化

| eFragmentType | 用途 | 典型的な設定 |
|---------------|------|-------------|
| 0 | 基本描画 | fragmentName="flatLit" |
| 5 | 特殊エフェクト | angle=-45, size=0, annotation=2 |

### 3. 図形の実装方式

**重要な発見**: 見た目上の「線」は、実際には高さ1〜2pxの矩形オブジェクトとして実装されている。

```xml
<!-- 横線の実装例 -->
<DrawObject Index="2">
  <DrawClassName>cRectangleDraw</DrawClassName>
  <DrawObjectSize>
    <Width>1920</Width>
    <Height>2</Height>  <!-- 高さ2pxで線を表現 -->
  </DrawObjectSize>
</DrawObject>
```

---

## 日本語表示問題

### 問題の原因特定

PRTLファイルで日本語を表示しようとすると以下の問題が発生する:

1. **フォント制限**
   - テンプレートで指定されているフォント（Times New Roman、Minion Proなど）は日本語をサポートしていない
   - 解決策: `FontName`を日本語対応フォント（MS Gothic、Meiryo、Noto Sans JPなど）に変更

2. **エンコーディング問題**
   - UTF-16 LEエンコーディングの処理が不完全な場合がある
   - BOM（Byte Order Mark）の正確な配置が必要

3. **RunCount計算の問題**
   - 日本語文字列の場合、バイト数と文字数の不一致が発生
   - マルチバイト文字の処理ルールが不明確

### 解決策

```xml
<TextStyle Index="0">
  <FontName>MS Gothic</FontName>  <!-- 日本語フォントに変更 -->
  <FontSize>100</FontSize>
  <Text>日本語タイトル</Text>
  <RunCount>8</RunCount>  <!-- 文字数(7) + 1 -->
</TextStyle>
```

**注意点**:
- フォント変更後も表示されない場合、Premiere Pro側でそのフォントがインストールされているか確認
- 文字数カウント時、全角文字も1文字としてカウント

---

## クラッシュ要因分析

### 主要なクラッシュパターン

1. **文字数変更によるクラッシュ**
   - 原因: RunCountの不整合
   - 対策: 文字列変更時は必ずRunCountも更新

2. **ID参照の不整合**
   - 原因: PainterStyleIDやShaderReferenceIDが存在しないIDを参照
   - 対策: 参照先のID定義を確認してから使用

3. **サイズ・チェックサムエラー**
   - 原因: 内部整合性チェックに失敗
   - 対策: テンプレートベースで最小限の変更に留める

4. **エンコーディングエラー**
   - 原因: UTF-16 LE以外のエンコーディングで保存
   - 対策: 必ずUTF-16 LE（BOM付き）で保存

### クラッシュを避けるための実験結果

| 操作 | 結果 | リスクレベル |
|------|------|-------------|
| 同文字数の英数字変更 | ✅ 正常表示 | 低 |
| 文字数を増やす | ⚠️ RunCount調整必要 | 中 |
| 日本語挿入 | ❌ 表示されない | 高 |
| 100バイト範囲削除 | ❌ 非表示だがクラッシュなし | 中 |
| 重複ブロック2箇所削除 | ❌ 完全非表示化 | 高 |

---

## 安全な編集ガイドライン

### ✅ 安全に変更可能な要素

1. **テキスト内容**（文字数を変えない場合）
   ```xml
   <Text>Title One</Text> → <Text>New Title</Text>
   ```

2. **位置情報**
   ```xml
   <HorizontalPos>960</HorizontalPos>
   <VerticalPos>540</VerticalPos>
   ```

3. **サイズ**
   ```xml
   <Width>1920</Width>
   <Height>200</Height>
   ```

4. **色**
   ```xml
   <SolidColorColor>255 215 0</SolidColorColor>
   <FontColor>255 0 0</FontColor>
   ```

5. **フォント設定**
   ```xml
   <FontName>Arial</FontName>
   <FontSize>120</FontSize>
   <FontFace>BoldFace</FontFace>
   ```

### ⚠️ 注意して変更すべき要素

1. **RunCount**
   - 文字数変更時は必ず更新
   - 推奨: `文字数 + 1`

2. **解像度設定**
   - Width、Height、PixelAspectRatio、FieldTypeを同時に変更

3. **エフェクト設定**
   - angle、size、offsetの組み合わせに依存関係あり

### ❌ 変更禁止の要素

1. **ファイルヘッダー**
   ```xml
   <?xml version="1.0" encoding="UTF-16"?>
   <PremiereData Version="3">
   ```

2. **マジックナンバー**
   ```xml
   <placeHolderShaderIndex>4294967295</placeHolderShaderIndex>
   ```

3. **painterMix配列**
   ```xml
   <painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix>
   ```

4. **内部制御要素**
   ```xml
   <TXMarker>Booyah</TXMarker>
   ```

5. **ID値の範囲**
   - PainterStyleID: 4000〜4999
   - ShaderReferenceID: 4000〜4999
   - 新規IDは既存の範囲内で未使用の値を選択

---

## 自動生成システム構築の提案

### アーキテクチャ方針

1. **テンプレートベースアプローチ**
   - ベースとなる安全なテンプレートを用意
   - 変更可能な要素のみを動的に更新
   - 制御要素は既存テンプレートから継承

2. **段階的実装**

   **Phase 1: ASCII文字対応**
   - 英数字のみのテンプレート生成
   - 基本的なレイアウト変更機能

   **Phase 2: 日本語対応準備**
   - CJK対応フォントでの実験
   - エンコーディング処理の最適化

   **Phase 3: 完全自動生成**
   - 任意のテキスト・レイアウトに対応
   - エフェクトのカスタマイズ機能

3. **バリデーション機能**
   ```python
   def validate_prtl(xml_tree):
       # RunCountと文字数の整合性チェック
       for textline in xml_tree.findall('.//TextLine'):
           text = textline.find('Text').text
           run_count = int(textline.find('RunCount').text)
           assert run_count >= len(text), "RunCount too small"
       
       # ID参照の一貫性検証
       style_ids = {style.get('ID') for style in xml_tree.findall('.//PainterStyle')}
       for reference in xml_tree.findall('.//PainterStyleID'):
           assert reference.text in style_ids, f"Invalid PainterStyleID: {reference.text}"
   ```

### 推奨ツール・ライブラリ

**Python実装例**:
```python
import xml.etree.ElementTree as ET

class PRTLGenerator:
    def __init__(self, template_path):
        self.tree = ET.parse(template_path)
        self.root = self.tree.getroot()
    
    def set_text(self, index, text):
        """テキストを設定（RunCountも自動調整）"""
        textline = self.root.find(f'.//TextLine[@Index="{index}"]')
        textline.find('Text').text = text
        run_count = len(text) + 1
        textline.find('RunCount').text = str(run_count)
        
        # TextStyle内のRunCountも更新
        for text_style in textline.findall('.//TextStyle'):
            text_style.find('RunCount').text = str(run_count)
    
    def set_position(self, draw_index, x, y):
        """描画オブジェクトの位置を設定"""
        draw_obj = self.root.find(f'.//DrawObject[@Index="{draw_index}"]')
        pos = draw_obj.find('.//DrawObjectPosition')
        pos.find('HorizontalPos').text = str(x)
        pos.find('VerticalPos').text = str(y)
    
    def set_color(self, style_id, r, g, b):
        """色を設定"""
        style = self.root.find(f'.//PainterStyle[@ID="{style_id}"]')
        color_elem = style.find('.//SolidColorColor')
        color_elem.text = f"{r} {g} {b}"
    
    def save(self, output_path):
        """UTF-16 LEで保存"""
        xml_str = ET.tostring(self.root, encoding='unicode')
        with open(output_path, 'w', encoding='utf-16-le') as f:
            f.write('\ufeff')  # BOM
            f.write(xml_str)

# 使用例
generator = PRTLGenerator('template.prtl')
generator.set_text(0, 'New Title')
generator.set_position(0, 960, 540)
generator.set_color('4099', 255, 0, 0)  # 赤色に変更
generator.save('output.prtl')
```

### セキュリティとエラーハンドリング

```python
class PRTLValidator:
    @staticmethod
    def validate_encoding(file_path):
        """UTF-16 LEエンコーディングを検証"""
        with open(file_path, 'rb') as f:
            bom = f.read(2)
            if bom != b'\xff\xfe':
                raise ValueError("Invalid BOM: File must be UTF-16 LE")
    
    @staticmethod
    def validate_structure(xml_tree):
        """XML構造の整合性を検証"""
        # 必須要素の存在確認
        required = ['TitleSpecifics', 'DrawObjects', 'TextLines']
        for elem in required:
            if xml_tree.find(f'.//{elem}') is None:
                raise ValueError(f"Missing required element: {elem}")
        
        return True
```

---

## 付録

### A. 解像度別テンプレート設定

```xml
<!-- 1920x1080 (Full HD) -->
<Width>1920</Width>
<Height>1080</Height>
<PixelAspectRatio>1</PixelAspectRatio>
<FieldType>progressiveScan</FieldType>

<!-- 3840x2160 (4K UHD) -->
<Width>3840</Width>
<Height>2160</Height>
<PixelAspectRatio>1</PixelAspectRatio>
<FieldType>progressiveScan</FieldType>

<!-- 720x480 (NTSC SD) -->
<Width>720</Width>
<Height>480</Height>
<PixelAspectRatio>0.9</PixelAspectRatio>
<FieldType>upperField</FieldType>
```

### B. 日本語対応フォント一覧

| フォント名 | 推奨用途 |
|-----------|---------|
| MS Gothic | 明朝体、汎用 |
| MS Mincho | 明朝体、フォーマル |
| Meiryo | ゴシック体、モダン |
| Yu Gothic | ゴシック体、読みやすい |
| Noto Sans JP | ゴシック体、多言語対応 |
| Hiragino Kaku Gothic Pro | Mac用、高品質 |

### C. エラーコード対応表

| エラーパターン | 原因 | 解決策 |
|--------------|------|--------|
| クラッシュ on load | RunCount不整合 | RunCountを文字数+1に修正 |
| 表示されない | フォント非対応 | 日本語フォントに変更 |
| 文字化け | エンコーディングエラー | UTF-16 LEで再保存 |
| ID参照エラー | 存在しないID参照 | ID定義を追加または参照を修正 |

### D. 参考リソース

- 過去のチャット分析（2025年6月20日）
  - [Adobe Premiere PRTL File Structure Analysis](https://claude.ai/chat/3522cf2c-5593-4f04-84d3-e81f45f20e28)
  - [詳細構造分析](https://claude.ai/chat/383607fb-bd03-478a-97fb-e4ad47670099)
  - [Balloons2サンプル分析](https://claude.ai/chat/d066686e-ff33-4de8-a673-8cae27e04126)
  - [構造解析ドキュメント](https://claude.ai/chat/0f0d369c-2d8f-4a15-bc4e-cce5397f02cd)

---

## まとめ

PRTLファイルは複雑な内部構造を持つが、テンプレートベースのアプローチにより自動生成が可能。

**成功の鍵**:
1. 既存テンプレートの制御要素を尊重
2. 変更可能な要素のみを動的に更新
3. 段階的な実装（ASCII → CJK対応）
4. 厳密なバリデーション機能

このガイドは、PRTLファイル生成システムの設計において極めて価値の高い基礎資料となる。特に「変更禁止要素」の明確な特定により、安全なファイル生成が可能になっている。

---

**最終更新**: 2025年11月11日  
**作成者**: NAOKI様からの過去チャット履歴分析に基づく