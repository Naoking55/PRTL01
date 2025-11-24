# Session Handoff: Complete TextChain + DrawObject + Style Implementation

## Overview
This document outlines the complete implementation plan for a robust PRTL file generation system with proper TextChain, DrawObject, and Style management based on the comprehensive analysis in `PRTL_File_Analysis_Complete_Guide.md`.

## Implementation Phases

### Phase 1: TextChain Complete Implementation ⚡ START HERE

#### Objectives
- Implement proper TextLine management with correct RunCount calculation
- Support both ASCII and UTF-16 text handling
- Automatic TextStyle synchronization
- Proper reference management between DrawObjects and TextLines

#### Key Components to Implement

1. **TextChain Class**
   - TextLine storage and management
   - Automatic RunCount calculation: `len(text) + 1`
   - TextStyle reference tracking
   - UTF-16 encoding support

2. **TextLine Structure**
   ```python
   class TextLine:
       - index: int
       - text: str
       - run_count: int (auto-calculated)
       - text_styles: List[TextStyle]
       - alignment: str (left/center/right)
       - margin_array_size: int
       - leading_type: str (auto)
       - leading_value: float
       - baseline_shift: float
   ```

3. **TextStyle Structure**
   ```python
   class TextStyle:
       - run_start: int
       - run_count: int (must match TextLine.run_count)
       - font_name: str
       - font_size: float
       - font_face: str (PlainFace/BoldFace/ItalicFace/BoldItalicFace)
       - font_color: RGB
       - painter_style_id: int (reference to PainterStyle)
   ```

4. **Critical Rules**
   - ⚠️ RunCount MUST be updated when text changes
   - ⚠️ All TextStyle.run_count must match TextLine.run_count
   - ⚠️ UTF-16 LE encoding with BOM required for output
   - ⚠️ Index must be sequential (0, 1, 2, ...)

#### Implementation Files
- `src/textchain.py` - Main TextChain management
- `src/textline.py` - TextLine data structure
- `src/textstyle.py` - TextStyle data structure

---

### Phase 2: DrawObject Complete Implementation

#### Objectives
- Implement all DrawObject types (Text, Rectangle, Ellipse, Polygon)
- Proper position and size management
- Reference management to TextLines and ShaderReferences
- Layer order handling

#### DrawObject Types

1. **cTextDraw**
   - Links to TextLine via TextLineReferenceIndex
   - Position (HorizontalPos, VerticalPos)
   - No size specification

2. **cRectangleDraw**
   - Position and Size required
   - ShaderReferenceID for styling
   - Special case: Height 1-2px for horizontal lines

3. **cEllipseDraw**
   - Position and Size required
   - ShaderReferenceID for styling

4. **cPolygonDraw**
   - Complex path definition
   - ShaderReferenceID for styling

#### Key Components

```python
class DrawObject:
    - index: int
    - draw_class_name: str (cTextDraw/cRectangleDraw/etc)
    - painting_range: str (normalLayout)
    - position: Position (x, y)
    - size: Optional[Size] (width, height)
    - layout_info: LayoutInfo
    - layer_order: int

class DrawObjectManager:
    - add_text_object()
    - add_rectangle_object()
    - add_ellipse_object()
    - update_position()
    - update_size()
    - reorder_layers()
```

#### Implementation Files
- `src/drawobject.py` - DrawObject data structures
- `src/drawobject_manager.py` - DrawObject management

---

### Phase 3: Style Complete Implementation

#### Objectives
- PainterStyle management with proper ID allocation
- ShaderReference management
- Effect system (solid color, drop shadow, stroke, glow)
- ID reference validation

#### Style System Components

1. **PainterStyle**
   ```python
   class PainterStyle:
       - id: int (4096-4999 range)
       - annotation: int (65537-65540)
       - painter_array: List[Painter]

   class Painter:
       - painter_class_name: str (cPainterSolidColor/cPainterDropShadow/etc)
       - enable_painting: bool
       - painting_method: str (compositeColorBehind/etc)
       - painting_range: str (normalLayout)
       - attributes: dict (color, angle, distance, etc)
   ```

2. **ShaderReference**
   ```python
   class ShaderReference:
       - id: int (4096-4999 range)
       - annotation: int (131073)
       - fragment_name: str (flatLit/textured/gradientFill)
       - e_fragment_type: int (0=basic, 5=special)
       - painter_mix: str (default: "15 15 15 15...")
       - alpha: int (0-255)
   ```

3. **Style Manager**
   ```python
   class StyleManager:
       - allocate_painter_style_id() -> int
       - allocate_shader_reference_id() -> int
       - create_solid_color_style(color: RGB) -> PainterStyle
       - create_drop_shadow_style(color: RGBA, angle, distance, blur) -> PainterStyle
       - create_stroke_style(color: RGB, width) -> PainterStyle
       - validate_references() -> bool
   ```

#### Annotation Mapping
- 65538: Main text element
- 65537: Drop shadow
- 65539-65540: Effect layers
- 131073: Shader reference

#### Implementation Files
- `src/painter_style.py` - PainterStyle data structures
- `src/shader_reference.py` - ShaderReference data structures
- `src/style_manager.py` - Style management and ID allocation

---

## Critical Implementation Rules

### Encoding Rules
- ✅ Always use UTF-16 LE with BOM
- ✅ First bytes must be: `FF FE 3C 00 3F 00 78 00`
- ✅ Last bytes must be: `6F 00 6F 00 74 00 3E 00`

### RunCount Rules
- ✅ RunCount = len(text) + 1 (basic rule)
- ✅ All TextStyle.run_count must match parent TextLine.run_count
- ✅ Update RunCount immediately when text changes

### ID Allocation Rules
- ✅ PainterStyleID: 4096-4999
- ✅ ShaderReferenceID: 4096-4999
- ✅ No ID conflicts allowed
- ✅ Validate all ID references before saving

### Magic Numbers (DO NOT CHANGE)
- ✅ `placeHolderShaderIndex`: 4294967295
- ✅ `painterMix`: "15 15 15 15 15 15 15 15 15 15 15 15 15 15 15 15"
- ✅ `TXMarker`: "Booyah"

### Resolution Settings (Must Update Together)
```python
RESOLUTIONS = {
    'HD': (1920, 1080, 1.0, 'progressiveScan'),
    '4K': (3840, 2160, 1.0, 'progressiveScan'),
    'NTSC': (720, 480, 0.9, 'upperField'),
    'PAL': (720, 576, 1.067, 'upperField'),
}
```

---

## Validation System

### Required Validators

1. **Encoding Validator**
   ```python
   def validate_encoding(file_path):
       - Check BOM (FF FE)
       - Verify UTF-16 LE encoding
   ```

2. **Structure Validator**
   ```python
   def validate_structure(xml_tree):
       - Check required elements (TitleSpecifics, DrawObjects, TextLines)
       - Verify element hierarchy
   ```

3. **RunCount Validator**
   ```python
   def validate_run_counts(xml_tree):
       - TextLine.RunCount >= len(text)
       - All TextStyle.RunCount == TextLine.RunCount
   ```

4. **ID Reference Validator**
   ```python
   def validate_id_references(xml_tree):
       - All PainterStyleID references exist
       - All ShaderReferenceID references exist
       - No duplicate IDs
   ```

---

## Testing Strategy

### Unit Tests

1. **TextChain Tests**
   - Test RunCount auto-calculation
   - Test text update with RunCount sync
   - Test UTF-16 encoding
   - Test TextStyle synchronization

2. **DrawObject Tests**
   - Test all DrawObject types creation
   - Test position/size updates
   - Test reference management
   - Test layer ordering

3. **Style Tests**
   - Test ID allocation
   - Test style creation (solid color, shadow, stroke)
   - Test reference validation
   - Test annotation mapping

### Integration Tests

1. **Template-based Tests**
   - Load existing PRTL template
   - Modify text and validate
   - Save and reload
   - Verify in Premiere Pro

2. **Generation Tests**
   - Generate new PRTL from scratch
   - Add multiple text objects
   - Apply various styles
   - Verify output validity

---

## File Structure

```
PRTL01/
├── docs/
│   ├── session-handoff-complete-implementation.md (this file)
│   └── PRTL_File_Analysis_Complete_Guide.md
├── src/
│   ├── __init__.py
│   ├── textchain.py          # Phase 1
│   ├── textline.py           # Phase 1
│   ├── textstyle.py          # Phase 1
│   ├── drawobject.py         # Phase 2
│   ├── drawobject_manager.py # Phase 2
│   ├── painter_style.py      # Phase 3
│   ├── shader_reference.py   # Phase 3
│   ├── style_manager.py      # Phase 3
│   ├── prtl_generator.py     # Main generator
│   └── validators.py         # Validation system
├── tests/
│   ├── test_textchain.py
│   ├── test_drawobject.py
│   ├── test_style.py
│   └── test_integration.py
├── templates/
│   └── base_template.prtl
└── examples/
    └── generate_title.py
```

---

## Phase 1 Implementation Checklist

### Step 1: Core Data Structures
- [ ] Create `src/textstyle.py` with TextStyle class
- [ ] Create `src/textline.py` with TextLine class
- [ ] Implement automatic RunCount calculation
- [ ] Add UTF-16 encoding support

### Step 2: TextChain Manager
- [ ] Create `src/textchain.py` with TextChain class
- [ ] Implement add_text_line() method
- [ ] Implement update_text() method with RunCount sync
- [ ] Implement remove_text_line() method
- [ ] Add index management and reordering

### Step 3: XML Serialization
- [ ] Implement to_xml() for TextStyle
- [ ] Implement to_xml() for TextLine
- [ ] Implement to_xml() for TextChain
- [ ] Add proper XML formatting with indentation

### Step 4: Validation
- [ ] Implement RunCount validator
- [ ] Implement text length validator
- [ ] Add character encoding checks

### Step 5: Testing
- [ ] Create basic unit tests
- [ ] Test RunCount calculation
- [ ] Test text updates
- [ ] Test XML output format

---

## Success Criteria

### Phase 1 Success
- ✅ Can create TextLine objects programmatically
- ✅ RunCount automatically calculated and synchronized
- ✅ Text updates properly sync all RunCount values
- ✅ XML output matches PRTL format specification
- ✅ UTF-16 LE encoding preserved
- ✅ All validators pass

### Phase 2 Success
- ✅ Can create all DrawObject types
- ✅ Proper reference to TextLines
- ✅ Position and size management working
- ✅ Layer ordering functional

### Phase 3 Success
- ✅ PainterStyles created with correct IDs
- ✅ ShaderReferences managed properly
- ✅ All effect types working (color, shadow, stroke, glow)
- ✅ ID reference validation passes

### Overall Success
- ✅ Can generate valid PRTL file from scratch
- ✅ File loads in Adobe Premiere Pro without errors
- ✅ Text displays correctly
- ✅ Styles applied correctly
- ✅ All validators pass

---

## Next Session Instructions

**START HERE**: Implement Phase 1 (TextChain) following this sequence:

1. Read this document carefully
2. Create `src/` directory structure
3. Implement `src/textstyle.py` first (smallest component)
4. Implement `src/textline.py` next
5. Implement `src/textchain.py` last
6. Create unit tests as you go
7. Validate against existing PRTL files

**Key Files to Reference**:
- `PRTL_File_Analysis_Complete_Guide.md` - Complete specification
- `legacy_title_editor_v636_fixed.py` - Existing implementation (for reference only)

**Do NOT**:
- Modify legacy file directly
- Skip validation steps
- Use hardcoded magic numbers without documentation
- Create files without proper UTF-16 encoding

---

## Notes

- This implementation is designed to be production-ready
- All code should include proper type hints
- All functions should have docstrings
- Follow Python best practices (PEP 8)
- Prioritize safety and validation over features

---

**Document Version**: 1.0
**Created**: 2025-11-24
**Status**: Ready for Phase 1 Implementation
