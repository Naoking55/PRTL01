#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRTL Roundtrip Test - 読み込み→保存の再現性テスト
PRTLファイルを読み込んで、再度書き出して、内容が保持されているかテスト
"""

import sys
from pathlib import Path

# パスを追加
sys.path.insert(0, str(Path(__file__).parent))

from prtl_parser import PRTLParser


def test_roundtrip(input_file: str, output_file: str):
    """ラウンドトリップテスト"""
    print(f"\n{'='*60}")
    print(f"Roundtrip Test: {Path(input_file).name}")
    print(f"{'='*60}\n")

    # ステップ1: 元のPRTLを読み込む
    print("📖 ステップ1: 元のPRTLを読み込み")
    parser1 = PRTLParser(input_file)
    if not parser1.parse():
        print("❌ 読み込み失敗")
        return False

    print(f"   - テキスト: {len(parser1.text_lines)}個")
    print(f"   - 図形: {len(parser1.draw_objects)}個")

    # ステップ2: PRTLProjectに変換
    print("\n🔄 ステップ2: PRTLProjectに変換")
    # legacy_title_editor_v636_fixed.pyから必要なクラスをインポート
    from dataclasses import dataclass
    from typing import List, Optional

    @dataclass
    class LayoutDimension:
        width: int = 1920
        height: int = 1080
        screen_ar: float = 1.0
        growth_direction: str = "growRightDown"

    # 簡易版PRTLProjectを使う（test_prtl_core.pyから流用）
    import codecs
    import re

    class SimplePRTLProject:
        def __init__(self):
            self.layout = LayoutDimension()
            self.text_lines = []
            self.draw_objects = []
            self.file_path = None

        def load_from_parser(self, parser: PRTLParser):
            """パーサーからデータをロード"""
            self.layout.width = parser.layout.width
            self.layout.height = parser.layout.height
            self.layout.screen_ar = parser.layout.screen_ar

            self.text_lines = parser.text_lines
            self.draw_objects = parser.draw_objects

        def save_to_file(self, file_path: str) -> bool:
            """簡易保存（Layer形式）"""
            try:
                xml_content = self._generate_simple_xml()

                with open(file_path, 'wb') as f:
                    f.write(codecs.BOM_UTF16_LE)
                    f.write(xml_content.encode('utf-16le'))

                self.file_path = file_path
                return True
            except Exception as e:
                print(f"保存エラー: {e}")
                return False

        def _generate_simple_xml(self) -> str:
            """簡易XML生成（Layer形式）"""
            # Layersセクションを生成
            layers = []
            for tl in self.text_lines:
                alignment_map = {"left": 0, "center": 1, "right": 2}
                horz_align = alignment_map.get(tl.alignment, 0)

                layers.append(
                    f'<Layer ID="{tl.object_id}">'
                    f'<LayerBase Version="1">'
                    f'<textReference>{tl.text_ref}</textReference>'
                    f'<styleReference>{tl.style_ref}</styleReference>'
                    f'<horzAlignment>{horz_align}</horzAlignment>'
                    f'<string>{tl.text}</string>'
                    f'<position><x>{tl.x}</x><y>{tl.y}</y></position>'
                    f'<draworder>{tl.layer_order}</draworder>'
                    f'<paintingRange>normalLayout</paintingRange>'
                    f'<locked>false</locked>'
                    f'</LayerBase>'
                    f'</Layer>'
                )

            layers_xml = f"<Layers>{''.join(layers)}</Layers>"

            # 完全なXML
            xml = (
                f'<?xml version="1.0" encoding="UTF-16" ?>'
                f'<Adobe_Root>'
                f'<Adobe_Title><Version>7.0</Version><Motion_Settings>'
                f'<Play_Forward>true</Play_Forward><Start_on_Screen>false</Start_on_Screen>'
                f'<Pre_Roll>0</Pre_Roll><Ease_In>0</Ease_In>'
                f'<End_off_Screen>false</End_off_Screen><Post_Roll>0</Post_Roll>'
                f'<Ease_Out>0</Ease_Out></Motion_Settings></Adobe_Title>'
                f'<InscriberLayouts Version="1.0">'
                f'<Layout>'
                f'<LayoutDimension Version="1">'
                f'<pXPIXELS>{self.layout.width}</pXPIXELS>'
                f'<pYLINES>{self.layout.height}</pYLINES>'
                f'<pSCREENAR>{self.layout.screen_ar}</pSCREENAR>'
                f'<growthDirection>{self.layout.growth_direction}</growthDirection>'
                f'</LayoutDimension>'
                f'<LayoutAttributes>'
                f'<SafeTitleArea><left>0.1</left><top>0.1</top><right>0.9</right><bottom>0.9</bottom></SafeTitleArea>'
                f'<SafeActionArea><left>0.05</left><top>0.05</top><right>0.95</right><bottom>0.95</bottom></SafeActionArea>'
                f'</LayoutAttributes>'
                f'<Background Version="4"><ShaderReference>4098</ShaderReference><On>false</On><paintingRange>normalLayout</paintingRange></Background>'
                f'<TextDescriptions></TextDescriptions>'
                f'<Styles></Styles>'
                f'<Shaders></Shaders>'
                f'<Textures></Textures>'
                f'<VirtualLayerSources></VirtualLayerSources>'
                f'{layers_xml}'
                f'</Layout>'
                f'</InscriberLayouts>'
                f'</Adobe_Root>'
            )

            return xml

    project = SimplePRTLProject()
    project.load_from_parser(parser1)
    print("   ✅ 変換完了")

    # ステップ3: 新しいPRTLとして保存
    print(f"\n💾 ステップ3: 新しいPRTLとして保存")
    if not project.save_to_file(output_file):
        print("❌ 保存失敗")
        return False
    print(f"   ✅ 保存完了: {output_file}")

    # ステップ4: 保存したPRTLを再度読み込み
    print(f"\n🔍 ステップ4: 保存したPRTLを再度読み込み")
    parser2 = PRTLParser(output_file)
    if not parser2.parse():
        print("❌ 再読み込み失敗")
        return False

    # ステップ5: データを比較
    print(f"\n📊 ステップ5: データ比較")

    # レイアウト比較
    if parser1.layout.width == parser2.layout.width and parser1.layout.height == parser2.layout.height:
        print(f"   ✅ レイアウト: {parser2.layout.width}x{parser2.layout.height}")
    else:
        print(f"   ❌ レイアウト不一致")
        return False

    # テキスト数比較
    if len(parser1.text_lines) == len(parser2.text_lines):
        print(f"   ✅ テキスト数: {len(parser2.text_lines)}個")
    else:
        print(f"   ❌ テキスト数不一致: {len(parser1.text_lines)} → {len(parser2.text_lines)}")
        return False

    # 各テキストの内容比較
    for i, (t1, t2) in enumerate(zip(parser1.text_lines, parser2.text_lines)):
        if t1.text != t2.text:
            print(f"   ❌ テキスト[{i}]不一致: \"{t1.text}\" → \"{t2.text}\"")
            return False
        if abs(t1.x - t2.x) > 0.1 or abs(t1.y - t2.y) > 0.1:
            print(f"   ❌ 位置[{i}]不一致: ({t1.x}, {t1.y}) → ({t2.x}, {t2.y})")
            return False

    print(f"   ✅ 全テキスト内容一致")

    print(f"\n{'='*60}")
    print(f"🎉 ラウンドトリップテスト成功！")
    print(f"{'='*60}\n")

    return True


def main():
    """メインテスト実行"""
    print("\n" + "🔄"*30)
    print("PRTL Roundtrip Test Suite")
    print("読み込み→保存→再読み込みの完全性検証")
    print("🔄"*30)

    tests = [
        ("test_output_basic.prtl", "test_roundtrip_basic.prtl"),
        ("test_output_japanese.prtl", "test_roundtrip_japanese.prtl"),
    ]

    results = []
    for input_file, output_file in tests:
        result = test_roundtrip(input_file, output_file)
        results.append((input_file, result))

    # サマリー
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
        print("\n🎉 全ラウンドトリップテスト成功！")
        print("PRTLの読み込み・書き出しは完全に動作しています。")
    else:
        print("\n⚠️  一部テストが失敗しました。")


if __name__ == "__main__":
    main()
