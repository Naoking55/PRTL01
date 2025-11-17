#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRTL Parser - Adobe Premiere Pro Legacy Title File Parser
PRTLファイルを解析してデータ構造に変換する高精度パーサー
"""

import xml.etree.ElementTree as ET
import codecs
import math
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ParsedTextLine:
    """パース済みテキストライン"""
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


@dataclass
class ParsedDrawObject:
    """パース済み図形オブジェクト"""
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
    corner_radius: float = 0.0
    opacity: float = 100.0


@dataclass
class ParsedLayout:
    """パース済みレイアウト情報"""
    width: int = 1920
    height: int = 1080
    screen_ar: float = 1.0
    growth_direction: str = "growRightDown"


class PRTLParser:
    """PRTL解析エンジン - 高精度版"""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.root = None
        self.layout = ParsedLayout()
        self.text_lines: List[ParsedTextLine] = []
        self.draw_objects: List[ParsedDrawObject] = []
        self.styles: Dict[int, dict] = {}
        self.shaders: Dict[int, dict] = {}
        self.text_descriptions: Dict[int, dict] = {}

    def parse(self) -> bool:
        """PRTLファイルを解析"""
        try:
            # UTF-16 LE読み込み
            with open(self.file_path, 'rb') as f:
                # BOMチェック
                bom = f.read(2)
                if bom != codecs.BOM_UTF16_LE:
                    print(f"⚠️ 警告: BOMが正しくありません ({bom.hex()})")
                    f.seek(0)

                # XML読み込み
                content = f.read().decode('utf-16le')

            # XMLパース
            self.root = ET.fromstring(content)

            # 解析実行
            self._parse_layout()
            self._parse_text_descriptions()
            self._parse_styles()
            self._parse_shaders()
            self._parse_layers()

            print(f"✅ PRTL解析成功: {self.file_path}")
            print(f"   - テキスト: {len(self.text_lines)}個")
            print(f"   - 図形: {len(self.draw_objects)}個")

            return True

        except Exception as e:
            print(f"❌ PRTL解析エラー: {e}")
            import traceback
            traceback.print_exc()
            return False

    def _parse_layout(self):
        """レイアウト情報を解析"""
        layout_dim = self.root.find('.//LayoutDimension')
        if layout_dim is not None:
            width_elem = layout_dim.find('pXPIXELS')
            height_elem = layout_dim.find('pYLINES')
            ar_elem = layout_dim.find('pSCREENAR')

            if width_elem is not None:
                self.layout.width = int(float(width_elem.text))
            if height_elem is not None:
                self.layout.height = int(float(height_elem.text))
            if ar_elem is not None:
                self.layout.screen_ar = float(ar_elem.text)

            print(f"   解像度: {self.layout.width}x{self.layout.height}")

    def _parse_text_descriptions(self):
        """TextDescription解析（フォント情報）"""
        text_descs = self.root.findall('.//TextDescription')
        for desc in text_descs:
            ref = desc.get('Reference')
            if ref:
                type_spec = desc.find('.//TypeSpec')
                if type_spec is not None:
                    font_data = {
                        'size': self._get_text(type_spec, 'txHeight', '64.'),
                        'family': self._get_text(type_spec, 'fifontFamilyName', 'Yu Gothic UI'),
                        'style': self._get_text(type_spec, 'fifontStyle', 'Bold')
                    }
                    self.text_descriptions[int(ref)] = font_data

    def _parse_styles(self):
        """Style解析（エフェクト情報）"""
        styles = self.root.findall('.//Style')
        for style in styles:
            style_id = style.get('ID')
            if style_id:
                # FragmentList解析（ストローク、シャドウ）
                fragments = style.findall('.//Fragment')
                style_data = {
                    'stroke_enabled': False,
                    'shadow_enabled': False,
                    'stroke_size': 30.0,
                    'shadow_distance': 7.0,
                    'shadow_angle': 135.0
                }

                for fragment in fragments:
                    annotation = self._get_text(fragment, 'annotation', '')
                    fragment_off = self._get_text(fragment, 'fragmentOff', 'false')

                    # ストローク（annotation=4）
                    if annotation == '4':
                        style_data['stroke_enabled'] = (fragment_off == 'false')
                        size = self._get_text(fragment, 'size', '30.')
                        style_data['stroke_size'] = float(size)

                    # シャドウ（annotation=65537）
                    elif annotation == '65537':
                        style_data['shadow_enabled'] = (fragment_off == 'false')
                        offset = self._get_text(fragment, 'offset', '7.')
                        angle = self._get_text(fragment, 'angle', '135.')
                        style_data['shadow_distance'] = float(offset)
                        style_data['shadow_angle'] = float(angle)

                self.styles[int(style_id)] = style_data

    def _parse_shaders(self):
        """Shader解析（色情報）"""
        shaders = self.root.findall('.//Shader')
        for shader in shaders:
            ref = shader.get('cReference')
            if ref:
                color_spec = shader.find('.//ColorSpec[@index="0"]')
                if color_spec is not None:
                    color_data = {
                        'r': int(self._get_text(color_spec, 'red', '255')),
                        'g': int(self._get_text(color_spec, 'green', '255')),
                        'b': int(self._get_text(color_spec, 'blue', '255'))
                    }
                    self.shaders[int(ref)] = color_data

    def _parse_layers(self):
        """Layer解析（テキスト・図形オブジェクト）"""
        # TextLine解析（新形式）
        text_lines = self.root.findall('.//TextLine')
        for idx, text_line_elem in enumerate(text_lines):
            text_line = self._parse_text_line(text_line_elem, idx)
            if text_line:
                self.text_lines.append(text_line)

        # Layer解析（旧形式・簡易形式）
        layers = self.root.findall('.//Layer[@ID]')
        for idx, layer_elem in enumerate(layers):
            text_line = self._parse_layer_as_text(layer_elem, idx + len(self.text_lines))
            if text_line:
                self.text_lines.append(text_line)

        # DrawObject解析
        draw_objects = self.root.findall('.//DrawObject')
        for idx, draw_obj_elem in enumerate(draw_objects):
            draw_obj = self._parse_draw_object(draw_obj_elem, idx)
            if draw_obj:
                self.draw_objects.append(draw_obj)

    def _parse_layer_as_text(self, elem, index: int) -> Optional[ParsedTextLine]:
        """Layer構造をTextLineとして解析（簡易形式対応）"""
        try:
            # Layer ID
            object_id = int(elem.get('ID', index + 1))
            persistent_id = object_id

            # LayerBase内の情報
            layer_base = elem.find('.//LayerBase')
            if layer_base is None:
                return None

            # テキスト内容
            string_elem = layer_base.find('string')
            text = string_elem.text if string_elem is not None and string_elem.text else ""

            # 位置情報
            position = layer_base.find('position')
            x = 960.0
            y = 540.0
            if position is not None:
                x_elem = position.find('x')
                y_elem = position.find('y')
                if x_elem is not None:
                    x = float(x_elem.text)
                if y_elem is not None:
                    y = float(y_elem.text)

            # 配置（horzAlignment: 0=left, 1=center, 2=right）
            horz_align_elem = layer_base.find('horzAlignment')
            alignment_map = {0: "left", 1: "center", 2: "right"}
            alignment = "left"
            if horz_align_elem is not None:
                alignment = alignment_map.get(int(horz_align_elem.text), "left")

            # スタイル・テキスト参照
            style_ref_elem = layer_base.find('styleReference')
            text_ref_elem = layer_base.find('textReference')
            style_ref = int(style_ref_elem.text) if style_ref_elem is not None else 4096
            text_ref = int(text_ref_elem.text) if text_ref_elem is not None else 4098

            # フォント情報取得
            font_family = "Yu Gothic UI"
            font_style = "Bold"
            font_size = 64.0

            if text_ref in self.text_descriptions:
                desc = self.text_descriptions[text_ref]
                font_family = desc['family']
                font_style = desc['style']
                font_size = float(desc['size'])

            # スタイル情報取得（エフェクト）
            enable_stroke = True
            enable_shadow = False
            stroke_size = 30.0
            shadow_distance = 7.0
            shadow_angle = 135.0

            if style_ref in self.styles:
                style = self.styles[style_ref]
                enable_stroke = style['stroke_enabled']
                enable_shadow = style['shadow_enabled']
                stroke_size = style['stroke_size']
                shadow_distance = style['shadow_distance']
                shadow_angle = style['shadow_angle']

            # 色情報取得
            color_r = 255
            color_g = 251
            color_b = 214

            # ShaderList内のShaderRefを探す
            parent_style = self.root.find(f'.//Style[@ID="{style_ref}"]')
            if parent_style is not None:
                shader_refs = parent_style.findall('.//ShaderRef')
                for shader_ref in shader_refs:
                    painter_num = shader_ref.get('PainterNumber')
                    if painter_num == '15':  # メインカラー
                        shader_id_elem = shader_ref.find('shaderRef')
                        if shader_id_elem is not None:
                            shader_id = int(shader_id_elem.text)
                            if shader_id in self.shaders:
                                shader = self.shaders[shader_id]
                                color_r = shader['r']
                                color_g = shader['g']
                                color_b = shader['b']

            # draworder
            draworder_elem = layer_base.find('draworder')
            layer_order = int(draworder_elem.text) if draworder_elem is not None else index

            return ParsedTextLine(
                object_id=object_id,
                persistent_id=persistent_id,
                text=text,
                x=x,
                y=y,
                layer_order=layer_order,
                style_ref=style_ref,
                text_ref=text_ref,
                alignment=alignment,
                font_family=font_family,
                font_style=font_style,
                font_size=font_size,
                color_r=color_r,
                color_g=color_g,
                color_b=color_b,
                rotation=0.0,
                enable_stroke=enable_stroke,
                enable_shadow=enable_shadow,
                stroke_size=stroke_size,
                shadow_angle=shadow_angle,
                shadow_distance=shadow_distance,
                character_spacing=0.0,
                line_spacing=0.0,
                baseline_shift=0.0
            )

        except Exception as e:
            print(f"⚠️ Layer解析エラー (index={index}): {e}")
            import traceback
            traceback.print_exc()
            return None

    def _parse_text_line(self, elem, index: int) -> Optional[ParsedTextLine]:
        """TextLineを解析"""
        try:
            # 基本属性
            object_id = int(elem.get('objectID', index + 1))
            persistent_id = int(elem.get('persistentID', index + 1))

            # テキスト内容
            text_elem = elem.find('.//TRString')
            text = text_elem.text if text_elem is not None and text_elem.text else ""

            # 位置情報
            base_props = elem.find('.//BaseProperties')
            x = 960.0
            y = 540.0
            rotation = 0.0
            line_spacing = 0.0

            if base_props is not None:
                x_elem = base_props.find('XPos')
                base_elem = base_props.find('txBase')
                angle_elem = base_props.find('angle')
                leading_elem = base_props.find('objectLeading')

                if x_elem is not None:
                    x = float(x_elem.text)
                if base_elem is not None:
                    y = float(base_elem.text) - 50  # txBaseからy座標を逆算
                if angle_elem is not None:
                    rotation = math.degrees(float(angle_elem.text))  # ラジアン→度
                if leading_elem is not None:
                    line_spacing = float(leading_elem.text)

            # 配置
            alignment_elem = elem.find('.//Alignment')
            alignment = alignment_elem.text if alignment_elem is not None else "left"

            # スタイル・テキスト参照
            char_attrs = elem.find('.//CharacterAttributes')
            style_ref = 4096
            text_ref = 4098
            character_spacing = 0.0
            baseline_shift = 0.0

            if char_attrs is not None:
                style_ref = int(char_attrs.get('StyleRef', 4096))
                text_ref = int(char_attrs.get('TextRef', 4098))
                character_spacing = float(char_attrs.get('TXKerning', '0.'))
                baseline_shift = float(char_attrs.get('BaselineShifting', '0.'))

            # フォント情報取得
            font_family = "Yu Gothic UI"
            font_style = "Bold"
            font_size = 64.0

            if text_ref in self.text_descriptions:
                desc = self.text_descriptions[text_ref]
                font_family = desc['family']
                font_style = desc['style']
                font_size = float(desc['size'])

            # スタイル情報取得（エフェクト）
            enable_stroke = True
            enable_shadow = False
            stroke_size = 30.0
            shadow_distance = 7.0
            shadow_angle = 135.0

            if style_ref in self.styles:
                style = self.styles[style_ref]
                enable_stroke = style['stroke_enabled']
                enable_shadow = style['shadow_enabled']
                stroke_size = style['stroke_size']
                shadow_distance = style['shadow_distance']
                shadow_angle = style['shadow_angle']

            # 色情報取得
            color_r = 255
            color_g = 251
            color_b = 214

            # ShaderList内のShaderRefを探す
            parent_style = self.root.find(f'.//Style[@ID="{style_ref}"]')
            if parent_style is not None:
                shader_refs = parent_style.findall('.//ShaderRef')
                for shader_ref in shader_refs:
                    painter_num = shader_ref.get('PainterNumber')
                    if painter_num == '15':  # メインカラー
                        shader_id_elem = shader_ref.find('shaderRef')
                        if shader_id_elem is not None:
                            shader_id = int(shader_id_elem.text)
                            if shader_id in self.shaders:
                                shader = self.shaders[shader_id]
                                color_r = shader['r']
                                color_g = shader['g']
                                color_b = shader['b']

            return ParsedTextLine(
                object_id=object_id,
                persistent_id=persistent_id,
                text=text,
                x=x,
                y=y,
                layer_order=index,
                style_ref=style_ref,
                text_ref=text_ref,
                alignment=alignment,
                font_family=font_family,
                font_style=font_style,
                font_size=font_size,
                color_r=color_r,
                color_g=color_g,
                color_b=color_b,
                rotation=rotation,
                enable_stroke=enable_stroke,
                enable_shadow=enable_shadow,
                stroke_size=stroke_size,
                shadow_angle=shadow_angle,
                shadow_distance=shadow_distance,
                character_spacing=character_spacing,
                line_spacing=line_spacing,
                baseline_shift=baseline_shift
            )

        except Exception as e:
            print(f"⚠️ TextLine解析エラー (index={index}): {e}")
            return None

    def _parse_draw_object(self, elem, index: int) -> Optional[ParsedDrawObject]:
        """DrawObjectを解析"""
        try:
            # 基本属性
            object_id = int(elem.get('objectID', index + 1000))
            persistent_id = int(elem.get('persistentID', index + 1000))

            # 図形種類
            primitive_elem = elem.find('.//gPrimitive')
            primitive = int(primitive_elem.text) if primitive_elem is not None else 0

            # ジオメトリ情報
            geom = elem.find('.//GraphicGeometry')
            x = 0.0
            y = 0.0
            width = 100.0
            height = 100.0
            rotation = 0.0
            corner_radius = 0.0

            if geom is not None:
                x_elem = geom.find('gCrsrX')
                y_elem = geom.find('gCrsrY')
                w_elem = geom.find('gSizeX')
                h_elem = geom.find('gSizeY')
                rot_elem = geom.find('gRotate')

                if x_elem is not None:
                    x = float(x_elem.text)
                if y_elem is not None:
                    y = float(y_elem.text)
                if w_elem is not None:
                    width = float(w_elem.text)
                if h_elem is not None:
                    height = float(h_elem.text)
                if rot_elem is not None:
                    rotation = math.degrees(float(rot_elem.text))

                # フィレット（角丸）
                fillets = geom.find('Fillets')
                if fillets is not None:
                    fillet0 = fillets.get('fillet0', '0.')
                    corner_radius = float(fillet0)

            # スタイル参照
            base_id = elem.find('.//BaseID')
            style_ref = 4103
            if base_id is not None:
                style_ref_elem = base_id.find('styleRef')
                if style_ref_elem is not None:
                    style_ref = int(style_ref_elem.text)

            return ParsedDrawObject(
                object_id=object_id,
                persistent_id=persistent_id,
                primitive=primitive,
                x=x,
                y=y,
                width=width,
                height=height,
                layer_order=index + len(self.text_lines),
                style_ref=style_ref,
                rotation=rotation,
                corner_radius=corner_radius
            )

        except Exception as e:
            print(f"⚠️ DrawObject解析エラー (index={index}): {e}")
            return None

    def _get_text(self, elem, tag: str, default: str = "") -> str:
        """安全にテキスト取得"""
        child = elem.find(tag)
        if child is not None and child.text:
            return child.text.strip()
        return default


def test_parser():
    """パーサーのテスト"""
    import sys

    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        # テスト用にサンプルファイルを使用
        file_path = "/home/user/PRTL01/test_output_basic.prtl"

    print(f"\n{'='*60}")
    print(f"PRTL Parser Test")
    print(f"{'='*60}")
    print(f"ファイル: {file_path}\n")

    parser = PRTLParser(file_path)
    if parser.parse():
        print(f"\n{'='*60}")
        print(f"解析結果")
        print(f"{'='*60}")

        print(f"\n📐 レイアウト:")
        print(f"   {parser.layout.width}x{parser.layout.height}")

        print(f"\n📝 テキスト ({len(parser.text_lines)}個):")
        for i, tl in enumerate(parser.text_lines):
            print(f"   [{i}] \"{tl.text}\"")
            print(f"       位置: ({tl.x:.1f}, {tl.y:.1f})")
            print(f"       フォント: {tl.font_family} {tl.font_style} {tl.font_size}pt")
            print(f"       色: RGB({tl.color_r}, {tl.color_g}, {tl.color_b})")
            print(f"       ストローク: {'ON' if tl.enable_stroke else 'OFF'}")
            print(f"       シャドウ: {'ON' if tl.enable_shadow else 'OFF'}")

        if parser.draw_objects:
            print(f"\n🔷 図形 ({len(parser.draw_objects)}個):")
            for i, do in enumerate(parser.draw_objects):
                print(f"   [{i}] Primitive={do.primitive}")
                print(f"       位置: ({do.x:.1f}, {do.y:.1f})")
                print(f"       サイズ: {do.width:.1f}x{do.height:.1f}")


if __name__ == "__main__":
    test_parser()
