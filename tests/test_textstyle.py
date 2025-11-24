"""
Unit tests for TextStyle class
"""

import unittest
import xml.etree.ElementTree as ET
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from textstyle import TextStyle


class TestTextStyle(unittest.TestCase):
    """Test cases for TextStyle class."""

    def test_default_initialization(self):
        """Test creating TextStyle with default values."""
        style = TextStyle()

        self.assertEqual(style.run_start, 0)
        self.assertEqual(style.run_count, 1)
        self.assertEqual(style.font_name, "Times New Roman")
        self.assertEqual(style.font_size, 100.0)
        self.assertEqual(style.font_face, "BoldFace")
        self.assertEqual(style.font_color, (255, 215, 0))
        self.assertEqual(style.painter_style_id, 4096)

    def test_custom_initialization(self):
        """Test creating TextStyle with custom values."""
        style = TextStyle(
            run_count=10,
            font_name="Arial",
            font_size=72.0,
            font_face="ItalicFace",
            font_color=(255, 0, 0),
            painter_style_id=4100
        )

        self.assertEqual(style.run_count, 10)
        self.assertEqual(style.font_name, "Arial")
        self.assertEqual(style.font_size, 72.0)
        self.assertEqual(style.font_face, "ItalicFace")
        self.assertEqual(style.font_color, (255, 0, 0))
        self.assertEqual(style.painter_style_id, 4100)

    def test_invalid_run_count(self):
        """Test that invalid run_count raises ValueError."""
        with self.assertRaises(ValueError):
            TextStyle(run_count=0)

        with self.assertRaises(ValueError):
            TextStyle(run_count=-1)

    def test_invalid_font_size(self):
        """Test that invalid font_size raises ValueError."""
        with self.assertRaises(ValueError):
            TextStyle(font_size=0)

        with self.assertRaises(ValueError):
            TextStyle(font_size=-10)

    def test_invalid_font_face(self):
        """Test that invalid font_face raises ValueError."""
        with self.assertRaises(ValueError):
            TextStyle(font_face="InvalidFace")

    def test_invalid_font_color(self):
        """Test that invalid font_color raises ValueError."""
        # Wrong number of components
        with self.assertRaises(ValueError):
            TextStyle(font_color=(255, 0))

        # Out of range values
        with self.assertRaises(ValueError):
            TextStyle(font_color=(256, 0, 0))

        with self.assertRaises(ValueError):
            TextStyle(font_color=(-1, 0, 0))

    def test_invalid_painter_style_id(self):
        """Test that invalid painter_style_id raises ValueError."""
        with self.assertRaises(ValueError):
            TextStyle(painter_style_id=3000)  # Too low

        with self.assertRaises(ValueError):
            TextStyle(painter_style_id=5000)  # Too high

    def test_update_run_count(self):
        """Test updating run count."""
        style = TextStyle(run_count=5)
        style.update_run_count(10)
        self.assertEqual(style.run_count, 10)

    def test_update_run_count_invalid(self):
        """Test that invalid run_count update raises ValueError."""
        style = TextStyle()
        with self.assertRaises(ValueError):
            style.update_run_count(0)

    def test_set_color(self):
        """Test setting color."""
        style = TextStyle()
        style.set_color(255, 0, 0)
        self.assertEqual(style.font_color, (255, 0, 0))

    def test_set_color_invalid(self):
        """Test that invalid color values raise ValueError."""
        style = TextStyle()

        with self.assertRaises(ValueError):
            style.set_color(256, 0, 0)

        with self.assertRaises(ValueError):
            style.set_color(-1, 0, 0)

    def test_to_xml(self):
        """Test XML serialization."""
        style = TextStyle(
            run_count=10,
            font_name="Arial",
            font_size=72.0,
            font_face="BoldFace",
            font_color=(255, 0, 0),
            painter_style_id=4100
        )

        xml_elem = style.to_xml(index=0)

        self.assertEqual(xml_elem.tag, 'TextStyle')
        self.assertEqual(xml_elem.get('Index'), '0')
        self.assertEqual(xml_elem.find('RunCount').text, '10')
        self.assertEqual(xml_elem.find('FontName').text, 'Arial')
        self.assertEqual(xml_elem.find('FontSize').text, '72')
        self.assertEqual(xml_elem.find('FontFace').text, 'BoldFace')
        self.assertEqual(xml_elem.find('FontColor').text, '255 0 0')
        self.assertEqual(xml_elem.find('PainterStyleID').text, '4100')

    def test_from_xml(self):
        """Test XML deserialization."""
        xml_str = '''
        <TextStyle Index="0">
            <RunStart>0</RunStart>
            <RunCount>10</RunCount>
            <DispPrevTextStyles>1</DispPrevTextStyles>
            <FontName>Arial</FontName>
            <FontSize>72</FontSize>
            <FontFace>BoldFace</FontFace>
            <FontColor>255 0 0</FontColor>
            <PainterStyleID>4100</PainterStyleID>
        </TextStyle>
        '''

        xml_elem = ET.fromstring(xml_str)
        style = TextStyle.from_xml(xml_elem)

        self.assertEqual(style.run_count, 10)
        self.assertEqual(style.font_name, "Arial")
        self.assertEqual(style.font_size, 72.0)
        self.assertEqual(style.font_face, "BoldFace")
        self.assertEqual(style.font_color, (255, 0, 0))
        self.assertEqual(style.painter_style_id, 4100)

    def test_copy(self):
        """Test creating a copy of TextStyle."""
        original = TextStyle(
            run_count=10,
            font_name="Arial",
            font_color=(255, 0, 0)
        )

        copy = original.copy()

        # Check values match
        self.assertEqual(copy.run_count, original.run_count)
        self.assertEqual(copy.font_name, original.font_name)
        self.assertEqual(copy.font_color, original.font_color)

        # Check they're different objects
        self.assertIsNot(copy, original)

        # Modifying copy doesn't affect original
        copy.set_color(0, 255, 0)
        self.assertNotEqual(copy.font_color, original.font_color)

    def test_repr(self):
        """Test string representation."""
        style = TextStyle()
        repr_str = repr(style)
        self.assertIn("TextStyle", repr_str)
        self.assertIn("Times New Roman", repr_str)


if __name__ == '__main__':
    unittest.main()
