"""
TextLine - Text line management for PRTL files

This module implements the TextLine class which manages individual text lines
with their content, styles, alignment, and formatting properties.
"""

from dataclasses import dataclass, field
from typing import List, Optional
import xml.etree.ElementTree as ET

try:
    from .textstyle import TextStyle
except ImportError:
    from textstyle import TextStyle


@dataclass
class TextLine:
    """
    TextLine manages a single line of text in a PRTL file.

    Each TextLine contains the text content, one or more TextStyles for formatting,
    and layout properties like alignment and leading.

    Attributes:
        index: Sequential index of this TextLine (0, 1, 2, ...)
        text: The actual text content
        text_styles: List of TextStyle objects (at least one required)
        alignment_horizontal: Horizontal alignment (left/center/right)
        alignment_vertical: Vertical alignment (top/center/bottom)
        leading_type: Line spacing type (auto/manual)
        leading_value: Line spacing value in points
        baseline_shift: Vertical offset from baseline
        margin_array_size: Number of margin entries (usually 0)
        disp_prev_text_styles: Display previous text styles flag

    Critical Rules:
        - run_count is auto-calculated as len(text) + 1
        - All TextStyle.run_count must match this TextLine's run_count
        - Index must be unique within the parent TextChain
        - At least one TextStyle is required
    """

    index: int
    text: str
    text_styles: List[TextStyle] = field(default_factory=list)
    alignment_horizontal: str = "center"
    alignment_vertical: str = "top"
    leading_type: str = "auto"
    leading_value: float = 120.0
    baseline_shift: float = 0.0
    margin_array_size: int = 0
    disp_prev_text_styles: int = 1
    line_based_paragraph_alignment: bool = False

    def __post_init__(self):
        """Initialize and validate TextLine after creation."""
        # If no text styles provided, create a default one
        if not self.text_styles:
            self.text_styles = [TextStyle(run_count=self.run_count)]

        self._validate()
        self._sync_run_counts()

    @property
    def run_count(self) -> int:
        """
        Calculate RunCount based on text length.

        This follows the PRTL specification: RunCount = len(text) + 1

        Returns:
            int: Calculated run count
        """
        return len(self.text) + 1

    def _validate(self):
        """
        Validate TextLine parameters.

        Raises:
            ValueError: If any parameter is invalid
        """
        if self.index < 0:
            raise ValueError(f"index must be >= 0, got {self.index}")

        if not self.text_styles:
            raise ValueError("At least one TextStyle is required")

        if self.alignment_horizontal not in ["left", "center", "right"]:
            raise ValueError(f"Invalid alignment_horizontal: {self.alignment_horizontal}")

        if self.alignment_vertical not in ["top", "center", "bottom"]:
            raise ValueError(f"Invalid alignment_vertical: {self.alignment_vertical}")

        if self.leading_type not in ["auto", "manual"]:
            raise ValueError(f"Invalid leading_type: {self.leading_type}")

    def _sync_run_counts(self):
        """
        Synchronize all TextStyle run_count values with this TextLine's run_count.

        This is critical for PRTL file validity.
        """
        for style in self.text_styles:
            style.update_run_count(self.run_count)

    def set_text(self, new_text: str):
        """
        Update the text content and synchronize all run counts.

        Args:
            new_text: New text content

        Critical: This automatically updates all TextStyle.run_count values
        """
        self.text = new_text
        self._sync_run_counts()

    def add_text_style(self, text_style: TextStyle):
        """
        Add a new TextStyle to this TextLine.

        Args:
            text_style: TextStyle to add

        Note: The text_style's run_count will be synchronized automatically
        """
        text_style.update_run_count(self.run_count)
        self.text_styles.append(text_style)

    def remove_text_style(self, index: int):
        """
        Remove a TextStyle by index.

        Args:
            index: Index of the TextStyle to remove

        Raises:
            ValueError: If trying to remove the last TextStyle or index is invalid
        """
        if len(self.text_styles) <= 1:
            raise ValueError("Cannot remove the last TextStyle")

        if not 0 <= index < len(self.text_styles):
            raise ValueError(f"Invalid TextStyle index: {index}")

        self.text_styles.pop(index)

    def set_alignment(self, horizontal: Optional[str] = None, vertical: Optional[str] = None):
        """
        Set text alignment.

        Args:
            horizontal: Horizontal alignment (left/center/right)
            vertical: Vertical alignment (top/center/bottom)

        Raises:
            ValueError: If alignment value is invalid
        """
        if horizontal is not None:
            if horizontal not in ["left", "center", "right"]:
                raise ValueError(f"Invalid horizontal alignment: {horizontal}")
            self.alignment_horizontal = horizontal

        if vertical is not None:
            if vertical not in ["top", "center", "bottom"]:
                raise ValueError(f"Invalid vertical alignment: {vertical}")
            self.alignment_vertical = vertical

    def set_leading(self, leading_type: Optional[str] = None, leading_value: Optional[float] = None):
        """
        Set line spacing (leading) properties.

        Args:
            leading_type: Leading type (auto/manual)
            leading_value: Leading value in points

        Raises:
            ValueError: If leading_type is invalid
        """
        if leading_type is not None:
            if leading_type not in ["auto", "manual"]:
                raise ValueError(f"Invalid leading_type: {leading_type}")
            self.leading_type = leading_type

        if leading_value is not None:
            if leading_value <= 0:
                raise ValueError(f"leading_value must be > 0, got {leading_value}")
            self.leading_value = leading_value

    def to_xml(self) -> ET.Element:
        """
        Convert TextLine to XML element for PRTL file.

        Returns:
            ET.Element: XML element representing this TextLine
        """
        textline = ET.Element('TextLine', Index=str(self.index))

        # Core properties
        ET.SubElement(textline, 'RunCount').text = str(self.run_count)
        ET.SubElement(textline, 'Text').text = self.text
        ET.SubElement(textline, 'DispPrevTextStyles').text = str(self.disp_prev_text_styles)

        # Text styles
        ET.SubElement(textline, 'TextStyleArraySize').text = str(len(self.text_styles))
        for i, style in enumerate(self.text_styles):
            textline.append(style.to_xml(i))

        # Margins
        ET.SubElement(textline, 'MarginArraySize').text = str(self.margin_array_size)

        # Alignment
        ET.SubElement(textline, 'VerticalAlignmentAttribute').text = self.alignment_vertical
        ET.SubElement(textline, 'HorizontalAlignmentAttribute').text = self.alignment_horizontal

        # Leading (line spacing)
        ET.SubElement(textline, 'LeadingType').text = self.leading_type
        ET.SubElement(textline, 'LeadingValue').text = str(int(self.leading_value))

        # Baseline shift
        ET.SubElement(textline, 'BaselineShift').text = str(int(self.baseline_shift))

        # Paragraph alignment
        line_based = 'true' if self.line_based_paragraph_alignment else 'false'
        ET.SubElement(textline, 'LineBasedParagraphAlignment').text = line_based

        return textline

    @classmethod
    def from_xml(cls, element: ET.Element) -> 'TextLine':
        """
        Create TextLine from XML element.

        Args:
            element: XML element containing TextLine data

        Returns:
            TextLine: New TextLine instance

        Raises:
            ValueError: If XML structure is invalid
        """
        try:
            index = int(element.get('Index'))
            text = element.find('Text').text or ""

            # Parse text styles
            text_styles = []
            for style_elem in element.findall('TextStyle'):
                text_styles.append(TextStyle.from_xml(style_elem))

            # Parse optional attributes
            h_align_elem = element.find('HorizontalAlignmentAttribute')
            alignment_horizontal = h_align_elem.text if h_align_elem is not None else "center"

            v_align_elem = element.find('VerticalAlignmentAttribute')
            alignment_vertical = v_align_elem.text if v_align_elem is not None else "top"

            leading_type_elem = element.find('LeadingType')
            leading_type = leading_type_elem.text if leading_type_elem is not None else "auto"

            leading_value_elem = element.find('LeadingValue')
            leading_value = float(leading_value_elem.text) if leading_value_elem is not None else 120.0

            baseline_shift_elem = element.find('BaselineShift')
            baseline_shift = float(baseline_shift_elem.text) if baseline_shift_elem is not None else 0.0

            margin_size_elem = element.find('MarginArraySize')
            margin_array_size = int(margin_size_elem.text) if margin_size_elem is not None else 0

            disp_prev_elem = element.find('DispPrevTextStyles')
            disp_prev_text_styles = int(disp_prev_elem.text) if disp_prev_elem is not None else 1

            line_based_elem = element.find('LineBasedParagraphAlignment')
            line_based_paragraph_alignment = (
                line_based_elem.text.lower() == 'true' if line_based_elem is not None else False
            )

            return cls(
                index=index,
                text=text,
                text_styles=text_styles,
                alignment_horizontal=alignment_horizontal,
                alignment_vertical=alignment_vertical,
                leading_type=leading_type,
                leading_value=leading_value,
                baseline_shift=baseline_shift,
                margin_array_size=margin_array_size,
                disp_prev_text_styles=disp_prev_text_styles,
                line_based_paragraph_alignment=line_based_paragraph_alignment
            )
        except (AttributeError, ValueError, TypeError) as e:
            raise ValueError(f"Invalid TextLine XML: {e}")

    def copy(self) -> 'TextLine':
        """
        Create a deep copy of this TextLine.

        Returns:
            TextLine: New TextLine instance with same properties
        """
        return TextLine(
            index=self.index,
            text=self.text,
            text_styles=[style.copy() for style in self.text_styles],
            alignment_horizontal=self.alignment_horizontal,
            alignment_vertical=self.alignment_vertical,
            leading_type=self.leading_type,
            leading_value=self.leading_value,
            baseline_shift=self.baseline_shift,
            margin_array_size=self.margin_array_size,
            disp_prev_text_styles=self.disp_prev_text_styles,
            line_based_paragraph_alignment=self.line_based_paragraph_alignment
        )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (f"TextLine(index={self.index}, text='{self.text}', "
                f"run_count={self.run_count}, styles={len(self.text_styles)})")
