# JavaScript Mapper - Template Files

This folder contains sample template files for both delimited and fixed-length data processing.

## File Overview

### Delimited Files
- **delimited_input_sample.csv** - Sample CSV input with multi-record types (H, L, D, C)
- **delimited_mapping_sample.csv** - Mapping configuration for delimited files

### Fixed-Length Files
- **fixed_length_input_sample.txt** - Sample fixed-length input with multi-record types
- **fixed_length_header_mapping.csv** - Header record (H) field mapping
- **fixed_length_line_mapping.csv** - Line item record (L) field mapping
- **fixed_length_detail_mapping.csv** - Detail record (D) field mapping
- **fixed_length_comment_mapping.csv** - Comment record (C) field mapping
- **record_type_config.csv** - Multi-record type configuration

---

## Delimited File Format

### Input File Structure (delimited_input_sample.csv)

**Record Types:**
- **H** = Header record (one per order)
- **L** = Line item record (multiple per header)
- **D** = Detail record (multiple per line item)
- **C** = Comment record (multiple per header)

**Sample Records:**
```csv
H,1001,John Smith,2025-03-15,Accounting,New York,Active
L,1001,1,Widget A,Electronics,100,25.50,2550.00
D,1001,1,1,Color,Blue
C,1001,1,Internal,Please expedite this order
```

**Field Structure:**
- Column 1: Record Type (H/L/D/C)
- Remaining columns: Record-specific data

### Mapping File (delimited_mapping_sample.csv)

**Columns:**
- **OutputFieldName** - Name of the output field
- **MappingLogic** - Transformation function to apply
- **Required** - Y/N flag for required fields
- **DefaultValue** - Default value if field is empty

**Supported Functions:**
- `Column1`, `Column2`, etc. - Direct column reference
- `RemoveLeadingZeroes(ColumnN)` - Remove leading zeros
- `Trim(ColumnN)` - Remove whitespace
- `Uppercase(ColumnN)` - Convert to uppercase
- `Lowercase(ColumnN)` - Convert to lowercase
- `Left(ColumnN, length)` - Extract left characters
- `Right(ColumnN, length)` - Extract right characters
- `Substring(ColumnN, start, length)` - Extract substring
- `Concat(Column1, Column2, ...)` - Concatenate values
- `DateReformat(ColumnN, 'inputFormat', 'outputFormat')` - Reformat dates
- `Sum(Column1, Column2, ...)` - Add numeric values
- `Multiply(Column1, Column2)` - Multiply values
- `If ColumnN == 'value' Then 'result' Else 'default'` - Conditional logic
- `Today()` - Current date
- `Now()` - Current timestamp
- `Hardcode 'value'` - Static value

**Example Mappings:**
```csv
OutputFieldName,MappingLogic,Required,DefaultValue
Order ID,RemoveLeadingZeroes(Column2),Y,
Customer Name,Trim(Column3),Y,
Order Date,DateReformat(Column4,'YYYY-MM-DD','MM/DD/YYYY'),Y,
Department,Uppercase(Column5),N,
Status,Column7,N,PENDING
```

---

## Fixed-Length File Format

### Input File Structure (fixed_length_input_sample.txt)

**Record Layout:**
- Each record type has a fixed character length
- Fields are positioned at specific character positions
- No delimiters between fields
- Padding with spaces for alignment

**Sample Record:**
```
H0001000123456789  John Smith    NY001202503151430Accounting        Active    
```

**Record Types:**
- **H** = Header (125 characters)
- **L** = Line Item (96 characters)
- **D** = Detail (102 characters)
- **C** = Comment (1000 characters)

### Mapping Files

Each record type has its own mapping file defining field positions.

#### Header Mapping (fixed_length_header_mapping.csv)

**Columns:**
- **OutputFieldName** - Name of the output field
- **Start** - Starting position (1-indexed)
- **End** - Ending position (inclusive)
- **Required** - Y/N flag for required fields
- **Justify** - Field justification (left/right)
- **MappingLogic** - Transformation function
- **DefaultValue** - Default value if empty

**Example:**
```csv
OutputFieldName,Start,End,Required,Justify,MappingLogic,DefaultValue
Record Type,1,1,Y,left,,
Company Code,2,5,Y,right,RemoveLeadingZeroes(Company Code),
Order Number,6,17,Y,right,RemoveLeadingZeroes(Order Number),
Customer Name,23,36,Y,left,Trim(Customer Name),
Order Date,44,51,Y,left,DateReformat(Order Date,'YYYYMMDD','MM/DD/YYYY'),
Status,74,83,N,left,,PENDING
```

**Field Justification:**
- **left** - Remove trailing spaces
- **right** - Remove leading spaces (common for numeric fields)

#### Line Item Mapping (fixed_length_line_mapping.csv)

Defines fields for line item records (L).

**Key Fields:**
- Order Number (links to header)
- Line Number (unique within order)
- Item details (code, description, category)
- Quantities and amounts

#### Detail Mapping (fixed_length_detail_mapping.csv)

Defines fields for detail records (D).

**Key Fields:**
- Order Number (links to header)
- Line Number (links to line item)
- Detail Sequence (unique within line)
- Attribute name/value pairs

#### Comment Mapping (fixed_length_comment_mapping.csv)

Defines fields for comment records (C).

**Key Fields:**
- Order Number (links to header)
- Comment Sequence (unique within order)
- Comment Type (Internal/External)
- Comment Text (long text field)

### Record Type Configuration (record_type_config.csv)

Defines the relationship between record types.

**Columns:**
- **RecordType** - Single character identifier (H/L/D/C)
- **RecordName** - Descriptive name
- **OutputName** - Name in output results
- **ParentRecordType** - Parent record type (for hierarchy)
- **MappingFile** - Associated mapping file

**Example:**
```csv
RecordType,RecordName,OutputName,ParentRecordType,MappingFile
H,Header,Headers,,fixed_length_header_mapping.csv
L,Line,LineItems,H,fixed_length_line_mapping.csv
D,Detail,Details,L,fixed_length_detail_mapping.csv
C,Comment,Comments,H,fixed_length_comment_mapping.csv
```

**Hierarchy:**
```
Header (H)
├── Line Item (L)
│   └── Detail (D)
└── Comment (C)
```

---

## Transformation Functions Reference

### String Functions
- `RemoveLeadingZeroes(field)` - Removes leading zeros (00123 → 123)
- `Trim(field)` - Removes leading/trailing whitespace
- `Uppercase(field)` - Converts to uppercase
- `Lowercase(field)` - Converts to lowercase
- `Left(field, length)` - Extracts leftmost characters
- `Right(field, length)` - Extracts rightmost characters
- `Substring(field, start, length)` - Extracts substring (1-indexed)
- `Concat(field1, field2, ...)` - Concatenates multiple fields
- `Replace(field, 'old', 'new')` - Replaces text
- `PadLeft(field, length, 'char')` - Pads left with character
- `PadRight(field, length, 'char')` - Pads right with character

### Math Functions
- `Sum(field1, field2, ...)` - Adds numeric values
- `Multiply(field1, field2)` - Multiplies two values
- `Divide(field1, field2)` - Divides two values
- `Round(field, decimals)` - Rounds to decimal places
- `Abs(field)` - Absolute value

### Date Functions
- `Today()` - Current date (M/D/YYYY)
- `Now()` - Current timestamp
- `DateReformat(field, 'inputFormat', 'outputFormat')` - Converts date formats

**Supported Date Formats:**
- `MMDDYYYY` - 03152025
- `YYYYMMDD` - 20250315
- `MM/DD/YYYY` - 03/15/2025
- `YYYY-MM-DD` - 2025-03-15

### Conditional Logic
- `If field == 'value' Then 'result'` - Simple condition
- `If field == 'value' Then 'result' Else 'default'` - With else clause
- `If field != 'value' Then 'result'` - Not equal
- `If field > 100 Then 'High'` - Numeric comparison

**Operators:** `==`, `!=`, `>`, `<`, `>=`, `<=`

### Static Values
- `Hardcode 'value'` - Returns literal value
- `'Static Text'` - Quoted strings in conditions

---

## Usage Examples

### Delimited File Processing

```javascript
// Load input and mapping files
var inputText = // load delimited_input_sample.csv
var mappingText = // load delimited_mapping_sample.csv

// Process delimited file
var results = processDelimitedFile(inputText, mappingText, ',');

// Generate output
var csvOutput = generateCSV(results);
```

### Fixed-Length File Processing

```javascript
// Load input file
var inputText = // load fixed_length_input_sample.txt

// Process with embedded configuration
var results = processFixedLengthFile(inputText);

// Generate output with custom delimiter
var pipeOutput = generatePipeDelimited(results);

// Or generate separate files
var files = generateSeparateFiles(results);
var headersCSV = files.Headers;
var lineItemsCSV = files.LineItems;
```

---

## Customization Guide

### Creating Your Own Delimited Mapping

1. Copy `delimited_mapping_sample.csv`
2. Update `OutputFieldName` with your desired field names
3. Set `MappingLogic` using transformation functions
4. Mark required fields with `Required=Y`
5. Add default values where needed

### Creating Your Own Fixed-Length Mapping

1. Copy the four mapping files (header, line, detail, comment)
2. Update field positions (Start/End) to match your file layout
3. Set field justification (left/right) based on data type
4. Add transformation logic as needed
5. Update `record_type_config.csv` with your record types

### Adding New Record Types

1. Add entry to `record_type_config.csv`
2. Create new mapping file for the record type
3. Define parent relationship if hierarchical
4. Update input file with new record type data

---

## Best Practices

### Field Naming
- Use descriptive names (Customer Name, Order Date)
- Avoid special characters in field names
- Use consistent naming conventions

### Transformation Logic
- Keep logic simple and readable
- Test transformations with sample data
- Use default values for optional fields
- Validate required fields

### File Organization
- Keep mapping files with input files
- Use consistent file naming conventions
- Document custom transformations
- Version control mapping configurations

### Performance
- Pre-compile regex patterns (done automatically)
- Cache record lengths (done automatically)
- Use appropriate data types
- Minimize complex nested transformations

---

## Troubleshooting

### Common Issues

**Issue:** Fields not extracting correctly
- **Solution:** Check Start/End positions in mapping file
- **Solution:** Verify field justification (left/right)

**Issue:** Transformation not working
- **Solution:** Check function syntax and parameters
- **Solution:** Verify field references match mapping

**Issue:** Required field validation failing
- **Solution:** Ensure Required=Y fields have values
- **Solution:** Check for whitespace-only values

**Issue:** Date format conversion errors
- **Solution:** Verify input/output format strings
- **Solution:** Check date value format in input

### Validation

Use the error reporting features:
```javascript
var results = processFixedLengthFile(inputText);

// Check for errors
if (results.errors.length > 0) {
  // Review error messages
  console.log(results.errors);
}

// Check for warnings
if (results.warnings.length > 0) {
  // Review warnings
  console.log(results.warnings);
}
```

---

## Additional Resources

- **Function Reference:** See syntax_reference.md for complete function documentation
- **IPA Integration:** See ipa-integration.md for workflow patterns
- **Troubleshooting:** See troubleshooting.md for common issues

---

## Template Modification

These templates are designed to be customized for your specific needs:

1. **Input Files** - Modify to match your data structure
2. **Mapping Files** - Adjust field positions and transformations
3. **Record Types** - Add/remove record types as needed
4. **Transformations** - Use any combination of available functions

All templates follow the enhanced architecture with:
- ✅ 25+ transformation functions
- ✅ Performance optimizations
- ✅ Error handling and validation
- ✅ Custom output options
- ✅ IPA compatibility
