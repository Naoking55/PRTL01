"""
TextChain - Text line collection manager for PRTL files

This module implements the TextChain class which manages a collection of
TextLine objects, ensuring proper indexing and reference management.
"""

from typing import List, Optional, Dict
import xml.etree.ElementTree as ET

try:
    from .textline import TextLine
    from .textstyle import TextStyle
except ImportError:
    from textline import TextLine
    from textstyle import TextStyle


class TextChain:
    """
    TextChain manages a collection of TextLine objects for PRTL files.

    The TextChain is responsible for:
    - Managing multiple TextLine objects
    - Maintaining sequential indices (0, 1, 2, ...)
    - Providing add/update/remove/reorder operations
    - Generating XML output for the TextLines section

    Attributes:
        text_lines: List of TextLine objects managed by this chain

    Critical Rules:
        - Indices must be sequential starting from 0
        - Each index must be unique
        - XML output maintains proper NumTextLines count
    """

    def __init__(self, text_lines: Optional[List[TextLine]] = None):
        """
        Initialize TextChain with optional initial text lines.

        Args:
            text_lines: Optional list of TextLine objects
        """
        self.text_lines: List[TextLine] = text_lines or []
        self._reindex()

    def _reindex(self):
        """
        Reindex all text lines sequentially starting from 0.

        This ensures indices are always sequential and unique.
        """
        for i, textline in enumerate(self.text_lines):
            textline.index = i

    def add_text_line(
        self,
        text: str,
        text_style: Optional[TextStyle] = None,
        alignment_horizontal: str = "center",
        alignment_vertical: str = "top",
        index: Optional[int] = None
    ) -> TextLine:
        """
        Add a new TextLine to the chain.

        Args:
            text: Text content
            text_style: Optional TextStyle (creates default if None)
            alignment_horizontal: Horizontal alignment (left/center/right)
            alignment_vertical: Vertical alignment (top/center/bottom)
            index: Optional specific index to insert at (appends if None)

        Returns:
            TextLine: The newly created TextLine

        Raises:
            ValueError: If index is out of range
        """
        # Create default style if none provided
        if text_style is None:
            text_style = TextStyle(run_count=len(text) + 1)

        # Create the text line
        textline = TextLine(
            index=0,  # Will be set by _reindex
            text=text,
            text_styles=[text_style],
            alignment_horizontal=alignment_horizontal,
            alignment_vertical=alignment_vertical
        )

        # Insert at specific index or append
        if index is not None:
            if not 0 <= index <= len(self.text_lines):
                raise ValueError(f"Index {index} out of range [0, {len(self.text_lines)}]")
            self.text_lines.insert(index, textline)
        else:
            self.text_lines.append(textline)

        # Reindex all text lines
        self._reindex()

        return textline

    def remove_text_line(self, index: int) -> TextLine:
        """
        Remove a TextLine by index.

        Args:
            index: Index of the TextLine to remove

        Returns:
            TextLine: The removed TextLine

        Raises:
            ValueError: If index is invalid
        """
        if not 0 <= index < len(self.text_lines):
            raise ValueError(f"Index {index} out of range [0, {len(self.text_lines)})")

        removed = self.text_lines.pop(index)
        self._reindex()

        return removed

    def get_text_line(self, index: int) -> TextLine:
        """
        Get a TextLine by index.

        Args:
            index: Index of the TextLine

        Returns:
            TextLine: The requested TextLine

        Raises:
            ValueError: If index is invalid
        """
        if not 0 <= index < len(self.text_lines):
            raise ValueError(f"Index {index} out of range [0, {len(self.text_lines)})")

        return self.text_lines[index]

    def update_text(self, index: int, new_text: str):
        """
        Update the text content of a TextLine.

        This automatically updates all RunCount values in the TextLine and its styles.

        Args:
            index: Index of the TextLine to update
            new_text: New text content

        Raises:
            ValueError: If index is invalid
        """
        textline = self.get_text_line(index)
        textline.set_text(new_text)

    def move_text_line(self, from_index: int, to_index: int):
        """
        Move a TextLine from one position to another.

        Args:
            from_index: Current index of the TextLine
            to_index: Target index for the TextLine

        Raises:
            ValueError: If either index is invalid
        """
        if not 0 <= from_index < len(self.text_lines):
            raise ValueError(f"from_index {from_index} out of range")

        if not 0 <= to_index < len(self.text_lines):
            raise ValueError(f"to_index {to_index} out of range")

        textline = self.text_lines.pop(from_index)
        self.text_lines.insert(to_index, textline)
        self._reindex()

    def clear(self):
        """Remove all TextLines from the chain."""
        self.text_lines.clear()

    def __len__(self) -> int:
        """Return the number of TextLines in this chain."""
        return len(self.text_lines)

    def __iter__(self):
        """Iterate over TextLines in this chain."""
        return iter(self.text_lines)

    def __getitem__(self, index: int) -> TextLine:
        """Get TextLine by index using [] operator."""
        return self.get_text_line(index)

    def to_xml(self) -> ET.Element:
        """
        Convert TextChain to XML element for PRTL file.

        Generates the <TextLines> section with all contained TextLine objects.

        Returns:
            ET.Element: XML element representing the TextLines section
        """
        textlines_elem = ET.Element('TextLines')

        # Number of text lines
        ET.SubElement(textlines_elem, 'NumTextLines').text = str(len(self.text_lines))

        # Add each text line
        for textline in self.text_lines:
            textlines_elem.append(textline.to_xml())

        return textlines_elem

    @classmethod
    def from_xml(cls, element: ET.Element) -> 'TextChain':
        """
        Create TextChain from XML element.

        Args:
            element: XML element containing TextLines data

        Returns:
            TextChain: New TextChain instance

        Raises:
            ValueError: If XML structure is invalid
        """
        try:
            text_lines = []

            # Parse all TextLine elements
            for textline_elem in element.findall('TextLine'):
                textline = TextLine.from_xml(textline_elem)
                text_lines.append(textline)

            return cls(text_lines)

        except (AttributeError, ValueError, TypeError) as e:
            raise ValueError(f"Invalid TextChain XML: {e}")

    def validate(self) -> bool:
        """
        Validate the TextChain structure.

        Checks:
        - Indices are sequential starting from 0
        - All TextLines have proper run counts
        - All TextStyle run counts match their parent TextLine

        Returns:
            bool: True if valid

        Raises:
            ValueError: If validation fails
        """
        # Check indices are sequential
        for i, textline in enumerate(self.text_lines):
            if textline.index != i:
                raise ValueError(f"TextLine at position {i} has index {textline.index}")

        # Check each TextLine
        for textline in self.text_lines:
            expected_run_count = len(textline.text) + 1
            if textline.run_count != expected_run_count:
                raise ValueError(
                    f"TextLine {textline.index}: run_count {textline.run_count} "
                    f"!= expected {expected_run_count}"
                )

            # Check all TextStyle run counts
            for style_idx, style in enumerate(textline.text_styles):
                if style.run_count != textline.run_count:
                    raise ValueError(
                        f"TextLine {textline.index}, TextStyle {style_idx}: "
                        f"run_count {style.run_count} != parent {textline.run_count}"
                    )

        return True

    def get_statistics(self) -> Dict[str, any]:
        """
        Get statistics about this TextChain.

        Returns:
            dict: Statistics including counts and details
        """
        total_chars = sum(len(tl.text) for tl in self.text_lines)
        total_styles = sum(len(tl.text_styles) for tl in self.text_lines)

        return {
            'num_text_lines': len(self.text_lines),
            'total_characters': total_chars,
            'total_text_styles': total_styles,
            'avg_chars_per_line': total_chars / len(self.text_lines) if self.text_lines else 0,
            'avg_styles_per_line': total_styles / len(self.text_lines) if self.text_lines else 0,
        }

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"TextChain(text_lines={len(self.text_lines)})"
