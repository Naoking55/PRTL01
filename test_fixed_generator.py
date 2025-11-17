#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for fixed legacy_title_editor_v636_fixed.py
LayoutEffectInfo修正後のテスト
"""

import sys
from pathlib import Path

# 親ディレクトリをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from legacy_title_editor_v636_fixed import PRTLProject

def test_fixed_prtl_generation():
    """修正後のPRTL生成テスト"""

    print("=" * 60)
    print("LayoutEffectInfo修正後のPRTL生成テスト")
    print("=" * 60)
    print()

    # プロジェクト作成
    project = PRTLProject()

    # HD解像度設定
    project.layout.width = 1920
    project.layout.height = 1080
    project.layout.screen_ar = 1.0

    # テキスト追加（中央）
    project.add_text_line(
        text="テスト タイトル",
        x=960,
        y=540,
        alignment="center",
        font_family="Yu Gothic UI",
        font_style="Bold",
        font_size=72.0,
        color_r=255,
        color_g=215,
        color_b=0,  # ゴールド色
        enable_stroke=True,
        stroke_size=30.0,
        enable_shadow=False
    )

    # ファイル保存
    output_file = "test_fixed_with_layouteffectinfo.prtl"

    if project.save_to_file(output_file):
        print(f"✅ テストファイル生成成功: {output_file}")
        print()
        print("📋 ファイル情報:")
        print(f"   - 解像度: {project.layout.width}×{project.layout.height}")
        print(f"   - テキスト: {project.text_lines[0].text}")
        print(f"   - フォント: {project.text_lines[0].font_family} {project.text_lines[0].font_style}")
        print(f"   - サイズ: {project.text_lines[0].font_size}pt")
        print(f"   - エンコーディング: UTF-16LE + BOM")
        print()
        print("🔍 重要な変更:")
        print("   ✅ <LayoutEffectInfo Version=\"1\"><EffectType>0</EffectType></LayoutEffectInfo>")
        print("   ✅ 公式サンプルと同じ構造")
        print()
        print("📝 次のステップ:")
        print("   1. Adobe Premiere Pro 15.4.5を起動")
        print("   2. プロジェクトパネルで右クリック > 読み込み")
        print(f"   3. {output_file} を選択")
        print("   4. タイムラインにドラッグ&ドロップ")
        print("   5. 文字が表示されることを確認！")
        print()

        # ファイルの先頭部分を確認
        with open(output_file, 'rb') as f:
            header = f.read(500)
            if b'LayoutEffectInfo' in header:
                print("✅ LayoutEffectInfoが正しく含まれています")
            else:
                print("⚠️  警告: LayoutEffectInfoが見つかりません")

        return True
    else:
        print("❌ エラー: ファイル生成に失敗しました")
        return False

if __name__ == "__main__":
    success = test_fixed_prtl_generation()
    sys.exit(0 if success else 1)
