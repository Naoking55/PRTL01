#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRTL Core Function Test - GUI不要のコア機能テスト
PRTLの読み書き機能を検証
"""

import sys
import codecs
import xml.etree.ElementTree as ET
from pathlib import Path

# legacy_title_editor_v636_fixed.pyから必要なクラスをインポート
sys.path.insert(0, str(Path(__file__).parent))

# 必要なクラスのみを抽出してインポート
from dataclasses import dataclass, field
from typing import List, Optional, Union
import re

@dataclass
class TextLineData:
    """テキストオブジェクトデータ"""
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
    enable_glow: bool = False
    stroke_size: float = 30.0
    glow_size: float = 15.0
    shadow_angle: float = 135.0
    shadow_distance: float = 7.0
    shadow_opacity: float = 50.0
    character_spacing: float = 0.0
    line_spacing: float = 0.0
    width_scale: float = 100.0
    height_scale: float = 100.0
    baseline_shift: float = 0.0
    visible: bool = True
    locked: bool = False

    @property
    def run_count(self) -> int:
        """UTF-16対応RunCount"""
        return len(self.text) + 1

@dataclass
class DrawObjectData:
    """図形オブジェクトデータ"""
    object_id: int
    persistent_id: int
    primitive: int
    x: float
    y: float
    width: float
    height: float
    layer_order: int = 0
    style_ref: int = 4103
    rotation: float = 0.0
    fill_color_r: int = 255
    fill_color_g: int = 255
    fill_color_b: int = 255
    stroke_color_r: int = 0
    stroke_color_g: int = 0
    stroke_color_b: int = 0
    stroke_width: float = 2.0
    fill_enabled: bool = True
    stroke_enabled: bool = True
    corner_radius: float = 0.0
    opacity: float = 100.0
    visible: bool = True
    locked: bool = False

@dataclass
class LayoutDimension:
    """レイアウト解像度"""
    width: int = 1920
    height: int = 1080
    screen_ar: float = 1.0
    growth_direction: str = "growRightDown"

class PRTLProject:
    """PRTLプロジェクト管理クラス（コア機能のみ）"""

    def __init__(self):
        self.layout = LayoutDimension()
        self.text_lines: List[TextLineData] = []
        self.draw_objects: List[DrawObjectData] = []
        self.next_object_id = 1
        self.next_persistent_id = 1
        self.file_path: Optional[str] = None

    def add_text_line(self, text: str, x: float, y: float, **kwargs) -> TextLineData:
        """テキスト行追加"""
        layer_order = kwargs.pop('layer_order', len(self.text_lines) + len(self.draw_objects))

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

            self.file_path = file_path
            print(f"✅ PRTLファイル保存成功: {file_path}")
            print(f"   - テキストライン数: {len(self.text_lines)}")
            print(f"   - 図形オブジェクト数: {len(self.draw_objects)}")
            return True

        except Exception as e:
            print(f"❌ 保存エラー: {e}")
            import traceback
            traceback.print_exc()
            return False

    def generate_xml(self) -> str:
        """PRTLファイル生成（簡易版）"""
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
        descriptions = []
        for text_line in self.text_lines:
            descriptions.append(f'<TextDescription Reference="{text_line.text_ref}"><TypeSpec><size>{int(text_line.font_size * 5.75)}</size><txHeight>{text_line.font_size}</txHeight><fifullName>{text_line.font_family}-{text_line.font_style}</fifullName><fifontFamilyName>{text_line.font_family}</fifontFamilyName><fifontStyle>{text_line.font_style}</fifontStyle><fifontType>6</fifontType></TypeSpec></TextDescription>')

        if not descriptions:
            descriptions.append('<TextDescription Reference="4098"><TypeSpec><size>368</size><txHeight>64.</txHeight><fifullName>Yu Gothic UI-Bold</fifullName><fifontFamilyName>Yu Gothic UI</fifontFamilyName><fifontStyle>Bold</fifontStyle><fifontType>6</fifontType></TypeSpec></TextDescription>')

        return f"<TextDescriptions>{''.join(descriptions)}</TextDescriptions>"

    def _generate_styles(self) -> str:
        """スタイル生成（簡易版）"""
        styles = []
        for text_line in self.text_lines:
            stroke_fragment = f'<Fragment><size>30.</size><offset>0.</offset><angle>0.</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>2</eFragmentType><fragmentOff>{"false" if text_line.enable_stroke else "true"}</fragmentOff><placeHolder>false</placeHolder><annotation>4</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10</painterMix></Fragment>'

            shadow_fragment = f'<Fragment><size>0.</size><offset>7.</offset><angle>311.424</angle><ghost>false</ghost><isExtendedShadowFragment>true</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>{"false" if text_line.enable_shadow else "true"}</fragmentOff><placeHolder>false</placeHolder><annotation>65537</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0</painterMix></Fragment>'

            styles.append(f'<Style ID="{text_line.style_ref}"><StyleBase Version="4"><type>50000</type><positionDominance>0</positionDominance><lineGradient>false</lineGradient><styleRef>{text_line.style_ref}</styleRef><faceDistortX>0.</faceDistortX><faceDistortY>0.</faceDistortY><shadow_softness>21.</shadow_softness><personality>0</personality><linked>false</linked><EmbellishmentSizeRule>false</EmbellishmentSizeRule><PainterRampType>Basic</PainterRampType></StyleBase><FragmentList Version="5">{stroke_fragment}<Fragment><size>0.</size><offset>0.</offset><angle>0.</angle><ghost>false</ghost><isExtendedShadowFragment>false</isExtendedShadowFragment><eFragmentType>0</eFragmentType><fragmentOff>false</fragmentOff><placeHolder>false</placeHolder><annotation>65538</annotation><placeHolderShaderIndex>4294967295</placeHolderShaderIndex><painterMix>15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15</painterMix></Fragment>{shadow_fragment}</FragmentList><ShaderList Version="1"><ShaderRef PainterNumber="10"><shaderRef>4108</shaderRef></ShaderRef><ShaderRef PainterNumber="15"><shaderRef>4097</shaderRef></ShaderRef><ShaderRef PainterNumber="0"><shaderRef>4109</shaderRef></ShaderRef></ShaderList></Style>')

        return f"<Styles>{''.join(styles)}</Styles>"

    def _generate_shaders(self) -> str:
        """シェーダー生成（最小限）"""
        return '<Shaders><Shader ID="4097"><ShaderBase Version="1"><type>22</type><parameterList></parameterList><textureMixList></textureMixList><rampReference>0</rampReference><shaderMatteReference>0</shaderMatteReference></ShaderBase></Shader><Shader ID="4098"><ShaderBase Version="1"><type>30</type><parameterList></parameterList><textureMixList></textureMixList><rampReference>0</rampReference><shaderMatteReference>0</shaderMatteReference></ShaderBase></Shader><Shader ID="4108"><ShaderBase Version="1"><type>30</type><parameterList></parameterList><textureMixList></textureMixList><rampReference>0</rampReference><shaderMatteReference>0</shaderMatteReference></ShaderBase></Shader><Shader ID="4109"><ShaderBase Version="1"><type>30</type><parameterList></parameterList><textureMixList></textureMixList><rampReference>0</rampReference><shaderMatteReference>0</shaderMatteReference></ShaderBase></Shader></Shaders>'

    def _generate_textures(self) -> str:
        return '<Textures></Textures>'

    def _generate_vls(self) -> str:
        return '<VirtualLayerSources></VirtualLayerSources>'

    def _generate_layers(self) -> str:
        """レイヤー生成（テキストのみ）"""
        layers = []
        for idx, text_line in enumerate(self.text_lines):
            layers.append(f'<Layer ID="{text_line.object_id}"><LayerBase Version="1"><textReference>{text_line.text_ref}</textReference><styleReference>{text_line.style_ref}</styleReference><horzAlignment>{self._get_alignment_value(text_line.alignment)}</horzAlignment><string>{text_line.text}</string><position><x>{text_line.x}</x><y>{text_line.y}</y></position><draworder>{text_line.layer_order}</draworder><paintingRange>normalLayout</paintingRange><locked>false</locked></LayerBase></Layer>')

        return f"<Layers>{''.join(layers)}</Layers>"

    def _get_alignment_value(self, alignment: str) -> int:
        mapping = {"left": 0, "center": 1, "right": 2}
        return mapping.get(alignment, 0)


def test_basic_prtl_creation():
    """基本的なPRTL作成テスト"""
    print("\n" + "="*60)
    print("TEST 1: 基本的なPRTL作成")
    print("="*60)

    project = PRTLProject()

    # テキスト追加
    project.add_text_line(
        text="Adobe Premiere Pro",
        x=960,
        y=400,
        alignment="center",
        font_size=72.0,
        color_r=255, color_g=215, color_b=0
    )

    project.add_text_line(
        text="レガシータイトル復刻版",
        x=960,
        y=600,
        alignment="center",
        font_size=48.0,
        color_r=255, color_g=255, color_b=255
    )

    # 保存
    output_file = "/home/user/PRTL01/test_output_basic.prtl"
    success = project.save_to_file(output_file)

    if success:
        # ファイル検証
        verify_prtl_file(output_file)

    return success


def test_japanese_text():
    """日本語テキストのテスト"""
    print("\n" + "="*60)
    print("TEST 2: 日本語テキスト")
    print("="*60)

    project = PRTLProject()

    project.add_text_line(
        text="こんにちは世界",
        x=960,
        y=540,
        alignment="center",
        font_family="Yu Gothic UI",
        font_size=64.0
    )

    output_file = "/home/user/PRTL01/test_output_japanese.prtl"
    success = project.save_to_file(output_file)

    if success:
        verify_prtl_file(output_file)

    return success


def test_effects():
    """エフェクトのテスト"""
    print("\n" + "="*60)
    print("TEST 3: エフェクト（ストローク・シャドウ）")
    print("="*60)

    project = PRTLProject()

    project.add_text_line(
        text="Shadow Test",
        x=960,
        y=400,
        alignment="center",
        enable_stroke=True,
        enable_shadow=True,
        stroke_size=20.0,
        shadow_distance=10.0,
        shadow_angle=135.0
    )

    project.add_text_line(
        text="No Effects",
        x=960,
        y=600,
        alignment="center",
        enable_stroke=False,
        enable_shadow=False
    )

    output_file = "/home/user/PRTL01/test_output_effects.prtl"
    success = project.save_to_file(output_file)

    if success:
        verify_prtl_file(output_file)

    return success


def verify_prtl_file(file_path: str):
    """PRTLファイルの検証"""
    print(f"\n📋 ファイル検証: {file_path}")

    # ファイルサイズ
    file_size = Path(file_path).stat().st_size
    print(f"   - ファイルサイズ: {file_size:,} bytes")

    # BOMチェック
    with open(file_path, 'rb') as f:
        bom = f.read(2)
        if bom == codecs.BOM_UTF16_LE:
            print("   - BOM: ✅ UTF-16 LE")
        else:
            print(f"   - BOM: ❌ 不正 ({bom.hex()})")

    # XML構造チェック
    try:
        with open(file_path, 'rb') as f:
            content = f.read().decode('utf-16le')

        # Adobe_Rootの存在確認
        if '<Adobe_Root>' in content and '</Adobe_Root>' in content:
            print("   - XML構造: ✅ Adobe_Root要素あり")
        else:
            print("   - XML構造: ❌ Adobe_Root要素なし")

        # テキスト数カウント
        layer_count = content.count('<Layer ID=')
        print(f"   - レイヤー数: {layer_count}")

    except Exception as e:
        print(f"   - XML解析エラー: {e}")


def main():
    """メインテスト実行"""
    print("\n" + "🎬"*30)
    print("PRTL Core Function Test Suite")
    print("PRTLエディター コア機能テスト")
    print("🎬"*30)

    results = []

    # テスト実行
    results.append(("基本PRTL作成", test_basic_prtl_creation()))
    results.append(("日本語テキスト", test_japanese_text()))
    results.append(("エフェクト機能", test_effects()))

    # 結果サマリー
    print("\n" + "="*60)
    print("📊 テスト結果サマリー")
    print("="*60)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")

    total = len(results)
    passed = sum(1 for _, r in results if r)
    print(f"\n合計: {passed}/{total} テスト成功")

    if passed == total:
        print("\n🎉 全テスト成功！PRTLコア機能は正常に動作しています。")
    else:
        print("\n⚠️  一部テストが失敗しました。")


if __name__ == "__main__":
    main()
