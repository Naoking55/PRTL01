"""
Validators - PRTL file validation system

This module provides comprehensive validation for PRTL files to ensure
they meet Adobe Premiere Pro specifications and will load without errors.
"""

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Set, Tuple, Optional
import codecs


class EncodingValidator:
    """Validates file encoding for PRTL files."""

    @staticmethod
    def validate_encoding(file_path: str) -> Tuple[bool, Optional[str]]:
        """
        Validate that a file uses UTF-16 LE encoding with BOM.

        Args:
            file_path: Path to the file to validate

        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        try:
            with open(file_path, 'rb') as f:
                # Read first 8 bytes
                header = f.read(8)

                if len(header) < 2:
                    return False, "File is too small to be a valid PRTL file"

                # Check for UTF-16 LE BOM (FF FE)
                if header[0:2] != b'\xff\xfe':
                    return False, f"Missing UTF-16 LE BOM. Found: {header[0:2].hex()}"

                # Check expected PRTL header pattern (FF FE 3C 00 3F 00 78 00)
                # This is "<?x" in UTF-16 LE
                expected_start = b'\xff\xfe\x3c\x00\x3f\x00\x78\x00'
                if header != expected_start:
                    return False, f"Invalid PRTL header. Expected: {expected_start.hex()}, Got: {header.hex()}"

                return True, None

        except FileNotFoundError:
            return False, f"File not found: {file_path}"
        except Exception as e:
            return False, f"Error reading file: {e}"

    @staticmethod
    def validate_ending(file_path: str) -> Tuple[bool, Optional[str]]:
        """
        Validate that a file ends with proper UTF-16 LE closing tag.

        Args:
            file_path: Path to the file to validate

        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        try:
            with open(file_path, 'rb') as f:
                # Seek to end and read last 8 bytes
                f.seek(-8, 2)
                footer = f.read(8)

                # Expected: "oot>" in UTF-16 LE (6F 00 6F 00 74 00 3E 00)
                expected_end = b'\x6f\x00\x6f\x00\x74\x00\x3e\x00'
                if footer != expected_end:
                    return False, f"Invalid PRTL footer. Expected: {expected_end.hex()}, Got: {footer.hex()}"

                return True, None

        except Exception as e:
            return False, f"Error reading file ending: {e}"


class StructureValidator:
    """Validates XML structure of PRTL files."""

    REQUIRED_ELEMENTS = [
        'PremiereData',
        'TitleSpecifics',
        'Width',
        'Height',
        'PixelAspectRatio',
        'FieldType',
    ]

    @staticmethod
    def validate_structure(xml_tree: ET.ElementTree) -> Tuple[bool, List[str]]:
        """
        Validate that XML has all required elements.

        Args:
            xml_tree: Parsed XML tree

        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        errors = []
        root = xml_tree.getroot()

        # Check root element
        if root.tag != 'PremiereData':
            errors.append(f"Root element must be 'PremiereData', got '{root.tag}'")

        # Check version attribute
        version = root.get('Version')
        if version != '3':
            errors.append(f"PremiereData Version must be '3', got '{version}'")

        # Check for TitleSpecifics
        title_specs = root.find('.//TitleSpecifics')
        if title_specs is None:
            errors.append("Missing required element: TitleSpecifics")
            return False, errors

        # Check required child elements
        for elem_name in ['Width', 'Height', 'PixelAspectRatio', 'FieldType']:
            elem = title_specs.find(elem_name)
            if elem is None:
                errors.append(f"Missing required element: {elem_name}")

        return len(errors) == 0, errors


class RunCountValidator:
    """Validates RunCount consistency in TextLines."""

    @staticmethod
    def validate_run_counts(xml_tree: ET.ElementTree) -> Tuple[bool, List[str]]:
        """
        Validate that all RunCount values are consistent.

        Critical rules:
        - TextLine.RunCount >= len(TextLine.Text)
        - All TextStyle.RunCount == parent TextLine.RunCount

        Args:
            xml_tree: Parsed XML tree

        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        errors = []
        root = xml_tree.getroot()

        # Find all TextLine elements
        for textline in root.findall('.//TextLine'):
            index = textline.get('Index', 'unknown')

            # Get text and run count
            text_elem = textline.find('Text')
            run_count_elem = textline.find('RunCount')

            if text_elem is None or run_count_elem is None:
                errors.append(f"TextLine {index}: Missing Text or RunCount element")
                continue

            text = text_elem.text or ""
            try:
                run_count = int(run_count_elem.text)
            except (ValueError, TypeError):
                errors.append(f"TextLine {index}: Invalid RunCount value: {run_count_elem.text}")
                continue

            # Validate run count is at least text length
            expected_min = len(text)
            if run_count < expected_min:
                errors.append(
                    f"TextLine {index}: RunCount {run_count} < text length {expected_min}"
                )

            # Recommended: RunCount should be exactly len(text) + 1
            expected_run_count = len(text) + 1
            if run_count != expected_run_count:
                # This is a warning, not an error
                print(f"Warning: TextLine {index}: RunCount {run_count} != recommended {expected_run_count}")

            # Check all TextStyle run counts match
            for style in textline.findall('.//TextStyle'):
                style_index = style.get('Index', 'unknown')
                style_run_count_elem = style.find('RunCount')

                if style_run_count_elem is None:
                    errors.append(f"TextLine {index}, TextStyle {style_index}: Missing RunCount")
                    continue

                try:
                    style_run_count = int(style_run_count_elem.text)
                except (ValueError, TypeError):
                    errors.append(
                        f"TextLine {index}, TextStyle {style_index}: "
                        f"Invalid RunCount: {style_run_count_elem.text}"
                    )
                    continue

                if style_run_count != run_count:
                    errors.append(
                        f"TextLine {index}, TextStyle {style_index}: "
                        f"RunCount {style_run_count} != parent RunCount {run_count}"
                    )

        return len(errors) == 0, errors


class IDReferenceValidator:
    """Validates ID references in PRTL files."""

    @staticmethod
    def validate_id_references(xml_tree: ET.ElementTree) -> Tuple[bool, List[str]]:
        """
        Validate that all ID references point to existing elements.

        Checks:
        - PainterStyleID references exist in PainterStyles
        - ShaderReferenceID references exist in ShaderReferences
        - No duplicate IDs

        Args:
            xml_tree: Parsed XML tree

        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        errors = []
        root = xml_tree.getroot()

        # Collect all PainterStyle IDs
        painter_style_ids: Set[int] = set()
        for style in root.findall('.//PainterStyles/PainterStyle'):
            style_id = style.get('ID')
            if style_id:
                try:
                    style_id_int = int(style_id)
                    if style_id_int in painter_style_ids:
                        errors.append(f"Duplicate PainterStyle ID: {style_id}")
                    painter_style_ids.add(style_id_int)
                except ValueError:
                    errors.append(f"Invalid PainterStyle ID: {style_id}")

        # Collect all ShaderReference IDs
        shader_ref_ids: Set[int] = set()
        for ref in root.findall('.//ShaderReferences/ShaderReference'):
            ref_id = ref.get('ID')
            if ref_id:
                try:
                    ref_id_int = int(ref_id)
                    if ref_id_int in shader_ref_ids:
                        errors.append(f"Duplicate ShaderReference ID: {ref_id}")
                    shader_ref_ids.add(ref_id_int)
                except ValueError:
                    errors.append(f"Invalid ShaderReference ID: {ref_id}")

        # Check all PainterStyleID references
        for ref in root.findall('.//PainterStyleID'):
            try:
                ref_id = int(ref.text)
                if ref_id not in painter_style_ids:
                    errors.append(f"PainterStyleID {ref_id} references non-existent PainterStyle")
            except (ValueError, TypeError):
                errors.append(f"Invalid PainterStyleID value: {ref.text}")

        # Check all ShaderReferenceID references
        for ref in root.findall('.//ShaderReferenceID'):
            try:
                ref_id = int(ref.text)
                if ref_id not in shader_ref_ids:
                    errors.append(f"ShaderReferenceID {ref_id} references non-existent ShaderReference")
            except (ValueError, TypeError):
                errors.append(f"Invalid ShaderReferenceID value: {ref.text}")

        return len(errors) == 0, errors


class PRTLValidator:
    """Main validator that combines all validation checks."""

    @staticmethod
    def validate_file(file_path: str, skip_encoding: bool = False) -> Tuple[bool, List[str]]:
        """
        Perform complete validation of a PRTL file.

        Args:
            file_path: Path to PRTL file
            skip_encoding: Skip encoding validation (useful for in-memory XML)

        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        all_errors = []

        # 1. Encoding validation
        if not skip_encoding:
            is_valid, error = EncodingValidator.validate_encoding(file_path)
            if not is_valid:
                all_errors.append(f"Encoding error: {error}")

            is_valid, error = EncodingValidator.validate_ending(file_path)
            if not is_valid:
                all_errors.append(f"Ending error: {error}")

        # 2. Parse XML
        try:
            # Parse with UTF-16 encoding
            with codecs.open(file_path, 'r', encoding='utf-16-le') as f:
                content = f.read()
                # Remove BOM if present
                if content.startswith('\ufeff'):
                    content = content[1:]
                xml_tree = ET.ElementTree(ET.fromstring(content))
        except Exception as e:
            all_errors.append(f"XML parsing error: {e}")
            return False, all_errors

        # 3. Structure validation
        is_valid, errors = StructureValidator.validate_structure(xml_tree)
        all_errors.extend(errors)

        # 4. RunCount validation
        is_valid, errors = RunCountValidator.validate_run_counts(xml_tree)
        all_errors.extend(errors)

        # 5. ID reference validation
        is_valid, errors = IDReferenceValidator.validate_id_references(xml_tree)
        all_errors.extend(errors)

        return len(all_errors) == 0, all_errors

    @staticmethod
    def validate_xml_tree(xml_tree: ET.ElementTree) -> Tuple[bool, List[str]]:
        """
        Validate an in-memory XML tree (without file encoding checks).

        Args:
            xml_tree: Parsed XML tree

        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        all_errors = []

        # Structure validation
        is_valid, errors = StructureValidator.validate_structure(xml_tree)
        all_errors.extend(errors)

        # RunCount validation
        is_valid, errors = RunCountValidator.validate_run_counts(xml_tree)
        all_errors.extend(errors)

        # ID reference validation
        is_valid, errors = IDReferenceValidator.validate_id_references(xml_tree)
        all_errors.extend(errors)

        return len(all_errors) == 0, all_errors


def print_validation_report(file_path: str):
    """
    Print a detailed validation report for a PRTL file.

    Args:
        file_path: Path to PRTL file
    """
    print(f"\n{'='*60}")
    print(f"PRTL Validation Report: {Path(file_path).name}")
    print(f"{'='*60}\n")

    is_valid, errors = PRTLValidator.validate_file(file_path)

    if is_valid:
        print("✅ File is VALID")
        print("\nAll validation checks passed successfully.")
    else:
        print("❌ File is INVALID")
        print(f"\nFound {len(errors)} error(s):\n")
        for i, error in enumerate(errors, 1):
            print(f"  {i}. {error}")

    print(f"\n{'='*60}\n")

    return is_valid
