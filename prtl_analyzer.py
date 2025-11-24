#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRTL File Structure Analyzer
PRTLファイルを解析して構造を抽出するスクリプト
"""

import xml.etree.ElementTree as ET
import json
import re
from pathlib import Path
from typing import Dict, List, Any


def fix_encoding_declaration(file_path: Path) -> str:
    """
    UTF-16エンコーディング宣言をUTF-8に置換
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # encoding="UTF-16" を encoding="UTF-8" に置換
    content = content.replace('encoding="UTF-16"', 'encoding="UTF-8"')
    return content


def parse_fragment(fragment_elem) -> Dict[str, Any]:
    """
    Fragment要素を解析
    """
    annotation = int(fragment_elem.find('annotation').text)

    # annotationに基づいてフラグメントタイプを決定
    if annotation == 65538:
        frag_type = "face"
    elif annotation == 65537:
        frag_type = "shadow"
    elif annotation == 4:
        frag_type = "stroke_outer_4"
    elif annotation == 3:
        frag_type = "stroke_outer_3"
    elif annotation == 2:
        frag_type = "stroke_outer_2"
    elif annotation == 1:
        frag_type = "stroke_inner"
    else:
        frag_type = f"unknown_{annotation}"

    # painterMixから最初の値を取得
    painter_mix_text = fragment_elem.find('painterMix').text.strip()
    painter_numbers = [int(x) for x in painter_mix_text.split() if x]
    painter_number = painter_numbers[0] if painter_numbers else 0

    fragment_data = {
        "type": frag_type,
        "annotation": annotation,
        "size": int(fragment_elem.find('size').text),
        "offset": int(fragment_elem.find('offset').text),
        "angle": float(fragment_elem.find('angle').text),
        "eFragmentType": int(fragment_elem.find('eFragmentType').text),
        "fragmentOff": fragment_elem.find('fragmentOff').text == 'true',
        "painterNumber": painter_number,
        "painterMix": painter_mix_text,
        "isExtendedShadowFragment": fragment_elem.find('isExtendedShadowFragment').text == 'true'
    }

    return fragment_data


def parse_style(style_elem) -> Dict[str, Any]:
    """
    Style要素を解析
    """
    style_id = style_elem.get('ID')

    # FragmentList解析
    fragments = []
    fragment_list = style_elem.find('FragmentList')
    if fragment_list is not None:
        for fragment in fragment_list.findall('Fragment'):
            fragments.append(parse_fragment(fragment))

    # ShaderList解析
    shader_refs = []
    shader_list = style_elem.find('ShaderList')
    if shader_list is not None:
        for shader_ref in shader_list.findall('ShaderRef'):
            painter_num = int(shader_ref.get('PainterNumber'))
            shader_id = shader_ref.find('shaderRef').text
            if shader_id != '0':  # ID=0は無効なシェーダー
                shader_refs.append({
                    "painterNumber": painter_num,
                    "shaderRef": shader_id
                })

    # StyleBase解析
    style_base = style_elem.find('StyleBase')
    style_base_data = {}
    if style_base is not None:
        style_base_data = {
            "type": int(style_base.find('type').text),
            "lineGradient": style_base.find('lineGradient').text == 'true',
            "shadow_softness": float(style_base.find('shadow_softness').text),
            "EmbellishmentSizeRule": style_base.find('EmbellishmentSizeRule').text == 'true',
            "PainterRampType": style_base.find('PainterRampType').text
        }

    return {
        "id": style_id,
        "styleBase": style_base_data,
        "fragments": fragments,
        "shaderRefs": shader_refs
    }


def parse_shader(shader_elem) -> Dict[str, Any]:
    """
    Shader要素を解析
    """
    shader_id = shader_elem.find('cReference').text

    # カラー情報を抽出
    colors = {}
    for i in range(5):
        color_spec = shader_elem.find(f"ColorSpec[@index='{i}']")
        if color_spec is not None:
            colors[f"color_{i}"] = {
                "red": int(color_spec.find('red').text),
                "green": int(color_spec.find('green').text),
                "blue": int(color_spec.find('blue').text),
                "alpha": int(color_spec.find('xpar').text)
            }

    shader_data = {
        "id": shader_id,
        "textureRef": shader_elem.find('textureRef').text,
        "colorOption": int(shader_elem.find('colorOption').text),
        "shaderOn": shader_elem.find('shaderOn').text == 'true',
        "rampType": int(shader_elem.find('rampType').text),
        "rampAngle": float(shader_elem.find('rampAngle').text),
        "colors": colors
    }

    return shader_data


def parse_text_description(text_desc_elem) -> Dict[str, Any]:
    """
    TextDescription要素を解析
    """
    ref = text_desc_elem.get('Reference')
    type_spec = text_desc_elem.find('TypeSpec')

    text_desc_data = {
        "reference": ref
    }

    if type_spec is not None:
        text_desc_data["typeSpec"] = {
            "size": int(type_spec.find('size').text),
            "txHeight": float(type_spec.find('txHeight').text),
            "txKern": float(type_spec.find('txKern').text),
            "txWidth": float(type_spec.find('txWidth').text),
            "fontFamily": type_spec.find('fifontFamilyName').text,
            "fontStyle": type_spec.find('fifontStyle').text,
            "fullName": type_spec.find('fifullName').text
        }

    return text_desc_data


def parse_text_chain(text_chain_elem) -> Dict[str, Any]:
    """
    TextChain要素を解析してテキスト内容を抽出
    """
    text_lines = []

    for text_line in text_chain_elem.findall('.//TextLine'):
        # テキスト内容
        tr_string_elem = text_line.find('TRString')
        text_content = tr_string_elem.text if tr_string_elem is not None else ""

        # 位置情報
        base_props = text_line.find('BaseProperties')
        position = {}
        if base_props is not None:
            position = {
                "txBase": float(base_props.find('txBase').text),
                "xPos": float(base_props.find('XPos').text),
                "angle": float(base_props.find('angle').text)
            }

        # スタイル情報（RunLengthEncodedCharacterAttributes）
        style_refs = []
        char_attrs = text_line.find('RunLengthEncodedCharacterAttributes')
        if char_attrs is not None:
            for char_attr in char_attrs.findall('CharacterAttributes'):
                style_refs.append({
                    "runCount": int(char_attr.get('RunCount')),
                    "styleRef": char_attr.get('StyleRef'),
                    "textRef": char_attr.get('TextRef'),
                    "txKerning": float(char_attr.get('TXKerning')),
                    "txPostKerning": float(char_attr.get('TXPostKerning', '0'))
                })

        text_lines.append({
            "text": text_content,
            "position": position,
            "characterAttributes": style_refs
        })

    return {
        "textLines": text_lines
    }


def analyze_prtl_file(file_path: Path) -> Dict[str, Any]:
    """
    PRTLファイルを解析してすべての情報を抽出
    """
    print(f"\n解析中: {file_path.name}")

    # エンコーディング宣言を修正してXMLをパース
    xml_content = fix_encoding_declaration(file_path)
    root = ET.fromstring(xml_content)

    # Styles解析
    styles = []
    styles_elem = root.find('.//Styles')
    if styles_elem is not None:
        for style in styles_elem.findall('Style'):
            styles.append(parse_style(style))

    print(f"  - {len(styles)} スタイルを検出")

    # Shaders解析
    shaders = []
    shaders_elem = root.find('.//Shaders')
    if shaders_elem is not None:
        for shader in shaders_elem.findall('Shader'):
            shaders.append(parse_shader(shader))

    print(f"  - {len(shaders)} シェーダーを検出")

    # TextDescriptions解析
    text_descriptions = []
    text_descs_elem = root.find('.//TextDescriptions')
    if text_descs_elem is not None:
        for text_desc in text_descs_elem.findall('TextDescription'):
            text_descriptions.append(parse_text_description(text_desc))

    print(f"  - {len(text_descriptions)} テキスト記述を検出")

    # TextChains解析
    text_objects = []
    text_chains = root.findall('.//TextChain')
    for text_chain in text_chains:
        text_objects.append(parse_text_chain(text_chain))

    print(f"  - {len(text_objects)} テキストオブジェクトを検出")

    return {
        "fileName": file_path.name,
        "styles": styles,
        "shaders": shaders,
        "textDescriptions": text_descriptions,
        "textObjects": text_objects
    }


def create_mapping_analysis(all_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    スタイル、シェーダー、フラグメントのマッピング関係を分析
    """
    mapping = {
        "fragmentTypes": {},
        "strokeLayers": [],
        "shaderUsage": {}
    }

    # すべてのファイルからフラグメントタイプを収集
    for file_data in all_data:
        for style in file_data["styles"]:
            style_id = style["id"]

            for fragment in style["fragments"]:
                frag_type = fragment["type"]
                annotation = fragment["annotation"]
                painter_num = fragment["painterNumber"]

                # フラグメントタイプごとに情報を蓄積
                if frag_type not in mapping["fragmentTypes"]:
                    mapping["fragmentTypes"][frag_type] = {
                        "annotation": annotation,
                        "examples": []
                    }

                # 対応するシェーダーを検索
                shader_ref = None
                for sref in style["shaderRefs"]:
                    if sref["painterNumber"] == painter_num:
                        shader_ref = sref["shaderRef"]
                        break

                mapping["fragmentTypes"][frag_type]["examples"].append({
                    "file": file_data["fileName"],
                    "styleId": style_id,
                    "size": fragment["size"],
                    "painterNumber": painter_num,
                    "shaderRef": shader_ref,
                    "fragmentOff": fragment["fragmentOff"]
                })

    return mapping


def generate_markdown_report(all_data: List[Dict[str, Any]], mapping: Dict[str, Any]) -> str:
    """
    Markdown形式のレポートを生成
    """
    md = ["# PRTL Structure Analysis Report\n"]
    md.append("## 概要\n")
    md.append(f"解析対象ファイル数: {len(all_data)}\n")

    # ファイルごとのサマリー
    md.append("\n## ファイル別サマリー\n")
    for file_data in all_data:
        md.append(f"\n### {file_data['fileName']}\n")
        md.append(f"- スタイル数: {len(file_data['styles'])}\n")
        md.append(f"- シェーダー数: {len(file_data['shaders'])}\n")
        md.append(f"- テキスト記述数: {len(file_data['textDescriptions'])}\n")
        md.append(f"- テキストオブジェクト数: {len(file_data['textObjects'])}\n")

    # フラグメントタイプの詳細
    md.append("\n## フラグメントタイプの詳細\n")
    md.append("\n### Annotationマッピング\n")
    md.append("| Fragment Type | Annotation | 説明 |\n")
    md.append("|--------------|------------|------|\n")
    md.append("| face | 65538 | テキストの表面 |\n")
    md.append("| shadow | 65537 | ドロップシャドウ |\n")
    md.append("| stroke_outer_4 | 4 | 最外側のストローク |\n")
    md.append("| stroke_outer_3 | 3 | 外側ストローク3層目 |\n")
    md.append("| stroke_outer_2 | 2 | 外側ストローク2層目 |\n")
    md.append("| stroke_inner | 1 | 最内側のストローク |\n")

    # 各ファイルのスタイル詳細
    for file_data in all_data:
        md.append(f"\n## {file_data['fileName']} - 詳細解析\n")

        # スタイル情報
        md.append("\n### スタイル (Styles)\n")
        for style in file_data["styles"]:
            md.append(f"\n#### Style ID: {style['id']}\n")

            # フラグメント情報
            md.append("\n**Fragment構成:**\n")
            md.append("| Type | Annotation | Size | Offset | Angle | Painter# | Fragment Off |\n")
            md.append("|------|------------|------|--------|-------|----------|-------------|\n")

            for frag in style["fragments"]:
                off_status = "Yes" if frag["fragmentOff"] else "No"
                md.append(f"| {frag['type']} | {frag['annotation']} | {frag['size']} | {frag['offset']} | {frag['angle']} | {frag['painterNumber']} | {off_status} |\n")

            # シェーダー参照
            md.append("\n**Shader References:**\n")
            md.append("| Painter Number | Shader ID |\n")
            md.append("|----------------|----------|\n")
            for sref in style["shaderRefs"]:
                md.append(f"| {sref['painterNumber']} | {sref['shaderRef']} |\n")

        # シェーダー情報
        md.append("\n### シェーダー (Shaders)\n")
        for shader in file_data["shaders"]:
            md.append(f"\n#### Shader ID: {shader['id']}\n")
            md.append(f"- Texture Ref: {shader['textureRef']}\n")
            md.append(f"- Color Option: {shader['colorOption']}\n")
            md.append(f"- Ramp Type: {shader['rampType']}\n")
            md.append(f"- Ramp Angle: {shader['rampAngle']}\n")

            md.append("\n**Colors:**\n")
            for color_name, color_val in shader["colors"].items():
                md.append(f"- {color_name}: RGB({color_val['red']}, {color_val['green']}, {color_val['blue']}) Alpha: {color_val['alpha']}\n")

        # テキスト情報
        if file_data["textObjects"]:
            md.append("\n### テキストオブジェクト\n")
            for i, text_obj in enumerate(file_data["textObjects"], 1):
                md.append(f"\n#### Text Object {i}\n")
                for line in text_obj["textLines"]:
                    md.append(f"\n**テキスト内容:** `{line['text']}`\n")
                    md.append(f"- Position X: {line['position'].get('xPos', 'N/A')}\n")
                    md.append(f"- Base: {line['position'].get('txBase', 'N/A')}\n")

                    md.append("\n**Character Attributes:**\n")
                    md.append("| Run Count | Style Ref | Text Ref | Kerning | Post Kerning |\n")
                    md.append("|-----------|-----------|----------|---------|-------------|\n")
                    for attr in line["characterAttributes"]:
                        md.append(f"| {attr['runCount']} | {attr['styleRef']} | {attr['textRef']} | {attr['txKerning']} | {attr['txPostKerning']} |\n")

    # マッピング分析
    md.append("\n## フラグメントとシェーダーのマッピング分析\n")
    for frag_type, info in mapping["fragmentTypes"].items():
        md.append(f"\n### {frag_type} (Annotation: {info['annotation']})\n")
        md.append("| File | Style ID | Size | Painter# | Shader Ref | Fragment Off |\n")
        md.append("|------|----------|------|----------|------------|-------------|\n")
        for example in info["examples"]:
            off_status = "Yes" if example["fragmentOff"] else "No"
            md.append(f"| {example['file']} | {example['styleId']} | {example['size']} | {example['painterNumber']} | {example['shaderRef']} | {off_status} |\n")

    return "".join(md)


def main():
    """
    メイン処理
    """
    print("=" * 60)
    print("PRTL File Structure Analyzer")
    print("=" * 60)

    # PRTLファイルのパス
    prtl_files = [
        Path("/home/user/PRTL01/参考PRTL/タイトル_01.prtl"),
        Path("/home/user/PRTL01/参考PRTL/タイトル_02.prtl"),
        Path("/home/user/PRTL01/参考PRTL/タイトル_03.prtl")
    ]

    # 全ファイルを解析
    all_data = []
    for prtl_file in prtl_files:
        if prtl_file.exists():
            try:
                file_data = analyze_prtl_file(prtl_file)
                all_data.append(file_data)
            except Exception as e:
                print(f"エラー: {prtl_file.name} の解析に失敗しました: {e}")
        else:
            print(f"警告: {prtl_file} が見つかりません")

    if not all_data:
        print("\n解析可能なファイルが見つかりませんでした。")
        return

    # マッピング分析
    print("\nマッピング分析を実行中...")
    mapping = create_mapping_analysis(all_data)

    # JSON出力
    output_json = Path("/home/user/PRTL01/PRTL_Structure_Analysis.json")
    json_output = {
        "metadata": {
            "filesAnalyzed": len(all_data),
            "totalStyles": sum(len(f["styles"]) for f in all_data),
            "totalShaders": sum(len(f["shaders"]) for f in all_data)
        },
        "files": all_data,
        "mapping": mapping
    }

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(json_output, f, indent=2, ensure_ascii=False)

    print(f"\nJSON出力: {output_json}")

    # Markdown出力
    output_md = Path("/home/user/PRTL01/PRTL_Structure_Analysis.md")
    markdown_report = generate_markdown_report(all_data, mapping)

    with open(output_md, 'w', encoding='utf-8') as f:
        f.write(markdown_report)

    print(f"Markdown出力: {output_md}")

    # サマリー表示
    print("\n" + "=" * 60)
    print("解析完了サマリー")
    print("=" * 60)
    print(f"解析ファイル数: {len(all_data)}")
    print(f"総スタイル数: {json_output['metadata']['totalStyles']}")
    print(f"総シェーダー数: {json_output['metadata']['totalShaders']}")
    print(f"フラグメントタイプ数: {len(mapping['fragmentTypes'])}")
    print("=" * 60)


if __name__ == "__main__":
    main()
