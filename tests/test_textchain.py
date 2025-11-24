"""
Unit tests for TextChain class
"""

import unittest
import xml.etree.ElementTree as ET
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from textchain import TextChain
from textline import TextLine
from textstyle import TextStyle


class TestTextChain(unittest.TestCase):
    """Test cases for TextChain class."""

    def test_empty_initialization(self):
        """Test creating empty TextChain."""
        chain = TextChain()

        self.assertEqual(len(chain), 0)
        self.assertEqual(len(chain.text_lines), 0)

    def test_initialization_with_textlines(self):
        """Test creating TextChain with initial TextLines."""
        textlines = [
            TextLine(index=0, text="First"),
            TextLine(index=1, text="Second"),
        ]

        chain = TextChain(textlines)

        self.assertEqual(len(chain), 2)
        self.assertEqual(chain[0].text, "First")
        self.assertEqual(chain[1].text, "Second")

    def test_indices_are_reindexed(self):
        """Test that indices are automatically corrected."""
        # Create TextLines with wrong indices
        textlines = [
            TextLine(index=99, text="First"),
            TextLine(index=5, text="Second"),
            TextLine(index=42, text="Third"),
        ]

        chain = TextChain(textlines)

        # Indices should be corrected to 0, 1, 2
        self.assertEqual(chain[0].index, 0)
        self.assertEqual(chain[1].index, 1)
        self.assertEqual(chain[2].index, 2)

    def test_add_text_line(self):
        """Test adding text lines."""
        chain = TextChain()

        # Add first line
        line1 = chain.add_text_line("First")
        self.assertEqual(len(chain), 1)
        self.assertEqual(line1.index, 0)
        self.assertEqual(line1.text, "First")

        # Add second line
        line2 = chain.add_text_line("Second")
        self.assertEqual(len(chain), 2)
        self.assertEqual(line2.index, 1)

    def test_add_text_line_with_style(self):
        """Test adding text line with custom style."""
        chain = TextChain()

        custom_style = TextStyle(font_name="Arial", font_size=72.0)
        line = chain.add_text_line("Hello", text_style=custom_style)

        self.assertEqual(line.text_styles[0].font_name, "Arial")
        self.assertEqual(line.text_styles[0].font_size, 72.0)

    def test_add_text_line_with_alignment(self):
        """Test adding text line with custom alignment."""
        chain = TextChain()

        line = chain.add_text_line(
            "Hello",
            alignment_horizontal="left",
            alignment_vertical="bottom"
        )

        self.assertEqual(line.alignment_horizontal, "left")
        self.assertEqual(line.alignment_vertical, "bottom")

    def test_add_text_line_at_index(self):
        """Test inserting text line at specific index."""
        chain = TextChain()

        chain.add_text_line("First")
        chain.add_text_line("Second")
        chain.add_text_line("Third")

        # Insert at index 1
        inserted = chain.add_text_line("Inserted", index=1)

        self.assertEqual(len(chain), 4)
        self.assertEqual(chain[0].text, "First")
        self.assertEqual(chain[1].text, "Inserted")
        self.assertEqual(chain[2].text, "Second")
        self.assertEqual(chain[3].text, "Third")

        # Check indices are correct
        for i, line in enumerate(chain):
            self.assertEqual(line.index, i)

    def test_add_text_line_invalid_index(self):
        """Test that invalid index raises ValueError."""
        chain = TextChain()
        chain.add_text_line("First")

        with self.assertRaises(ValueError):
            chain.add_text_line("Invalid", index=10)

        with self.assertRaises(ValueError):
            chain.add_text_line("Invalid", index=-1)

    def test_remove_text_line(self):
        """Test removing text lines."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")
        chain.add_text_line("Third")

        # Remove middle line
        removed = chain.remove_text_line(1)

        self.assertEqual(len(chain), 2)
        self.assertEqual(removed.text, "Second")
        self.assertEqual(chain[0].text, "First")
        self.assertEqual(chain[1].text, "Third")

        # Check indices are correct
        self.assertEqual(chain[0].index, 0)
        self.assertEqual(chain[1].index, 1)

    def test_remove_text_line_invalid_index(self):
        """Test that removing invalid index raises ValueError."""
        chain = TextChain()
        chain.add_text_line("First")

        with self.assertRaises(ValueError):
            chain.remove_text_line(10)

        with self.assertRaises(ValueError):
            chain.remove_text_line(-1)

    def test_get_text_line(self):
        """Test getting text line by index."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")

        line = chain.get_text_line(1)
        self.assertEqual(line.text, "Second")

    def test_get_text_line_invalid_index(self):
        """Test that getting invalid index raises ValueError."""
        chain = TextChain()
        chain.add_text_line("First")

        with self.assertRaises(ValueError):
            chain.get_text_line(10)

    def test_update_text(self):
        """Test updating text content."""
        chain = TextChain()
        chain.add_text_line("Hello")

        # Update text
        chain.update_text(0, "Hello World")

        line = chain[0]
        self.assertEqual(line.text, "Hello World")
        self.assertEqual(line.run_count, 12)  # len("Hello World") + 1

        # All styles should have updated run_count
        for style in line.text_styles:
            self.assertEqual(style.run_count, 12)

    def test_move_text_line(self):
        """Test moving text lines."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")
        chain.add_text_line("Third")

        # Move "Third" to position 0
        chain.move_text_line(2, 0)

        self.assertEqual(chain[0].text, "Third")
        self.assertEqual(chain[1].text, "First")
        self.assertEqual(chain[2].text, "Second")

        # Check indices
        for i, line in enumerate(chain):
            self.assertEqual(line.index, i)

    def test_move_text_line_invalid_index(self):
        """Test that moving with invalid index raises ValueError."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")

        with self.assertRaises(ValueError):
            chain.move_text_line(10, 0)

        with self.assertRaises(ValueError):
            chain.move_text_line(0, 10)

    def test_clear(self):
        """Test clearing all text lines."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")

        chain.clear()

        self.assertEqual(len(chain), 0)

    def test_iteration(self):
        """Test iterating over text lines."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")
        chain.add_text_line("Third")

        texts = [line.text for line in chain]
        self.assertEqual(texts, ["First", "Second", "Third"])

    def test_indexing(self):
        """Test accessing text lines with [] operator."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")

        self.assertEqual(chain[0].text, "First")
        self.assertEqual(chain[1].text, "Second")

    def test_to_xml(self):
        """Test XML serialization."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")

        xml_elem = chain.to_xml()

        self.assertEqual(xml_elem.tag, 'TextLines')
        self.assertEqual(xml_elem.find('NumTextLines').text, '2')

        textlines = xml_elem.findall('TextLine')
        self.assertEqual(len(textlines), 2)
        self.assertEqual(textlines[0].find('Text').text, 'First')
        self.assertEqual(textlines[1].find('Text').text, 'Second')

    def test_from_xml(self):
        """Test XML deserialization."""
        xml_str = '''
        <TextLines>
            <NumTextLines>2</NumTextLines>
            <TextLine Index="0">
                <RunCount>6</RunCount>
                <Text>First</Text>
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
            <TextLine Index="1">
                <RunCount>7</RunCount>
                <Text>Second</Text>
                <DispPrevTextStyles>1</DispPrevTextStyles>
                <TextStyleArraySize>1</TextStyleArraySize>
                <TextStyle Index="0">
                    <RunStart>0</RunStart>
                    <RunCount>7</RunCount>
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
        </TextLines>
        '''

        xml_elem = ET.fromstring(xml_str)
        chain = TextChain.from_xml(xml_elem)

        self.assertEqual(len(chain), 2)
        self.assertEqual(chain[0].text, "First")
        self.assertEqual(chain[1].text, "Second")

    def test_validate_success(self):
        """Test validation succeeds for valid chain."""
        chain = TextChain()
        chain.add_text_line("First")
        chain.add_text_line("Second")

        # Should not raise
        self.assertTrue(chain.validate())

    def test_validate_fails_wrong_run_count(self):
        """Test validation fails for invalid run count."""
        chain = TextChain()
        line = chain.add_text_line("Hello")

        # Manually corrupt run count
        line.text_styles[0].run_count = 999

        with self.assertRaises(ValueError):
            chain.validate()

    def test_get_statistics(self):
        """Test getting statistics."""
        chain = TextChain()
        chain.add_text_line("Hello")
        chain.add_text_line("World")

        stats = chain.get_statistics()

        self.assertEqual(stats['num_text_lines'], 2)
        self.assertEqual(stats['total_characters'], 10)  # 5 + 5
        self.assertEqual(stats['total_text_styles'], 2)  # 1 per line
        self.assertEqual(stats['avg_chars_per_line'], 5.0)


if __name__ == '__main__':
    unittest.main()
