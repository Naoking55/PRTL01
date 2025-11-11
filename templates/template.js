// ベーシックなPRTLテンプレート (1920x1080, 1テキスト)
export const BASIC_TEMPLATE = `<?xml version="1.0" encoding="UTF-16"?>
<PremiereData Version="3">
  <TitleSpecifics>
    <Width>1920</Width>
    <Height>1080</Height>
    <PixelAspectRatio>1</PixelAspectRatio>
    <FieldType>progressiveScan</FieldType>
    <AudioStreamSpecs>
      <NumAudioStreams>0</NumAudioStreams>
    </AudioStreamSpecs>
    <DrawObjects>
      <NumDrawObjects>1</NumDrawObjects>
      <DrawObject Index="0">
        <DrawClassName>cTextDraw</DrawClassName>
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
    </DrawObjects>
    <TextLines>
      <NumTextLines>1</NumTextLines>
      <TextLine Index="0">
        <RunCount>12</RunCount>
        <Text>Sample Title</Text>
        <DispPrevTextStyles>1</DispPrevTextStyles>
        <TextStyleArraySize>1</TextStyleArraySize>
        <TextStyle Index="0">
          <RunStart>0</RunStart>
          <RunCount>12</RunCount>
          <DispPrevTextStyles>1</DispPrevTextStyles>
          <FontName>Arial</FontName>
          <FontSize>100</FontSize>
          <FontFace>Regular</FontFace>
          <FontColor>255 255 255</FontColor>
          <PainterStyleID>4099</PainterStyleID>
        </TextStyle>
        <MarginArraySize>0</MarginArraySize>
        <VerticalAlignmentAttribute>center</VerticalAlignmentAttribute>
        <HorizontalAlignmentAttribute>center</HorizontalAlignmentAttribute>
        <LeadingType>auto</LeadingType>
        <LeadingValue>120</LeadingValue>
        <BaselineShift>0</BaselineShift>
        <LineBasedParagraphAlignment>false</LineBasedParagraphAlignment>
      </TextLine>
    </TextLines>
    <MergeGroups>
      <NumMergeGroups>0</NumMergeGroups>
    </MergeGroups>
    <PainterStyles>
      <NumPainterStyles>1</NumPainterStyles>
      <PainterStyle ID="4099">
        <annotation>65538</annotation>
        <PainterStyleArraySize>1</PainterStyleArraySize>
        <PainterStyle Index="0">
          <PainterClassName>cPainterSolidColor</PainterClassName>
          <enablePainting>true</enablePainting>
          <paintingMethod>compositeColorBehind</paintingMethod>
          <paintingRange>normalLayout</paintingRange>
          <SolidColorPainterAttributes>
            <SolidColorColor>255 255 255</SolidColorColor>
          </SolidColorPainterAttributes>
        </PainterStyle>
      </PainterStyle>
    </PainterStyles>
    <ShaderReferences>
      <NumShaderReferences>1</NumShaderReferences>
      <ShaderReference ID="4240">
        <annotation>131073</annotation>
        <ShaderReferenceArraySize>1</ShaderReferenceArraySize>
        <ShaderReference Index="0">
          <fragmentName>flatLit</fragmentName>
          <placeHolderShaderIndex>4294967295</placeHolderShaderIndex>
          <eFragmentType>0</eFragmentType>
          <painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix>
          <alpha>255</alpha>
        </ShaderReference>
      </ShaderReference>
    </ShaderReferences>
    <SafeArea>
      <SafeAction>0.1</SafeAction>
      <SafeTitle>0.2</SafeTitle>
    </SafeArea>
    <TXMarker>Booyah</TXMarker>
  </TitleSpecifics>
</PremiereData>`;
