"""
Unit tests for TextLine class
"""

import unittest
import xml.etree.ElementTree as ET
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from textline import TextLine
from textstyle import TextStyle


class TestTextLine(unittest.TestCase):
    """Test cases for TextLine class."""

    def test_default_initialization(self):
        """Test creating TextLine with minimal parameters."""
        textline = TextLine(index=0, text="Hello")

        self.assertEqual(textline.index, 0)
        self.assertEqual(textline.text, "Hello")
        self.assertEqual(textline.run_count, 6)  # len("Hello") + 1
        self.assertEqual(len(textline.text_styles), 1)  # Default style created
        self.assertEqual(textline.alignment_horizontal, "center")
        self.assertEqual(textline.alignment_vertical, "top")

    def test_run_count_calculation(self):
        """Test that run_count is calculated correctly."""
        testcases = [
            ("", 1),
            ("A", 2),
            ("Hello", 6),
            ("Hello World", 12),
            ("日本語", 4),  # 3 Japanese chars + 1
        ]

        for text, expected_run_count in testcases:
            textline = TextLine(index=0, text=text)
            self.assertEqual(textline.run_count, expected_run_count,
                           f"Text '{text}' should have run_count {expected_run_count}")

    def test_text_style_run_count_sync(self):
        """Test that TextStyle run_count is synchronized with TextLine."""
        textline = TextLine(index=0, text="Hello")

        # Check default style has matching run_count
        self.assertEqual(textline.text_styles[0].run_count, textline.run_count)

        # Add another style
        new_style = TextStyle(run_count=999)  # Wrong value initially
        textline.add_text_style(new_style)

        # Should be synchronized
        self.assertEqual(new_style.run_count, textline.run_count)

    def test_set_text_updates_run_count(self):
        """Test that changing text updates all run counts."""
        textline = TextLine(index=0, text="Hello")
        original_run_count = textline.run_count

        # Add multiple styles
        textline.add_text_style(TextStyle())
        textline.add_text_style(TextStyle())

        # Change text
        textline.set_text("Hello World")
        new_run_count = textline.run_count

        # Run count should have changed
        self.assertNotEqual(new_run_count, original_run_count)
        self.assertEqual(new_run_count, 12)  # len("Hello World") + 1

        # All styles should be synchronized
        for style in textline.text_styles:
            self.assertEqual(style.run_count, new_run_count)

    def test_add_text_style(self):
        """Test adding text styles."""
        textline = TextLine(index=0, text="Hello")
        original_count = len(textline.text_styles)

        new_style = TextStyle(font_name="Arial")
        textline.add_text_style(new_style)

        self.assertEqual(len(textline.text_styles), original_count + 1)
        self.assertEqual(new_style.run_count, textline.run_count)

    def test_remove_text_style(self):
        """Test removing text styles."""
        textline = TextLine(index=0, text="Hello")
        textline.add_text_style(TextStyle())
        textline.add_text_style(TextStyle())

        # Should have 3 styles now
        self.assertEqual(len(textline.text_styles), 3)

        # Remove one
        textline.remove_text_style(1)
        self.assertEqual(len(textline.text_styles), 2)

    def test_cannot_remove_last_style(self):
        """Test that removing the last style raises ValueError."""
        textline = TextLine(index=0, text="Hello")

        with self.assertRaises(ValueError):
            textline.remove_text_style(0)

    def test_remove_invalid_style_index(self):
        """Test that removing invalid index raises ValueError."""
        textline = TextLine(index=0, text="Hello")

        with self.assertRaises(ValueError):
            textline.remove_text_style(10)

        with self.assertRaises(ValueError):
            textline.remove_text_style(-1)

    def test_set_alignment(self):
        """Test setting alignment."""
        textline = TextLine(index=0, text="Hello")

        textline.set_alignment(horizontal="left")
        self.assertEqual(textline.alignment_horizontal, "left")

        textline.set_alignment(vertical="bottom")
        self.assertEqual(textline.alignment_vertical, "bottom")

        textline.set_alignment(horizontal="right", vertical="center")
        self.assertEqual(textline.alignment_horizontal, "right")
        self.assertEqual(textline.alignment_vertical, "center")

    def test_set_alignment_invalid(self):
        """Test that invalid alignment raises ValueError."""
        textline = TextLine(index=0, text="Hello")

        with self.assertRaises(ValueError):
            textline.set_alignment(horizontal="invalid")

        with self.assertRaises(ValueError):
            textline.set_alignment(vertical="invalid")

    def test_set_leading(self):
        """Test setting leading (line spacing)."""
        textline = TextLine(index=0, text="Hello")

        textline.set_leading(leading_type="manual")
        self.assertEqual(textline.leading_type, "manual")

        textline.set_leading(leading_value=150.0)
        self.assertEqual(textline.leading_value, 150.0)

        textline.set_leading(leading_type="auto", leading_value=100.0)
        self.assertEqual(textline.leading_type, "auto")
        self.assertEqual(textline.leading_value, 100.0)

    def test_set_leading_invalid(self):
        """Test that invalid leading raises ValueError."""
        textline = TextLine(index=0, text="Hello")

        with self.assertRaises(ValueError):
            textline.set_leading(leading_type="invalid")

        with self.assertRaises(ValueError):
            textline.set_leading(leading_value=0)

        with self.assertRaises(ValueError):
            textline.set_leading(leading_value=-10)

    def test_to_xml(self):
        """Test XML serialization."""
        textline = TextLine(
            index=0,
            text="Hello",
            alignment_horizontal="center",
            alignment_vertical="top"
        )

        xml_elem = textline.to_xml()

        self.assertEqual(xml_elem.tag, 'TextLine')
        self.assertEqual(xml_elem.get('Index'), '0')
        self.assertEqual(xml_elem.find('Text').text, 'Hello')
        self.assertEqual(xml_elem.find('RunCount').text, '6')
        self.assertEqual(xml_elem.find('HorizontalAlignmentAttribute').text, 'center')
        self.assertEqual(xml_elem.find('VerticalAlignmentAttribute').text, 'top')

        # Should have TextStyle elements
        text_styles = xml_elem.findall('TextStyle')
        self.assertEqual(len(text_styles), 1)

    def test_from_xml(self):
        """Test XML deserialization."""
        xml_str = '''
        <TextLine Index="0">
            <RunCount>6</RunCount>
            <Text>Hello</Text>
            <DispPrevTextStyles>1</DispPrevTextStyles>
            <TextStyleArraySize>1</TextStyleArraySize>
            <TextStyle Index="0">
                <RunStart>0</RunStart>
                <RunCount>6</RunCount>
                <DispPrevTextStyles>1</DispPrevTextStyles>
                <FontName>Arial</FontName>
                <FontSize>72</FontSize>
                <FontFace>BoldFace</FontFace>
                <FontColor>255 0 0</FontColor>
                <PainterStyleID>4096</PainterStyleID>
            </TextStyle>
            <MarginArraySize>0</MarginArraySize>
            <VerticalAlignmentAttribute>top</VerticalAlignmentAttribute>
            <HorizontalAlignmentAttribute>center</HorizontalAlignmentAttribute>
            <LeadingType>auto</LeadingType>
            <LeadingValue>120</LeadingValue>
            <BaselineShift>0</BaselineShift>
            <LineBasedParagraphAlignment>false</LineBasedParagraphAlignment>
        </TextLine>
        '''

        xml_elem = ET.fromstring(xml_str)
        textline = TextLine.from_xml(xml_elem)

        self.assertEqual(textline.index, 0)
        self.assertEqual(textline.text, "Hello")
        self.assertEqual(textline.run_count, 6)
        self.assertEqual(len(textline.text_styles), 1)
        self.assertEqual(textline.alignment_horizontal, "center")
        self.assertEqual(textline.alignment_vertical, "top")

    def test_copy(self):
        """Test creating a copy of TextLine."""
        original = TextLine(
            index=0,
            text="Hello",
            alignment_horizontal="left"
        )

        copy = original.copy()

        # Check values match
        self.assertEqual(copy.index, original.index)
        self.assertEqual(copy.text, original.text)
        self.assertEqual(copy.alignment_horizontal, original.alignment_horizontal)

        # Check they're different objects
        self.assertIsNot(copy, original)

        # Check text_styles are also copied
        self.assertIsNot(copy.text_styles[0], original.text_styles[0])

        # Modifying copy doesn't affect original
        copy.set_text("World")
        self.assertNotEqual(copy.text, original.text)

    def test_repr(self):
        """Test string representation."""
        textline = TextLine(index=0, text="Hello")
        repr_str = repr(textline)
        self.assertIn("TextLine", repr_str)
        self.assertIn("Hello", repr_str)


if __name__ == '__main__':
    unittest.main()
