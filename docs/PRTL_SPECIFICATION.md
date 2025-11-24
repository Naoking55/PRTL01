# PRTL ファイル仕様書

## 概要

PRTL (Premiere Title) は、Adobe Premiere Pro のレガシータイトル機能で使用されるXML形式のファイルフォーマットです。テキストオブジェクトのスタイル、配置、色、縁取り、影などの情報を保存します。

## ファイル基本情報

### エンコーディング

- **文字エンコーディング**: UTF-16 LE (Little Endian)
- **BOM**: 必須 (0xFF 0xFE)
- **XMLヘッダー**: `<?xml version="1.0" encoding="UTF-16" ?>`

### ファイル拡張子

- `.prtl`

## XML構造

### ルート構造

```xml
<Adobe_Root>
  <Adobe_Title>...</Adobe_Title>
  <InscriberLayouts Version="1.0">
    <Layout>...</Layout>
  </InscriberLayouts>
</Adobe_Root>
```

## 主要セクション

### 1. Adobe_Title

モーション設定を含むタイトル全体の設定。

```xml
<Adobe_Title>
  <Version>20080702</Version>
  <Motion_Settings>
    <Play_Forward>true</Play_Forward>
    <Start_on_Screen>false</Start_on_Screen>
    <Pre_Roll>0</Pre_Roll>
    <Ease_In>0</Ease_In>
    <End_off_Screen>false</End_off_Screen>
    <Post_Roll>0</Post_Roll>
    <Ease_Out>0</Ease_Out>
  </Motion_Settings>
</Adobe_Title>
```

#### 要素説明

| 要素 | 説明 | デフォルト値 |
|------|------|--------------|
| `Version` | PRTLファイルのバージョン | 20080702 |
| `Play_Forward` | 順方向再生 | true |
| `Start_on_Screen` | 画面上で開始 | false |
| `Pre_Roll` | プリロール時間 | 0 |
| `Ease_In` | イーズイン | 0 |
| `End_off_Screen` | 画面外で終了 | false |
| `Post_Roll` | ポストロール時間 | 0 |
| `Ease_Out` | イーズアウト | 0 |

### 2. LayoutDimension（解像度設定）

キャンバスの解像度とアスペクト比を定義します。

```xml
<LayoutDimension Version="2">
  <pXPIXELS>1920</pXPIXELS>
  <pYLINES>1080</pYLINES>
  <pSCREENAR>1</pSCREENAR>
  <growthDirection>growRightDown</growthDirection>
</LayoutDimension>
```

#### 要素説明

| 要素 | 説明 | 一般的な値 |
|------|------|------------|
| `pXPIXELS` | 横解像度（ピクセル） | 1920, 3840 |
| `pYLINES` | 縦解像度（ピクセル） | 1080, 2160 |
| `pSCREENAR` | スクリーンアスペクト比 | 1 (1:1) |
| `growthDirection` | テキスト成長方向 | growRightDown |

### 3. SafeArea（セーフエリア設定）

タイトルセーフエリアとアクションセーフエリアの定義。

```xml
<LayoutAttributes>
  <SafeTitleArea>
    <left>0.1</left>
    <top>0.1</top>
    <right>0.9</right>
    <bottom>0.9</bottom>
  </SafeTitleArea>
  <SafeActionArea>
    <left>0.05</left>
    <top>0.05</top>
    <right>0.95</right>
    <bottom>0.95</bottom>
  </SafeActionArea>
</LayoutAttributes>
```

#### 値の説明

- 値は0.0〜1.0の範囲で、画面全体に対する比率を表します
- タイトルセーフエリア: 10%マージン
- アクションセーフエリア: 5%マージン

### 4. TextDescriptions（フォント定義）

テキストで使用されるフォントとタイプフェイスを定義します。

```xml
<TextDescriptions Version="4">
  <TextDescription Reference="4097">
    <TypeSpec>
      <size>616</size>
      <txHeight>75</txHeight>
      <txKern>0</txKern>
      <baselineShift>0</baselineShift>
      <leading>0</leading>
      <txSCaps>75</txSCaps>
      <txSCapsOn>false</txSCapsOn>
      <txSlant>0</txSlant>
      <txUnderline>false</txUnderline>
      <txWidth>67.5</txWidth>
      <linked>false</linked>
      <fiBold>0</fiBold>
      <fiItalic>0</fiItalic>
      <fifullName>KurokaneStd-EB</fifullName>
      <fifontFamilyName>FOT-くろかね Std</fifontFamilyName>
      <fifontStyle>EB</fifontStyle>
      <fifontType>6</fifontType>
      <ficategory>1</ficategory>
    </TypeSpec>
  </TextDescription>
</TextDescriptions>
```

#### 主要要素

| 要素 | 説明 | 備考 |
|------|------|------|
| `Reference` | フォント定義のID | 4096以降の連番 |
| `size` | フォントサイズ（PRTL単位） | 実際のサイズ×8の近似値 |
| `txHeight` | テキスト高さ（%） | 75〜100 |
| `txKern` | カーニング値 | 0=デフォルト |
| `txWidth` | テキスト幅（%） | 67.5=標準 |
| `fifullName` | フォントフルネーム | PostScript名 |
| `fifontFamilyName` | フォントファミリー名 | 表示名 |
| `fifontStyle` | フォントスタイル | Regular, Bold, EB等 |
| `fifontType` | フォントタイプ | 5=TrueType, 6=OpenType |

### 5. Styles（スタイル定義）

テキストの視覚効果（縁取り、影など）を定義します。

```xml
<Style ID="4096">
  <StyleBase Version="4">
    <type>50000</type>
    <positionDominance>0</positionDominance>
    <lineGradient>false</lineGradient>
    <styleRef>4096</styleRef>
    <faceDistortX>0</faceDistortX>
    <faceDistortY>0</faceDistortY>
    <shadow_softness>30</shadow_softness>
    <personality>0</personality>
    <linked>false</linked>
    <EmbellishmentSizeRule>false</EmbellishmentSizeRule>
    <PainterRampType>Basic</PainterRampType>
  </StyleBase>
  <FragmentList Version="5">
    <!-- Fragmentsはここに続く -->
  </FragmentList>
  <ShaderList Version="1">
    <!-- ShaderRefsはここに続く -->
  </ShaderList>
</Style>
```

#### Fragment構造

Fragmentは、テキストの各レイヤー（縁取り、本体、影）を定義します。

##### Fragment要素の順序（重要）

Fragmentは**外側から内側**の順序で定義されます：

1. **ストロークレイヤー（外側→内側）**: `annotation="1"`, `"2"`, `"3"`, `"4"`...
2. **メインテキスト**: `annotation="65538"`
3. **影**: `annotation="65537"`

```xml
<Fragment>
  <size>78</size>
  <offset>0</offset>
  <angle>0</angle>
  <ghost>false</ghost>
  <isExtendedShadowFragment>false</isExtendedShadowFragment>
  <eFragmentType>2</eFragmentType>
  <fragmentOff>false</fragmentOff>
  <placeHolder>false</placeHolder>
  <annotation>4</annotation>
  <placeHolderShaderIndex>4294967295</placeHolderShaderIndex>
  <painterMix>10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10</painterMix>
</Fragment>
```

##### Fragment要素の説明

| 要素 | 説明 | 値の範囲 |
|------|------|----------|
| `size` | ストロークの太さ（直径） | 0〜200 |
| `offset` | 影のオフセット距離 | 0〜100 |
| `angle` | 影の角度 | -180〜180度 |
| `eFragmentType` | フラグメントタイプ | 0=メイン/影, 2=ストローク |
| `fragmentOff` | レイヤーの有効/無効 | true/false |
| `annotation` | レイヤーの種類 | 1-4=ストローク, 65538=メイン, 65537=影 |
| `painterMix` | 使用するPainterの番号 | 10-13=ストローク, 15=メイン, 0=影 |

##### annotation値の対応表

| annotation値 | レイヤーの種類 | 説明 |
|--------------|----------------|------|
| 1 | 最内側ストローク | メインテキストに最も近いストローク |
| 2 | 内側ストローク | 2番目のストローク |
| 3 | 外側ストローク | 3番目のストローク |
| 4 | 最外側ストローク | 最も外側のストローク |
| 65538 | メインテキスト | テキスト本体 |
| 65537 | 影 | ドロップシャドウ |

##### painterMix値とPainterNumber

`painterMix`は16個の数値を空白区切りで並べたもので、各Painterに対応します。

```xml
<!-- ストローク4 (最外側) -->
<painterMix>10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10</painterMix>

<!-- ストローク3 -->
<painterMix>11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11</painterMix>

<!-- ストローク2 -->
<painterMix>12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12</painterMix>

<!-- ストローク1 (最内側) -->
<painterMix>13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13</painterMix>

<!-- メインテキスト -->
<painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix>

<!-- 影 -->
<painterMix>0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0</painterMix>
```

#### ShaderList（色定義参照）

ShaderListは、各PainterNumberに対応する色（Shader）を指定します。

```xml
<ShaderList Version="1">
  <ShaderRef PainterNumber="2"><shaderRef>0</shaderRef></ShaderRef>
  <!-- ... -->
  <ShaderRef PainterNumber="10"><shaderRef>4096</shaderRef></ShaderRef>
  <ShaderRef PainterNumber="11"><shaderRef>4097</shaderRef></ShaderRef>
  <ShaderRef PainterNumber="12"><shaderRef>4107</shaderRef></ShaderRef>
  <ShaderRef PainterNumber="13"><shaderRef>4108</shaderRef></ShaderRef>
  <ShaderRef PainterNumber="15"><shaderRef>4111</shaderRef></ShaderRef>
  <ShaderRef PainterNumber="-1"><shaderRef>4112</shaderRef></ShaderRef>
  <!-- ... -->
</ShaderList>
```

| PainterNumber | 用途 |
|---------------|------|
| 10 | ストローク4（最外側）の色 |
| 11 | ストローク3の色 |
| 12 | ストローク2の色 |
| 13 | ストローク1（最内側）の色 |
| 15 | メインテキストの色 |
| -1 | 影の色 |
| 0 | 影の色（代替） |

### 6. Shaders（色定義）

各ストローク、テキスト本体、影の色を定義します。

```xml
<Shader Version="4">
  <cReference>4096</cReference>
  <textureRef>4096</textureRef>
  <colorOption>4</colorOption>
  <shaderOn>true</shaderOn>
  <glintSize>10</glintSize>
  <glintOffset>0</glintOffset>
  <rampPosTop>75</rampPosTop>
  <rampPosBottom>25</rampPosBottom>
  <rampAngle>0</rampAngle>
  <bevelBalance>0</bevelBalance>
  <rampCycle>0</rampCycle>
  <classicStyle>0</classicStyle>
  <rampType>0</rampType>
  <ColorSpec index="0"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>
  <ColorSpec index="1"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>
  <ColorSpec index="2"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>
  <ColorSpec index="3"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>
  <ColorSpec index="4"><red>250</red><green>250</green><blue>250</blue><xpar>0</xpar></ColorSpec>
  <glintAngle>0</glintAngle>
  <bevelSize>0</bevelSize>
  <bevelDirection>0</bevelDirection>
  <bevelPipe>false</bevelPipe>
  <bevelAngle>0</bevelAngle>
  <bevelShape>1</bevelShape>
  <bevelShining>0</bevelShining>
  <bevelLight>false</bevelLight>
  <bevelMerge>true</bevelMerge>
  <sheenOn>false</sheenOn>
</Shader>
```

#### 主要要素

| 要素 | 説明 | 備考 |
|------|------|------|
| `cReference` | Shader ID | StyleのShaderListから参照される |
| `colorOption` | カラーオプション | 4=標準色 |
| `ColorSpec index="4"` | **実際の色** | RGB値（0-255） |
| `ColorSpec index="0"` | 代替色 | RGB値（0-255） |
| `xpar` | 透明度 | 0=不透明, 127=半透明 |

**重要**: `ColorSpec index="4"`が実際に使用される色です。

### 7. Layers（レイヤー構造）

テキストオブジェクトの配置と構造を定義します。

```xml
<Layers>
  <Layer>
    <DrawPage></DrawPage>
    <TextPage>
      <TextChain>...</TextChain>
    </TextPage>
    <MergeGroups>
      <Group groupID="1">
        <punchThru>false</punchThru>
        <opacity>1</opacity>
        <ObjectID value="1" />
      </Group>
    </MergeGroups>
  </Layer>
</Layers>
```

#### 構造説明

- `DrawPage`: 図形オブジェクト用（通常は空）
- `TextPage`: テキストオブジェクト用
- `MergeGroups`: オブジェクトのグループ化と不透明度

### 8. TextChain（テキスト内容と配置）

実際のテキスト内容、位置、サイズを定義します。

```xml
<TextChain>
  <ChainProperty Version="9">
    <wordWrap>false</wordWrap>
    <Position><x>11.2289</x><y>18.9468</y></Position>
    <Size><x>1161.58</x><y>75</y></Size>
    <leading>0</leading>
    <lockedLinesX>true</lockedLinesX>
    <lockedLinesY>true</lockedLinesY>
    <boxCanGrow>false</boxCanGrow>
    <tabModeStyle>Word</tabModeStyle>
    <implicitTabSpacing>100</implicitTabSpacing>
    <implicitTabType>left</implicitTabType>
  </ChainProperty>
  <ChainTabs><TabList></TabList></ChainTabs>
  <TextLine Version="2" objectID="1" persistentID="3">
    <BaseProperties Version="5">
      <txBase>75.4758</txBase>
      <XPos>11.2289</XPos>
      <angle>0</angle>
      <verticalText>false</verticalText>
      <objectLeading>0</objectLeading>
    </BaseProperties>
    <EnclosingObjectType>block</EnclosingObjectType>
    <Alignment>left</Alignment>
    <RTL>false</RTL>
    <TRString>OCHA NORMA 広本瑠璃&amp;筒井澪心</TRString>
    <RunLengthEncodedCharacterAttributes>
      <CharacterAttributes RunCount="11" StyleRef="4097" TextRef="4097" TXKerning="0" TXPostKerning="0" BaselineShifting="0"/>
      <CharacterAttributes RunCount="3" StyleRef="4096" TextRef="4097" TXKerning="0" TXPostKerning="0" BaselineShifting="0"/>
      <!-- ... -->
    </RunLengthEncodedCharacterAttributes>
    <tagName></tagName>
  </TextLine>
</TextChain>
```

#### ChainProperty（テキストボックスの設定）

| 要素 | 説明 | 値の例 |
|------|------|--------|
| `Position` | テキストボックスの左上座標 | x, y（ピクセル） |
| `Size` | テキストボックスのサイズ | x, y（ピクセル） |
| `wordWrap` | 自動改行 | true/false |
| `lockedLinesX` | 横方向ロック | true/false |
| `lockedLinesY` | 縦方向ロック | true/false |
| `boxCanGrow` | ボックス拡張 | true/false |

#### TextLine（テキスト行の設定）

| 要素 | 説明 | 値の例 |
|------|------|--------|
| `objectID` | オブジェクトID | 1, 2, 3... |
| `persistentID` | 永続ID | 3, 4, 5... |
| `txBase` | ベースライン高さ | 50〜100 |
| `XPos` | X座標 | 0〜1920 |
| `angle` | 回転角度 | -180〜180度 |
| `verticalText` | 縦書き | true/false |
| `Alignment` | 配置 | left, center, right |
| `RTL` | 右から左 | true/false（アラビア語等） |

#### TRString（テキスト内容）

実際のテキスト内容を含みます。XML特殊文字はエスケープされます。

| 文字 | エスケープ後 |
|------|--------------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

#### RunLengthEncodedCharacterAttributes（文字属性）

連続する文字に適用されるスタイルとフォント。

```xml
<CharacterAttributes
  RunCount="11"
  StyleRef="4097"
  TextRef="4097"
  TXKerning="0"
  TXPostKerning="0"
  BaselineShifting="0"/>
```

| 属性 | 説明 |
|------|------|
| `RunCount` | この属性が適用される文字数 |
| `StyleRef` | 使用するStyleのID |
| `TextRef` | 使用するTextDescriptionのID |
| `TXKerning` | カーニング値 |
| `TXPostKerning` | 文字間カーニング |
| `BaselineShifting` | ベースラインシフト |

## 実装時の注意点

### 1. エンコーディング

- ファイルは**UTF-16 LE（BOM付き）**でエンコードする必要があります
- XMLヘッダーでは`encoding="UTF-16"`と宣言します
- ただし、実際のファイルによってはUTF-8で保存されている場合もあります（互換性のため両方対応推奨）

### 2. ID管理

- Reference ID、Style ID、Shader IDは通常4096から開始します
- 各オブジェクト、スタイル、シェーダーにユニークなIDを割り当てます
- IDの連番管理が重要です

### 3. Fragment順序

- **Fragmentは外側→内側の順序**で定義します
- ストローク4（最外側）→ ストローク3 → ストローク2 → ストローク1（最内側） → メインテキスト → 影
- この順序を守らないと正しくレンダリングされません

### 4. 色の指定

- `ColorSpec index="4"`が実際に使用される色です
- RGB値は0-255の範囲で指定します
- 透明度は`xpar`で指定（0=不透明、127=半透明、255=完全透明）

### 5. サイズとスケーリング

- PRTLのフォントサイズ（`size`）は、実際のピクセルサイズとは異なる単位です
- 目安：`size = 実際のサイズ × 8`程度
- ストロークの`size`は**直径**です（半径ではありません）

### 6. 座標系

- 原点(0, 0)は左上
- 座標はピクセル単位
- 回転角度は度数法（-180〜180度）

## サンプルコード

### 基本的なPRTL生成（JavaScript）

```javascript
const prtlXML = `<?xml version="1.0" encoding="UTF-16" ?>
<Adobe_Root>
  <Adobe_Title>
    <Version>20080702</Version>
    <Motion_Settings>
      <Play_Forward>true</Play_Forward>
      <Start_on_Screen>false</Start_on_Screen>
      <Pre_Roll>0</Pre_Roll>
      <Ease_In>0</Ease_In>
      <End_off_Screen>false</End_off_Screen>
      <Post_Roll>0</Post_Roll>
      <Ease_Out>0</Ease_Out>
    </Motion_Settings>
  </Adobe_Title>
  <InscriberLayouts Version="1.0">
    <Layout>
      <!-- LayoutDimension, TextDescriptions, Styles, Shaders, Layers... -->
    </Layout>
  </InscriberLayouts>
</Adobe_Root>`;

// UTF-16 LE (BOM付き) でエンコード
const encoder = new TextEncoder();
const utf8Array = encoder.encode(prtlXML);
const blob = new Blob([utf8Array], { type: 'application/octet-stream' });
```

## 参考資料

- Adobe Premiere Pro レガシータイトル機能
- 参考PRTLファイル: `/参考PRTL/*.prtl`
- 実装コード:
  - `/telop-editor/prtl-generator.js` - PRTL生成
  - `/telop-editor/prtl-import.js` - PRTL読み込み
  - `/telop-editor/prtl-export.js` - PRTL書き出し

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2025-11-24 | 1.0 | 初版作成 |
