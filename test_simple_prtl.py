#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple PRTL Generator Test (LayoutEffectInfo修正版)
GUIなしで動作する簡易版
"""

import codecs

def generate_simple_prtl():
    """シンプルなPRTL生成（LayoutEffectInfo含む）"""

    # 公式サンプルと同じ構造（LayoutEffectInfo含む）
    xml_content = '''<?xml version="1.0" encoding="UTF-16" ?><Adobe_Root><Adobe_Title><Version>7.0</Version><Motion_Settings><Play_Forward>true</Play_Forward><Start_on_Screen>false</Start_on_Screen><Pre_Roll>0</Pre_Roll><Ease_In>0</Ease_In><End_off_Screen>false</End_off_Screen><Post_Roll>0</Post_Roll><Ease_Out>0</Ease_Out></Motion_Settings></Adobe_Title><InscriberLayouts Version="1.0"><Layout><LayoutEffectInfo Version="1"><EffectType>0</EffectType></LayoutEffectInfo><LayoutDimension Version="1"><pXPIXELS>1920</pXPIXELS><pYLINES>1080</pYLINES><pSCREENAR>1.0</pSCREENAR><growthDirection>growRightDown</growthDirection></LayoutDimension><LayoutAttributes><SafeTitleArea><left>0.10000000000000001</left><top>0.10000000000000001</top><right>0.90000000000000002</right><bottom>0.90000000000000002</bottom></SafeTitleArea><SafeActionArea><left>5.0000000000000003e-002</left><top>5.0000000000000003e-002</top><right>0.95000000000000007</right><bottom>0.95000000000000007</bottom></SafeActionArea></LayoutAttributes><Background Version="4"><ShaderReference>4098</ShaderReference><On>false</On><paintingRange>normalLayout</paintingRange></Background><TextDescriptions><TextDescription Reference="4098"><TypeSpec><size>414</size><txHeight>72.</txHeight><fifullName>Yu Gothic UI-Bold</fifullName><fifontFamilyName>Yu Gothic UI</fifontFamilyName><fifontStyle>Bold</fifontStyle><fifontType>6</fifontType></TypeSpec></TextDescription></TextDescriptions><Styles><Style ID="4096"><StyleBase Version="4"><type>50000</type><positionDominance>0</positionDominance><lineGradient>false</lineGradient><styleRef>4096</styleRef><faceDistortX>0.</faceDistortX><faceDistortY>0.</faceDistortY><shadow_softness>21.</shadow_softness><personality>0</personality><linked>false</linked><EmbellishmentSizeRule>false</EmbellishmentSizeRule><PainterRampType>Basic</PainterRampType></StyleBase><FragmentList Version="5"><Fragment><size>30.</size><offset>0.</offset><angle>0.</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>2</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>4</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10</painterMix></Fragment><Fragment><size>0.</size><offset>0.</offset><angle>0.</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>65538</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix></Fragment><Fragment><size>0.</size><offset>7.</offset><angle>311.424</angle><ghost>false</ghost><isExtendedShadowFragment>true</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>true</fragmentOff><placeHolder>false</placeHolder><annotation>65537</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0</painterMix></Fragment></FragmentList><ShaderList Version="1"><ShaderRef PainterNumber="10"><shaderRef>4108</shaderRef></ShaderRef><ShaderRef PainterNumber="15"><shaderRef>4097</shaderRef></ShaderRef><ShaderRef PainterNumber="0"><shaderRef>4109</shaderRef></ShaderRef></ShaderList></Style></Styles><Shaders><Shader Version="4" cReference="4097"><textureRef>4098</textureRef><colorOption>4</colorOption><shaderOn>true</shaderOn><glintSize>100.</glintSize><glintOffset>0.</glintOffset><rampPosTop>75.</rampPosTop><rampPosBottom>25.</rampPosBottom><rampAngle>0.</rampAngle><bevelBalance>0.</bevelBalance><rampCycle>0</rampCycle><classicStyle>0</classicStyle><rampType>0</rampType><ColorSpec index="0"><red>255</red><green>215</green><blue>0</blue><xpar>99</xpar></ColorSpec><ColorSpec index="1"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="2"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="3"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><ColorSpec index="4"><red>3</red><green>3</green><blue>3</blue><xpar>0</xpar></ColorSpec><glintAngle>265.</glintAngle><bevelSize>0.</bevelSize><bevelDirection>0</bevelDirection><bevelPipe>false</bevelPipe><bevelAngle>0.</bevelAngle><bevelShape>1.</bevelShape><bevelShining>0.</bevelShining><bevelLight>false</bevelLight><bevelMerge>true</bevelMerge><sheenOn>false</sheenOn></Shader><Shader Version="4" cReference="4108"><textureRef>4098</textureRef><colorOption>0</colorOption><shaderOn>true</shaderOn><ColorSpec index="0"><red>80</red><green>51</green><blue>0</blue><xpar>0</xpar></ColorSpec><glintAngle>0.</glintAngle><bevelSize>0.</bevelSize><sheenOn>false</sheenOn></Shader><Shader Version="4" cReference="4109"><textureRef>4098</textureRef><colorOption>0</colorOption><shaderOn>true</shaderOn><ColorSpec index="0"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec><glintAngle>0.</glintAngle><bevelSize>0.</bevelSize><sheenOn>false</sheenOn></Shader></Shaders><Textures><Texture Version="1" cReference="4098"><pixelAspect>1.</pixelAspect><angle>0.</angle><scaleX>1.</scaleX><scaleY>1.</scaleY><centerX>0.</centerX><centerY>0.</centerY></Texture></Textures><VLS><FileReference Version="1"><fileString></fileString><seClass>2</seClass><seCode>1000</seCode></FileReference></VLS><Layers><Layer><TextPage><TextChain><ChainProperty Version="9"><wordWrap>false</wordWrap><Position><x>960</x><y>540</y></Position><Size><x>315.31458522981484</x><y>139.26905187016439</y></Size><leading>0.</leading><lockedLinesX>true</lockedLinesX><lockedLinesY>true</lockedLinesY><boxCanGrow>false</boxCanGrow><tabModeStyle>Word</tabModeStyle></ChainProperty><TextLine Version="2" objectID="1" persistentID="1"><BaseProperties Version="5"><txBase>590</txBase><XPos>960</XPos><angle>0.</angle><verticalText>false</verticalText><objectLeading>0.</objectLeading></BaseProperties><EnclosingObjectType>block</EnclosingObjectType><Alignment>center</Alignment><TRString>テスト タイトル</TRString><RunLengthEncodedCharacterAttributes><CharacterAttributes RunCount="9" StyleRef="4096" TextRef="4098" TXKerning="0." TXPostKerning="0." BaselineShifting="0." /></RunLengthEncodedCharacterAttributes><tagName></tagName></TextLine></TextChain></TextPage></Layer></Layers></Layout></InscriberLayouts></Adobe_Root>'''

    output_file = "test_fixed_with_layouteffectinfo.prtl"

    # UTF-16LE + BOMで保存
    with open(output_file, 'wb') as f:
        f.write(codecs.BOM_UTF16_LE)
        f.write(xml_content.encode('utf-16le'))

    print("=" * 70)
    print("✅ LayoutEffectInfo修正版 PRTLファイル生成成功")
    print("=" * 70)
    print()
    print(f"📄 ファイル名: {output_file}")
    print(f"📐 解像度: 1920×1080 (Full HD)")
    print(f"📝 テキスト: テスト タイトル")
    print(f"🎨 色: ゴールド (RGB 255, 215, 0)")
    print(f"🔤 フォント: Yu Gothic UI Bold, 72pt")
    print(f"💾 エンコーディング: UTF-16LE + BOM")
    print()
    print("🔍 重要な修正点:")
    print("   ✅ <LayoutEffectInfo Version=\"1\"><EffectType>0</EffectType></LayoutEffectInfo>")
    print("   ✅ 公式サンプル（Contemporary low3.prtl）と同じ構造")
    print()

    # ファイルの先頭部分を確認
    with open(output_file, 'rb') as f:
        header = f.read(1000)
        if b'LayoutEffectInfo' in header:
            print("✅ 検証: LayoutEffectInfoが正しく含まれています")
        else:
            print("⚠️  警告: LayoutEffectInfoが見つかりません")

    print()
    print("=" * 70)
    print("📝 Adobe Premiere Pro 15.4.5 での確認手順:")
    print("=" * 70)
    print("1. Premiere Proを起動")
    print("2. プロジェクトパネルで右クリック")
    print("3. [読み込み] を選択")
    print(f"4. {output_file} を選択")
    print("5. タイムラインにドラッグ&ドロップ")
    print("6. 文字「テスト タイトル」が表示されることを確認")
    print()
    print("🎯 期待される結果:")
    print("   - 画面中央にゴールド色の文字が表示される")
    print("   - 文字に黒いストローク（縁取り）が付いている")
    print("   - 文字が正しく読める")
    print()

    return output_file

if __name__ == "__main__":
    generate_simple_prtl()
