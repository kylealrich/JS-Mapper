# Multi-Record-Type File Support

## Overview

The JavaScript Mapper now supports files where different lines have different layouts (multi-record-type files). This is common in healthcare and financial systems where a single file contains Header, Line, Detail, and Comment records with different field structures.

## Key Features

- **Hierarchical Output**: Generates JSON with parent-child relationships
- **Configuration-Driven**: Define record types and relationships via CSV
- **Reusable Mapper**: Generated JavaScript function can process similar files
- **Fixed-Length Support**: Works with fixed-length field layouts
- **Flexible Relationships**: Support for nested parent-child structures

## Configuration Structure

### Record Type Configuration CSV

Defines the record types in your file and their relationships.

**Columns:**
- `Record Type`: Name of the record type (e.g., Header, Line, Detail)
- `Type Indicator Position`: Character position that identifies the record type (1-indexed)
- `Type Indicator Value`: Character value at that position (e.g., H, L, D, C)
- `Mapping File`: CSV file containing field layout for this record type
- `Parent Record Type`: Name of parent record type (empty for root records)
- `Output Name`: Array name in hierarchical output (e.g., LineItems, Details)

**Example:**
```csv
Record Type,Type Indicator Position,Type Indicator Value,Mapping File,Parent Record Type,Output Name
Header,1,H,OMRQ_Header_FixedLength_Mapping.csv,,Headers
Line,1,L,OMRQ_Line_FixedLength_Mapping.csv,Header,LineItems
Detail,1,D,OMRQ_Detail_FixedLength_Mapping.csv,Line,Details
Comment,1,C,OMRQ_Comment_FixedLength_Mapping.csv,Header,Comments
```

### Field Mapping CSVs

Each record type needs its own fixed-length mapping CSV with these columns:
- `Field Name`: Name of the field
- `Start`: Starting position (1-indexed)
- `End`: Ending position (inclusive)
- `Length`: Field length in characters
- `Required`: Y/N - whether field must have a value
- `Mapping Logic`: Transformation logic (optional)
- `Pad Character`: Character used for padding (space, 0, etc.)
- `Justify`: Left or Right - determines padding strip direction
- `Default Value`: Value to use when field is empty
- `Description`: Documentation (not used in processing)

## Usage Workflow

### 1. Prepare Configuration Files

Create a record type configuration CSV that defines:
- All record types in your file
- How to identify each type (position and value)
- Parent-child relationships
- Mapping file for each type

### 2. Create Field Mappings

For each record type, create a fixed-length mapping CSV that defines:
- All fields in that record type
- Start/end positions
- Padding and justification rules
- Default values

### 3. Process in JavaScript Mapper

1. Open `JavaScript_Mapper.html`
2. Select "Fixed-Length" file type
3. Check "Multi-Record-Type File" checkbox
4. Upload your data file
5. Upload record type configuration CSV
6. Click "Preview Files"
7. When prompted, select all mapping files in order
8. Review the preview (grouped by record type)
9. Click "Generate Mapper JS + Output CSV"
10. Download the generated JavaScript mapper and JSON output

## Output Format

### Hierarchical JSON Structure

```json
[
  {
    "type": "Header",
    "data": {
      "Field1": "value1",
      "Field2": "value2",
      "_recordType": "Header",
      "_lineNumber": 1
    },
    "children": {
      "LineItems": [
        {
          "type": "Line",
          "data": {
            "Field1": "value1",
            "_recordType": "Line",
            "_lineNumber": 2
          },
          "children": {
            "Details": [
              {
                "type": "Detail",
                "data": {
                  "Field1": "value1",
                  "_recordType": "Detail",
                  "_lineNumber": 3
                },
                "children": {}
              }
            ]
          }
        }
      ],
      "Comments": [
        {
          "type": "Comment",
          "data": {
            "Field1": "value1",
            "_recordType": "Comment",
            "_lineNumber": 4
          },
          "children": {}
        }
      ]
    }
  }
]
```

### Generated JavaScript Mapper

The generated JavaScript file contains:
- `processMultiRecordTypeFile(fileContent)` function
- Embedded record type configuration
- Embedded field mappings for all record types
- Field extraction logic with padding support
- Hierarchical structure building logic

**Usage:**
```javascript
var fileContent = '...'; // Read your fixed-length file
var hierarchicalData = processMultiRecordTypeFile(fileContent);
console.log(JSON.stringify(hierarchicalData, null, 2));
```

## Parent-Child Relationships

### Root Records
Records with no `Parent Record Type` are root records. Each root record starts a new hierarchical structure.

### Child Records
Records with a `Parent Record Type` are nested under their parent. The `Output Name` determines the array name in the parent's `children` object.

### Nested Children
Children can have their own children. For example:
- Header (root)
  - LineItems (children of Header)
    - Details (children of LineItems)
  - Comments (children of Header)

### Parent Stack Management
The system maintains a parent stack to handle nested relationships:
- When a root record is encountered, it becomes the current parent
- When a child record is encountered, it's added to the current parent's children
- If the child's parent type matches the current parent type, the child becomes the new current parent (for nested children)

## Example: OMRQ Requisition File

### File Structure
```
H... (Header record - requisition info)
L... (Line item 1)
D... (Detail for line 1)
L... (Line item 2)
D... (Detail 1 for line 2)
D... (Detail 2 for line 2)
C... (Comment for requisition)
```

### Configuration
- Header: Root record (no parent)
- Line: Child of Header (output as "LineItems")
- Detail: Child of Line (output as "Details")
- Comment: Child of Header (output as "Comments")

### Output Structure
```json
[
  {
    "type": "Header",
    "data": { ... },
    "children": {
      "LineItems": [
        {
          "type": "Line",
          "data": { ... },
          "children": {
            "Details": [
              { "type": "Detail", "data": { ... } }
            ]
          }
        },
        {
          "type": "Line",
          "data": { ... },
          "children": {
            "Details": [
              { "type": "Detail", "data": { ... } },
              { "type": "Detail", "data": { ... } }
            ]
          }
        }
      ],
      "Comments": [
        { "type": "Comment", "data": { ... } }
      ]
    }
  }
]
```

## Best Practices

1. **Use Descriptive Output Names**: Choose clear names like "LineItems" instead of just "Lines"
2. **Document Field Positions**: Use the Description column to document field purposes
3. **Test with Sample Data**: Always test with a small sample file first
4. **Validate Relationships**: Ensure parent-child relationships match your data structure
5. **Handle Missing Parents**: The system gracefully handles orphaned child records
6. **Use Padding Rules**: Configure padding and justification to properly extract numeric fields

## Troubleshooting

### Preview Shows No Records
- Check that Type Indicator Position and Value match your data
- Verify the indicator position is 1-indexed (first character is position 1)
- Ensure mapping files are selected in the correct order

### Fields Are Blank
- Verify Start/End positions are correct (1-indexed, inclusive)
- Check padding character and justification settings
- Review the raw data to confirm field positions

### Parent-Child Relationships Wrong
- Verify Parent Record Type names match exactly
- Check that parent records appear before child records in the file
- Ensure Output Name is unique for each child type under the same parent

### Generated Mapper Doesn't Work
- Check for JavaScript syntax errors in the generated code
- Verify the embedded configuration matches your files
- Test with the same input file used during generation

## Files Created

- `input/RecordType_Config_Template.csv` - Blank template for record type configuration
- `input/OMRQ_RecordType_Config.csv` - Example configuration for OMRQ files
- `input/OMRQ_Header_FixedLength_Mapping.csv` - Header record field layout
- `input/OMRQ_Line_FixedLength_Mapping.csv` - Line item field layout
- `input/OMRQ_Detail_FixedLength_Mapping.csv` - Detail record field layout
- `input/OMRQ_Comment_FixedLength_Mapping.csv` - Comment record field layout
- `test_multi_record.html` - Test instructions and verification guide
