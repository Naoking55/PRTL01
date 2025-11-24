#!/usr/bin/env python3
"""
Example: Using TextChain to create and manage text lines

This example demonstrates the Phase 1 TextChain implementation,
showing how to create, modify, and manage text lines with proper
RunCount synchronization.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from textchain import TextChain
from textline import TextLine
from textstyle import TextStyle


def example_basic_usage():
    """Basic TextChain usage example."""
    print("="*60)
    print("Example 1: Basic TextChain Usage")
    print("="*60)

    # Create a new TextChain
    chain = TextChain()

    # Add text lines
    chain.add_text_line("Title One")
    chain.add_text_line("Title Two")
    chain.add_text_line("Title Three")

    print(f"\nCreated chain with {len(chain)} text lines:")
    for i, line in enumerate(chain):
        print(f"  {i}. '{line.text}' (run_count={line.run_count})")

    # Update text
    print("\nUpdating first line to 'Hello World'...")
    chain.update_text(0, "Hello World")

    print(f"Updated text: '{chain[0].text}' (run_count={chain[0].run_count})")

    # Validate
    print("\nValidating chain...")
    if chain.validate():
        print("✅ Chain is valid!")

    print()


def example_custom_styles():
    """Example with custom text styles."""
    print("="*60)
    print("Example 2: Custom Text Styles")
    print("="*60)

    chain = TextChain()

    # Create custom styles
    title_style = TextStyle(
        font_name="Arial",
        font_size=100.0,
        font_face="BoldFace",
        font_color=(255, 215, 0),  # Gold
        painter_style_id=4096
    )

    subtitle_style = TextStyle(
        font_name="Times New Roman",
        font_size=72.0,
        font_face="ItalicFace",
        font_color=(255, 255, 255),  # White
        painter_style_id=4097
    )

    # Add lines with custom styles
    chain.add_text_line("Main Title", text_style=title_style)
    chain.add_text_line("Subtitle", text_style=subtitle_style)

    print(f"\nCreated chain with {len(chain)} styled text lines:")
    for i, line in enumerate(chain):
        style = line.text_styles[0]
        print(f"  {i}. '{line.text}'")
        print(f"     Font: {style.font_name}, Size: {style.font_size}, Color: {style.font_color}")

    print()


def example_alignment():
    """Example with different alignments."""
    print("="*60)
    print("Example 3: Text Alignment")
    print("="*60)

    chain = TextChain()

    # Add lines with different alignments
    chain.add_text_line("Left Aligned", alignment_horizontal="left")
    chain.add_text_line("Center Aligned", alignment_horizontal="center")
    chain.add_text_line("Right Aligned", alignment_horizontal="right")

    print(f"\nCreated chain with {len(chain)} differently aligned text lines:")
    for i, line in enumerate(chain):
        print(f"  {i}. '{line.text}' - {line.alignment_horizontal}")

    print()


def example_reordering():
    """Example with reordering text lines."""
    print("="*60)
    print("Example 4: Reordering Text Lines")
    print("="*60)

    chain = TextChain()

    # Add lines
    chain.add_text_line("First")
    chain.add_text_line("Second")
    chain.add_text_line("Third")

    print("\nOriginal order:")
    for i, line in enumerate(chain):
        print(f"  {i}. '{line.text}' (index={line.index})")

    # Move "Third" to position 0
    print("\nMoving 'Third' to position 0...")
    chain.move_text_line(2, 0)

    print("\nNew order:")
    for i, line in enumerate(chain):
        print(f"  {i}. '{line.text}' (index={line.index})")

    print()


def example_xml_output():
    """Example showing XML output."""
    print("="*60)
    print("Example 5: XML Output")
    print("="*60)

    chain = TextChain()
    chain.add_text_line("Hello")
    chain.add_text_line("World")

    # Generate XML
    import xml.etree.ElementTree as ET
    xml_elem = chain.to_xml()

    # Pretty print
    from xml.dom import minidom
    xml_str = ET.tostring(xml_elem, encoding='unicode')
    pretty_xml = minidom.parseString(xml_str).toprettyxml(indent="  ")

    print("\nGenerated XML:")
    print(pretty_xml)


def example_statistics():
    """Example showing statistics."""
    print("="*60)
    print("Example 6: Chain Statistics")
    print("="*60)

    chain = TextChain()
    chain.add_text_line("Hello World")
    chain.add_text_line("This is a test")
    chain.add_text_line("PRTL Files")

    stats = chain.get_statistics()

    print("\nChain Statistics:")
    print(f"  Number of text lines: {stats['num_text_lines']}")
    print(f"  Total characters: {stats['total_characters']}")
    print(f"  Total text styles: {stats['total_text_styles']}")
    print(f"  Average chars per line: {stats['avg_chars_per_line']:.2f}")
    print(f"  Average styles per line: {stats['avg_styles_per_line']:.2f}")

    print()


def example_run_count_sync():
    """Example demonstrating RunCount synchronization."""
    print("="*60)
    print("Example 7: RunCount Synchronization")
    print("="*60)

    chain = TextChain()
    line = chain.add_text_line("Hello")

    print(f"\nInitial text: '{line.text}'")
    print(f"  TextLine run_count: {line.run_count}")
    print(f"  TextStyle run_count: {line.text_styles[0].run_count}")

    # Add multiple styles
    line.add_text_style(TextStyle())
    line.add_text_style(TextStyle())

    print(f"\nAdded 2 more styles, all have run_count: {line.run_count}")

    # Change text
    line.set_text("Hello World!")

    print(f"\nChanged text to: '{line.text}'")
    print(f"  TextLine run_count: {line.run_count}")
    print("  All TextStyle run_counts:")
    for i, style in enumerate(line.text_styles):
        print(f"    Style {i}: {style.run_count}")

    # Validate
    if chain.validate():
        print("\n✅ All run_counts are synchronized correctly!")

    print()


def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("TextChain Phase 1 Implementation Examples")
    print("="*60 + "\n")

    example_basic_usage()
    example_custom_styles()
    example_alignment()
    example_reordering()
    example_xml_output()
    example_statistics()
    example_run_count_sync()

    print("="*60)
    print("All examples completed successfully!")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
