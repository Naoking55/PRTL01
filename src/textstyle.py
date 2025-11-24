"""
TextStyle - Text styling and formatting for PRTL files

This module implements the TextStyle class which manages font properties,
colors, and painter style references for text elements in PRTL files.
"""

from dataclasses import dataclass, field
from typing import Tuple, Optional
import xml.etree.ElementTree as ET


@dataclass
class TextStyle:
    """
    TextStyle manages the visual appearance of text in PRTL files.

    Each TextStyle defines formatting for a run of text within a TextLine.
    Multiple TextStyles can be applied to different portions of the same TextLine.

    Attributes:
        run_start: Starting position in the text (usually 0)
        run_count: Number of characters this style applies to (must match TextLine.run_count)
        font_name: Font family name (e.g., 'Times New Roman', 'Yu Gothic')
        font_size: Font size in points
        font_face: Font style (PlainFace/BoldFace/ItalicFace/BoldItalicFace)
        font_color: RGB color tuple (r, g, b) where each value is 0-255
        painter_style_id: Reference to PainterStyle ID for effects (default: 4096)
        disp_prev_text_styles: Display previous text styles flag (default: 1)

    Critical Rules:
        - run_count MUST match parent TextLine.run_count
        - font_color values must be in range 0-255
        - painter_style_id must reference a valid PainterStyle
    """

    run_start: int = 0
    run_count: int = 1
    font_name: str = "Times New Roman"
    font_size: float = 100.0
    font_face: str = "BoldFace"
    font_color: Tuple[int, int, int] = (255, 215, 0)  # Gold color
    painter_style_id: int = 4096
    disp_prev_text_styles: int = 1

    def __post_init__(self):
        """Validate TextStyle parameters after initialization."""
        self._validate()

    def _validate(self):
        """
        Validate TextStyle parameters.

        Raises:
            ValueError: If any parameter is invalid
        """
        if self.run_start < 0:
            raise ValueError(f"run_start must be >= 0, got {self.run_start}")

        if self.run_count < 1:
            raise ValueError(f"run_count must be >= 1, got {self.run_count}")

        if self.font_size <= 0:
            raise ValueError(f"font_size must be > 0, got {self.font_size}")

        if self.font_face not in ["PlainFace", "BoldFace", "ItalicFace", "BoldItalicFace"]:
            raise ValueError(f"Invalid font_face: {self.font_face}")

        if len(self.font_color) != 3:
            raise ValueError(f"font_color must be RGB tuple, got {self.font_color}")

        for i, value in enumerate(self.font_color):
            if not 0 <= value <= 255:
                raise ValueError(f"font_color[{i}] must be 0-255, got {value}")

        if not 4096 <= self.painter_style_id <= 4999:
            raise ValueError(f"painter_style_id must be 4096-4999, got {self.painter_style_id}")

    def update_run_count(self, new_run_count: int):
        """
        Update the run_count for this style.

        This is called automatically when the parent TextLine's text changes.

        Args:
            new_run_count: New run count value

        Raises:
            ValueError: If new_run_count is invalid
        """
        if new_run_count < 1:
            raise ValueError(f"run_count must be >= 1, got {new_run_count}")

        self.run_count = new_run_count

    def set_color(self, r: int, g: int, b: int):
        """
        Set the font color.

        Args:
            r: Red component (0-255)
            g: Green component (0-255)
            b: Blue component (0-255)

        Raises:
            ValueError: If any color component is out of range
        """
        for name, value in [('r', r), ('g', g), ('b', b)]:
            if not 0 <= value <= 255:
                raise ValueError(f"{name} must be 0-255, got {value}")

        self.font_color = (r, g, b)

    def to_xml(self, index: int) -> ET.Element:
        """
        Convert TextStyle to XML element for PRTL file.

        Args:
            index: Index of this TextStyle within the parent TextLine

        Returns:
            ET.Element: XML element representing this TextStyle
        """
        text_style = ET.Element('TextStyle', Index=str(index))

        # Add all properties in the correct order
        ET.SubElement(text_style, 'RunStart').text = str(self.run_start)
        ET.SubElement(text_style, 'RunCount').text = str(self.run_count)
        ET.SubElement(text_style, 'DispPrevTextStyles').text = str(self.disp_prev_text_styles)
        ET.SubElement(text_style, 'FontName').text = self.font_name
        ET.SubElement(text_style, 'FontSize').text = str(int(self.font_size))
        ET.SubElement(text_style, 'FontFace').text = self.font_face

        # Font color as space-separated RGB
        color_str = f"{self.font_color[0]} {self.font_color[1]} {self.font_color[2]}"
        ET.SubElement(text_style, 'FontColor').text = color_str

        ET.SubElement(text_style, 'PainterStyleID').text = str(self.painter_style_id)

        return text_style

    @classmethod
    def from_xml(cls, element: ET.Element) -> 'TextStyle':
        """
        Create TextStyle from XML element.

        Args:
            element: XML element containing TextStyle data

        Returns:
            TextStyle: New TextStyle instance

        Raises:
            ValueError: If XML structure is invalid
        """
        try:
            run_start = int(element.find('RunStart').text)
            run_count = int(element.find('RunCount').text)
            font_name = element.find('FontName').text
            font_size = float(element.find('FontSize').text)
            font_face = element.find('FontFace').text

            # Parse color
            color_text = element.find('FontColor').text
            r, g, b = map(int, color_text.split())

            painter_style_id = int(element.find('PainterStyleID').text)

            disp_prev = element.find('DispPrevTextStyles')
            disp_prev_text_styles = int(disp_prev.text) if disp_prev is not None else 1

            return cls(
                run_start=run_start,
                run_count=run_count,
                font_name=font_name,
                font_size=font_size,
                font_face=font_face,
                font_color=(r, g, b),
                painter_style_id=painter_style_id,
                disp_prev_text_styles=disp_prev_text_styles
            )
        except (AttributeError, ValueError, TypeError) as e:
            raise ValueError(f"Invalid TextStyle XML: {e}")

    def copy(self) -> 'TextStyle':
        """
        Create a deep copy of this TextStyle.

        Returns:
            TextStyle: New TextStyle instance with same properties
        """
        return TextStyle(
            run_start=self.run_start,
            run_count=self.run_count,
            font_name=self.font_name,
            font_size=self.font_size,
            font_face=self.font_face,
            font_color=self.font_color,
            painter_style_id=self.painter_style_id,
            disp_prev_text_styles=self.disp_prev_text_styles
        )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (f"TextStyle(font_name='{self.font_name}', font_size={self.font_size}, "
                f"font_face='{self.font_face}', color={self.font_color}, "
                f"run_count={self.run_count})")
