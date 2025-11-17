#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRTL Generator - Premiere Pro Complete Compatible Version
legacy_title_editor_v636_fixed.pyの完全なPRTL生成機能を使用
"""

import sys
import codecs
import math
import re
from pathlib import Path
from typing import List, Optional
from dataclasses import dataclass

# パスを追加
sys.path.insert(0, str(Path(__file__).parent))


@dataclass
class TextLineData:
    """テキストオブジェクトデータ（完全版）"""
    object_id: int
    persistent_id: int
    text: str
    x: float
    y: float
    layer_order: int = 0
    style_ref: int = 4096
    text_ref: int = 4098
    alignment: str = "left"
    font_family: str = "Yu Gothic UI"
    font_style: str = "Bold"
    font_size: float = 64.0
    color_r: int = 255
    color_g: int = 251
    color_b: int = 214
    rotation: float = 0.0
    enable_stroke: bool = True
    enable_shadow: bool = False
    stroke_size: float = 30.0
    shadow_angle: float = 135.0
    shadow_distance: float = 7.0
    character_spacing: float = 0.0
    line_spacing: float = 0.0
    baseline_shift: float = 0.0

    @property
    def run_count(self) -> int:
        """UTF-16対応RunCount"""
        return len(self.text) + 1


@dataclass
class LayoutDimension:
    """レイアウト解像度"""
    width: int = 1920
    height: int = 1080
    screen_ar: float = 1.0
    growth_direction: str = "growRightDown"


class PRTLGeneratorComplete:
    """Premiere Pro完全互換PRTL生成クラス"""

    def __init__(self):
        self.layout = LayoutDimension()
        self.text_lines: List[TextLineData] = []
        self.next_object_id = 1
        self.next_persistent_id = 1

    def add_text_line(self, text: str, x: float, y: float, **kwargs) -> TextLineData:
        """テキスト行追加"""
        layer_order = kwargs.pop('layer_order', len(self.text_lines))

        text_line = TextLineData(
            object_id=self.next_object_id,
            persistent_id=self.next_persistent_id,
            text=text,
            x=x,
            y=y,
            layer_order=layer_order,
            **kwargs
        )
        self.text_lines.append(text_line)
        self.next_object_id += 1
        self.next_persistent_id += 1
        return text_line

    def save_to_file(self, file_path: str) -> bool:
        """Adobe Premiere Pro完全互換保存"""
        try:
            xml_content = self.generate_xml()

            # UTF-16LE + BOM（Premiere Pro標準）
            with open(file_path, 'wb') as f:
                f.write(codecs.BOM_UTF16_LE)
                f.write(xml_content.encode('utf-16le'))

            print(f"✅ PRTL保存成功: {file_path}")
            return True

        except Exception as e:
            print(f"❌ 保存エラー: {e}")
            import traceback
            traceback.print_exc()
            return False

    def generate_xml(self) -> str:
        """PRTLファイル生成（完全版・TextPage/TextChain構造）"""
        xml_content = f'''<?xml version="1.0" encoding="UTF-16" ?>
<Adobe_Root>
<Adobe_Title>
<Version>7.0</Version>
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
<LayoutDimension Version="1">
<pXPIXELS>{self.layout.width}</pXPIXELS>
<pYLINES>{self.layout.height}</pYLINES>
<pSCREENAR>{self.layout.screen_ar}</pSCREENAR>
<growthDirection>{self.layout.growth_direction}</growthDirection>
</LayoutDimension>
{self._generate_layout_attributes()}
{self._generate_background()}
{self._generate_text_descriptions()}
{self._generate_styles()}
{self._generate_shaders()}
{self._generate_textures()}
{self._generate_vls()}
{self._generate_layers()}
</Layout>
</InscriberLayouts>
</Adobe_Root>'''

        return self._format_one_line(xml_content)

    def _format_one_line(self, xml_content: str) -> str:
        """1行フォーマット化"""
        one_line = xml_content.replace('\n', '').replace('\r', '')
        one_line = re.sub(r'\s+', ' ', one_line)
        one_line = re.sub(r'>\s+<', '><', one_line)
        return one_line.strip()

    def _generate_layout_attributes(self) -> str:
        return '<LayoutAttributes><SafeTitleArea><left>0.10000000000000001</left><top>0.10000000000000001</top><right>0.90000000000000002</right><bottom>0.90000000000000002</bottom></SafeTitleArea><SafeActionArea><left>5.0000000000000003e-002</left><top>5.0000000000000003e-002</top><right>0.95000000000000007</right><bottom>0.95000000000000007</bottom></SafeActionArea></LayoutAttributes>'

    def _generate_background(self) -> str:
        return '<Background Version="4"><ShaderReference>4098</ShaderReference><On>false</On><paintingRange>normalLayout</paintingRange></Background>'

    def _generate_text_descriptions(self) -> str:
        """TextDescription生成（各テキストに対応）"""
        descriptions = []
        for text_line in self.text_lines:
            descriptions.append(
                f'<TextDescription Reference="{text_line.text_ref}">'
                f'<TypeSpec>'
                f'<size>{int(text_line.font_size * 5.75)}</size>'
                f'<txHeight>{text_line.font_size}</txHeight>'
                f'<fifullName>{text_line.font_family}-{text_line.font_style}</fifullName>'
                f'<fifontFamilyName>{text_line.font_family}</fifontFamilyName>'
                f'<fifontStyle>{text_line.font_style}</fifontStyle>'
                f'<fifontType>6</fifontType>'
                f'</TypeSpec>'
                f'</TextDescription>'
            )

        if not descriptions:
            descriptions.append(
                '<TextDescription Reference="4098">'
                '<TypeSpec><size>368</size><txHeight>64.</txHeight>'
                '<fifullName>Yu Gothic UI-Bold</fifullName>'
                '<fifontFamilyName>Yu Gothic UI</fifontFamilyName>'
                '<fifontStyle>Bold</fifontStyle><fifontType>6</fifontType>'
                '</TypeSpec></TextDescription>'
            )

        return f"<TextDescriptions>{''.join(descriptions)}</TextDescriptions>"

    def _generate_styles(self) -> str:
        """Style生成（エフェクト対応）"""
        styles = []

        for text_line in self.text_lines:
            # ストロークFragment
            stroke_fragment = (
                f'<Fragment>'
                f'<size>{text_line.stroke_size if text_line.enable_stroke else 30.}</size>'
                f'<offset>0.</offset><angle>0.</angle><ghost>false</ghost>'
                f'<isExtendedShadowFragment>false</isExtendedShadowFragment>'
                f'<eFragmentType>2</eFragmentType>'
                f'<fragmentOff>{"false" if text_line.enable_stroke else "true"}</fragmentOff>'
                f'<placeHolder>false</placeHolder><annotation>4</annotation>'
                f'<placeHolderShaderIndex>4294967295</placeHolderShaderIndex>'
                f'<painterMix>10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10</painterMix>'
                f'</Fragment>'
            )

            # メインテキストFragment
            main_fragment = (
                '<Fragment><size>0.</size><offset>0.</offset><angle>0.</angle>'
                '<ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment>'
                '<eFragmentType>0</eFragmentType><fragmentOff>false</fragmentOff>'
                '<placeHolder>false</placeHolder><annotation>65538</annotation>'
                '<placeHolderShaderIndex>4294967295</placeHolderShaderIndex>'
                '<painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix>'
                '</Fragment>'
            )

            # シャドウFragment
            shadow_fragment = (
                f'<Fragment>'
                f'<size>0.</size>'
                f'<offset>{text_line.shadow_distance if text_line.enable_shadow else 7.}</offset>'
                f'<angle>{text_line.shadow_angle if text_line.enable_shadow else 311.424}</angle>'
                f'<ghost>false</ghost>'
                f'<isExtendedShadowFragment>true</isExtendedShadowFragment>'
                f'<eFragmentType>0</eFragmentType>'
                f'<fragmentOff>{"false" if text_line.enable_shadow else "true"}</fragmentOff>'
                f'<placeHolder>false</placeHolder><annotation>65537</annotation>'
                f'<placeHolderShaderIndex>4294967295</placeHolderShaderIndex>'
                f'<painterMix>0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0</painterMix>'
                f'</Fragment>'
            )

            # StyleをShaderListと共に生成
            style = (
                f'<Style ID="{text_line.style_ref}">'
                f'<StyleBase Version="4">'
                f'<type>50000</type><positionDominance>0</positionDominance>'
                f'<lineGradient>false</lineGradient><styleRef>{text_line.style_ref}</styleRef>'
                f'<faceDistortX>0.</faceDistortX><faceDistortY>0.</faceDistortY>'
                f'<shadow_softness>21.</shadow_softness><personality>0</personality>'
                f'<linked>false</linked><EmbellishmentSizeRule>false</EmbellishmentSizeRule>'
                f'<PainterRampType>Basic</PainterRampType>'
                f'</StyleBase>'
                f'<FragmentList Version="5">'
                f'{stroke_fragment}{main_fragment}{shadow_fragment}'
                f'</FragmentList>'
                f'<ShaderList Version="1">'
                f'<ShaderRef PainterNumber="10"><shaderRef>4108</shaderRef></ShaderRef>'
                f'<ShaderRef PainterNumber="15"><shaderRef>{text_line.style_ref + 1}</shaderRef></ShaderRef>'
                f'<ShaderRef PainterNumber="0"><shaderRef>4109</shaderRef></ShaderRef>'
                f'</ShaderList>'
                f'</Style>'
            )
            styles.append(style)

        if not styles:
            # デフォルトスタイル
            styles.append(
                '<Style ID="4096"><StyleBase Version="4"><type>50000</type></StyleBase></Style>'
            )

        return f"<Styles>{''.join(styles)}</Styles>"

    def _generate_shaders(self) -> str:
        """Shader生成（色対応）"""
        shaders = []

        for text_line in self.text_lines:
            # メインカラーShader
            shader_id = text_line.style_ref + 1
            shader = (
                f'<Shader Version="4" cReference="{shader_id}">'
                f'<textureRef>4098</textureRef><colorOption>4</colorOption><shaderOn>true</shaderOn>'
                f'<glintSize>100.</glintSize><glintOffset>0.</glintOffset>'
                f'<rampPosTop>75.</rampPosTop><rampPosBottom>25.</rampPosBottom>'
                f'<rampAngle>0.</rampAngle><bevelBalance>0.</bevelBalance>'
                f'<rampCycle>0</rampCycle><classicStyle>0</classicStyle><rampType>0</rampType>'
                f'<ColorSpec index="0">'
                f'<red>{text_line.color_r}</red><green>{text_line.color_g}</green><blue>{text_line.color_b}</blue><xpar>99</xpar>'
                f'</ColorSpec>'
                f'<ColorSpec index="1"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>'
                f'<ColorSpec index="2"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>'
                f'<ColorSpec index="3"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>'
                f'<ColorSpec index="4"><red>3</red><green>3</green><blue>3</blue><xpar>0</xpar></ColorSpec>'
                f'<glintAngle>265.</glintAngle><bevelSize>0.</bevelSize>'
                f'<bevelDirection>0</bevelDirection><bevelPipe>false</bevelPipe>'
                f'<bevelAngle>0.</bevelAngle><bevelShape>1.</bevelShape>'
                f'<bevelShining>0.</bevelShining><bevelLight>false</bevelLight>'
                f'<bevelMerge>true</bevelMerge><sheenOn>false</sheenOn>'
                f'</Shader>'
            )
            shaders.append(shader)

        # 固定Shader（ストローク・シャドウ用）
        shaders.append(
            '<Shader Version="4" cReference="4108">'
            '<textureRef>4098</textureRef><colorOption>0</colorOption><shaderOn>true</shaderOn>'
            '<ColorSpec index="0"><red>80</red><green>51</green><blue>0</blue><xpar>0</xpar></ColorSpec>'
            '<glintAngle>0.</glintAngle><bevelSize>0.</bevelSize><sheenOn>false</sheenOn>'
            '</Shader>'
        )
        shaders.append(
            '<Shader Version="4" cReference="4109">'
            '<textureRef>4098</textureRef><colorOption>0</colorOption><shaderOn>true</shaderOn>'
            '<ColorSpec index="0"><red>0</red><green>0</green><blue>0</blue><xpar>0</xpar></ColorSpec>'
            '<glintAngle>0.</glintAngle><bevelSize>0.</bevelSize><sheenOn>false</sheenOn>'
            '</Shader>'
        )

        return f"<Shaders>{''.join(shaders)}</Shaders>"

    def _generate_textures(self) -> str:
        return '<Textures><Texture Version="1" cReference="4098"><pixelAspect>1.</pixelAspect><angle>0.</angle><scaleX>1.</scaleX><scaleY>1.</scaleY><centerX>0.</centerX><centerY>0.</centerY></Texture></Textures>'

    def _generate_vls(self) -> str:
        return '<VLS><FileReference Version="1"><fileString></fileString><seClass>2</seClass><seCode>1000</seCode></FileReference></VLS>'

    def _generate_layers(self) -> str:
        """Layers生成（TextPage/TextChain/TextLine構造）"""
        if not self.text_lines:
            return '<Layers><Layer></Layer></Layers>'

        first_text = self.text_lines[0]
        content = (
            '<Layers><Layer>'
            '<TextPage><TextChain>'
            '<ChainProperty Version="9">'
            '<wordWrap>false</wordWrap>'
            f'<Position><x>{first_text.x}</x><y>{first_text.y}</y></Position>'
            '<Size><x>315.31458522981484</x><y>139.26905187016439</y></Size>'
            '<leading>0.</leading><lockedLinesX>true</lockedLinesX><lockedLinesY>true</lockedLinesY>'
            '<boxCanGrow>false</boxCanGrow><tabModeStyle>Word</tabModeStyle>'
            '</ChainProperty>'
        )

        for i, text_line in enumerate(self.text_lines):
            name_tag = "<name />" if i == 0 else ""
            rotation_rad = math.radians(text_line.rotation)

            content += (
                f'<TextLine Version="2" objectID="{text_line.object_id}" persistentID="{text_line.persistent_id}">'
                f'<BaseProperties Version="5">'
                f'<txBase>{text_line.y + 50}</txBase>'
                f'<XPos>{text_line.x}</XPos>'
                f'<angle>{rotation_rad}</angle>'
                f'<verticalText>false</verticalText>'
                f'<objectLeading>{text_line.line_spacing}</objectLeading>'
                f'</BaseProperties>'
                f'<EnclosingObjectType>block</EnclosingObjectType>'
                f'<Alignment>{text_line.alignment}</Alignment>'
                f'<TRString>{text_line.text}</TRString>'
                f'<RunLengthEncodedCharacterAttributes>'
                f'<CharacterAttributes RunCount="{text_line.run_count}" '
                f'StyleRef="{text_line.style_ref}" TextRef="{text_line.text_ref}" '
                f'TXKerning="{text_line.character_spacing}" TXPostKerning="0." '
                f'BaselineShifting="{text_line.baseline_shift}" />'
                f'</RunLengthEncodedCharacterAttributes>'
                f'<tagName>{name_tag}</tagName>'
                f'</TextLine>'
            )

        content += '</TextChain></TextPage></Layer></Layers>'
        return content


def generate_test_prtl():
    """テスト用PRTL生成"""
    print("\n" + "="*60)
    print("Premiere Pro Complete Compatible PRTL Generator")
    print("="*60 + "\n")

    # テスト1: 基本テキスト
    print("📝 Test 1: Basic Text")
    generator1 = PRTLGeneratorComplete()
    generator1.add_text_line(
        text="Adobe Premiere Pro",
        x=960, y=400,
        alignment="center",
        font_size=72.0,
        color_r=255, color_g=215, color_b=0,  # ゴールド
        enable_stroke=True,
        enable_shadow=False
    )
    generator1.add_text_line(
        text="Legacy Title Editor",
        x=960, y=600,
        alignment="center",
        font_size=48.0,
        color_r=255, color_g=255, color_b=255,  # 白
        enable_stroke=True,
        enable_shadow=False
    )
    generator1.save_to_file("premiere_compatible_basic.prtl")

    # テスト2: 日本語テキスト
    print("\n📝 Test 2: Japanese Text")
    generator2 = PRTLGeneratorComplete()
    generator2.add_text_line(
        text="こんにちは世界",
        x=960, y=540,
        alignment="center",
        font_family="Yu Gothic UI",
        font_size=64.0,
        color_r=100, color_g=200, color_b=255,  # 水色
        enable_stroke=True,
        enable_shadow=True,
        shadow_distance=10.0,
        shadow_angle=135.0
    )
    generator2.save_to_file("premiere_compatible_japanese.prtl")

    # テスト3: エフェクト全部入り
    print("\n📝 Test 3: Full Effects")
    generator3 = PRTLGeneratorComplete()
    generator3.add_text_line(
        text="With Shadow & Stroke",
        x=960, y=540,
        alignment="center",
        font_size=80.0,
        color_r=255, color_g=100, color_b=100,  # 赤
        enable_stroke=True,
        stroke_size=40.0,
        enable_shadow=True,
        shadow_distance=15.0,
        shadow_angle=135.0
    )
    generator3.save_to_file("premiere_compatible_effects.prtl")

    print("\n" + "="*60)
    print("✅ 3つのPremiere Pro互換PRTLファイルを生成しました")
    print("   - premiere_compatible_basic.prtl")
    print("   - premiere_compatible_japanese.prtl")
    print("   - premiere_compatible_effects.prtl")
    print("="*60 + "\n")
    print("👉 これらのファイルをPremiere Proで試してください！")


if __name__ == "__main__":
    generate_test_prtl()
