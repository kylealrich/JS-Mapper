# JavaScript Mapper

A web-based data transformation tool that generates JavaScript mapping functions from CSV mapping tables and applies them to input data files. No dependencies, no build process — just open `JavaScript_Mapper.html` in a browser and go.

## What It Does

- Reads a CSV mapping configuration that defines transformation rules
- Applies those rules to delimited or fixed-length input files
- Outputs transformed CSV data and standalone JavaScript mapper code
- Integrates with Infor Process Automation (IPA) workflows

Built for data analysts, healthcare IT teams, and integration engineers who need repeatable, configuration-driven data transformations without writing code from scratch.

## Features

### File Format Support
- **Delimited files** — CSV, pipe, tab, semicolon, colon, space, tilde, caret
- **Fixed-length files** — single mapping or multi-record-type with hierarchical output (H/L/D/C records)
- **Auto-detection** of delimiter and header rows
- **Drag-and-drop** file upload

### Code Generation Modes
- **Static (Self-Contained)** — mapping rules embedded in generated JS, no external files needed at runtime
- **Dynamic (Runtime Flexible)** — universal mapper that reads a mapping CSV at runtime

### Validation & Error Handling
- Required field validation
- Data type, length, range, and format checks
- Pattern matching (regex)
- Valid values lists
- Row-level error reporting with detailed messages
- Implied decimal support for financial fields

### IPA Integration
The core engine (`mapper-core.js`) exposes functions for use in Infor Process Automation workflows:

```javascript
// Single function call for complete transformation
var result = transformData(inputText, MappingTable, ',', 1);

if (result.success) {
  var output = result.csvOutput;
  var objects = result.transformedData;
  var headers = result.headers;
}
```

Key functions: `transformData()`, `createDynamicMapper()`, `parseCSV()`, `applyLogic()`.

## Mapping Table Format

A mapping CSV defines how each output field is produced. Columns:

| Column | Description |
|---|---|
| `OutputFieldName` / `TargetFieldName` | Name of the output field |
| `InputColumnNumber` | Source column number (for direct mapping) |
| `MappingLogic` | Transformation function to apply |
| `Required` | `Y` or `N` |
| `DefaultValue` | Fallback value if field is empty |

Example mapping:
```csv
OutputFieldName,MappingLogic,Required,DefaultValue
Order ID,RemoveLeadingZeroes(Column2),Y,
Customer Name,Trim(Column3),Y,
Order Date,DateReformat(Column4,'YYYY-MM-DD','MM/DD/YYYY'),Y,
Department,Uppercase(Column5),N,
Status,If Column7 == '' Then 'PENDING' Else Column7,N,
```

### Fixed-Length Mapping

For fixed-length files, mappings include positional information:

```csv
OutputFieldName,Start,End,Required,Justify,MappingLogic,DefaultValue
Company Code,2,5,Y,right,RemoveLeadingZeroes(Company Code),
Customer Name,23,36,Y,left,Trim(Customer Name),
Amount,44,58,Y,right,,
```

### Multi-Record-Type

For files with multiple record types (e.g., Header/Line/Detail/Comment), provide a record type config CSV and separate mapping files per record type. Output is hierarchical JSON.

```csv
RecordType,RecordName,OutputName,ParentRecordType,MappingFile
H,Header,Headers,,header_mapping.csv
L,Line,LineItems,H,line_mapping.csv
D,Detail,Details,L,detail_mapping.csv
C,Comment,Comments,H,comment_mapping.csv
```

## Function Syntax Examples

```
Column3                                          → Direct column reference
'Static Text'                                    → Literal value
Hardcode '1'                                     → Explicit static value
Increment By 1                                   → Auto-increment counter
Trim(Column1)                                    → Remove whitespace
Concat(Column1, Column2)                         → Concatenate columns
Left(Column5, 6)                                 → First 6 characters
DateReformat(Column18, 'MMDDYYYY', 'YYYYMMDD')  → Date format conversion
Sum(Column3, Column4)                            → Add numeric fields
If Column6 == '' Then 'TC' Else Column6          → Conditional logic
RemoveLeadingZeroes(Column1)                     → Strip leading zeros
PadLeft(Column1, 10, '0')                        → Left-pad to 10 chars
Split(Column2, ' ', 1)                           → Split and take part
```

## Browser Compatibility

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+. JavaScript must be enabled. No server required.

## Technology Stack

- Vanilla JavaScript (ES5) — no frameworks, no build tools
- HTML5 / CSS3 with Font Awesome icons
- Browser File API for client-side processing
- Zero external dependencies

## Documentation

| Document | Description |
|---|---|
| [docs/README.md](docs/README.md) | Detailed feature documentation |
| [docs/api-reference.md](docs/api-reference.md) | Complete function reference |
| [docs/ipa-integration.md](docs/ipa-integration.md) | IPA workflow integration guide |
| [docs/mapping-configuration.md](docs/mapping-configuration.md) | Mapping table configuration |
| [docs/multi-record-type-guide.md](docs/multi-record-type-guide.md) | Multi-record-type processing |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Common issues and solutions |
| [template/README.md](template/README.md) | Template files and customization guide |
| [test/TEST_FILES_GUIDE.md](test/TEST_FILES_GUIDE.md) | Test data and validation guide |
| [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) | Complete workflow for all modes |
| [WHATS_NEW.md](WHATS_NEW.md) | v2.0 enhancement details |

## License

Internal tool — not currently published under an open-source license.
