# JavaScript Mapper - Project Steering

## Project Overview

JavaScript Mapper is a single-page HTML application (`JavaScript_Mapper.html`) for mapping and transforming data files using configurable CSV-based mapping rules. It generates JavaScript mapper functions and transformed CSV output. A companion `mapper-core.js` provides the core engine for IPA (Integration Process Automation) integration.

## Architecture

- `JavaScript_Mapper.html` — Main UI. Single-file app with embedded CSS and JS. All logic lives in one `<script>` block. No build tools, no frameworks, no npm.
- `mapper-core.js` — Standalone core engine exposing `transformData(inputText, MappingTable, delimiter, skipRows)` for headless/IPA use.
- `input/` — Staging directory for unprocessed data files and mapping CSVs.
- `output/` — Generated mapper JS files and mapped CSV output.
- `archive/` — Processed input files moved here after output generation.
- `template/` — Sample input files and mapping CSVs for both delimited and fixed-length formats.
- `artifacts/mapping/` — Example mapping configurations.
- `docs/` — Markdown documentation. Must be updated when features change.
- `BIN/` — Archived/deprecated files. Do not use for new development.

## Two Processing Modes

### Delimited
- Input: CSV/TXT with a configurable delimiter (comma, pipe, semicolon, tab, colon, space, tilde, caret).
- Mapping CSV columns: `TargetFieldName`, `InputColumnNumber`, `MappingLogic`, `Required`, `DataType`, `MinLength`, `MaxLength`, `MinValue`, `MaxValue`, `ValidValues`, `Pattern`.
- Column references use `Column1`, `Column2`, etc. (1-indexed).

### Fixed-Length
- Input: TXT with positional fields.
- Mapping CSV columns: `TargetFieldName`, `Start`, `End`, `Required`, `Justify`, `MappingLogic`, `DefaultValue`.
- Additional mapping columns that may appear: `Length`, `Pad Character`, `Description`. `Length` is redundant when `Start` and `End` are present but useful for validation. `Pad Character` specifies the character used to fill unused positions (typically `0` for numeric or space for text).
- Supports multi-record-type files (H/L/D/C) via a `record_type_config.csv` defining record types, parent-child hierarchy, and per-type mapping files.

### Combined Multi-Record Mapping Format
- Multi-record configs may use a single combined CSV instead of separate config + per-type mapping files.
- The combined format uses a `RowType` column: `_CONFIG` rows define record types, `_FIELD` rows define field mappings per record type.
- `_CONFIG` rows contain: `RecordType`, `Type Indicator Position`, `Type Indicator Length`, `Type Indicator Value`, `Parent Record Type`, `Output Name`.
- `_FIELD` rows contain: `RecordType`, `Field Name`, `Start`, `End`, `Length`, `Required`, `Pad Character`, `Justify`, `Default Value`, `Mapping Logic`, `Description`.
- When this format is detected (presence of `RowType` column with `_CONFIG`/`_FIELD` values), no separate per-type mapping files are needed — all config and field definitions are in one file.
- The `RecordType` column in `_FIELD` rows links each field to its parent record type defined in the `_CONFIG` rows.

## Code Generation

Two generation modes:
- **Static (Self-Contained)** — Embeds mapping rules directly in the generated JS. No external files needed at runtime.
- **Dynamic (Runtime Flexible)** — Generated JS reads a mapping CSV at runtime. Used for IPA integration.

## Transformation Functions (25+)

When adding or modifying transformation functions, follow the existing pattern in `applyLogic()`:
- String: `RemoveLeadingZeroes`, `Trim`, `Uppercase`, `Lowercase`, `Left`, `Right`, `Substring`, `Concat`, `Replace`, `PadLeft`, `PadRight`, `AddLeft`, `AddRight`, `RemoveTrailingSpaces`
- Math: `Sum`, `Multiply`, `Divide`, `Round`, `Abs`, `Max`, `Min`
- Date: `DateReformat(field, 'inputFormat', 'outputFormat')`, `Today()`, `Now()`
- Conditional: `If ... Then ... ElseIf ... Else ...` with operators `==`, `!=`, `>`, `<`, `>=`, `<=`
- Validation: `IsEmpty`, `IsNumeric`, `ValidateLength`, `ValidateRange`, `ValidateFormat`
- Static: `Hardcode 'value'`, `Increment By N`, direct `ColumnN` references

New functions must be added in both `JavaScript_Mapper.html` (inline `applyLogic`) and `mapper-core.js` (`applyLogic`) to stay in sync.

### Fixed-Length Transformation Functions

For fixed-length mappers, transformation functions operate on the already-extracted field value rather than referencing `ColumnN` from a parsed row. The dynamic mapper uses `applyFixedLengthLogic(logic, value, line, fields, record)` where:
- `value` is the pre-extracted, justify-trimmed field value.
- `line` is the full raw line (available if needed for cross-field references).
- `fields` is the field definition array for the current record type.
- `record` is the partially-built record (available for referencing previously extracted fields).

Functions like `RemoveLeadingZeroes`, `Trim`, `Left(n)`, `Right(n)` operate directly on `value` instead of extracting from `data[colIndex]`. The static mapper inlines these transformations directly in the extraction code.

## Coding Conventions

- **No frameworks or build tools.** Pure vanilla HTML/CSS/JS. No npm, no bundlers.
- **ES5-compatible JavaScript.** Uses `var`, `function` declarations, `.forEach`, `.map`. No `let`/`const`, no arrow functions, no template literals, no `class`.
- **CSV parsing** is handled by a custom `parseCSV(text, delimiter)` function that supports quoted fields and escaped quotes. Do not introduce external CSV libraries.
- **`normalizeKey(key)`** strips whitespace and lowercases header names for case-insensitive matching. Always use it when comparing mapping column headers.
- **Column references** are 1-indexed (`Column1` = first column). The code converts to 0-indexed internally.
- **Error handling** uses try-catch with row-level error messages. Required field validation checks `Required === 'Y'`.
- **UI** uses Font Awesome icons, Inter font, and a blue/purple gradient theme. Tabs switch between JS Generator, Mapping Table Converter, and Reference.
- **File I/O** uses the browser FileReader API. Downloads use Blob + URL.createObjectURL.

## Key Functions in JavaScript_Mapper.html

| Function | Purpose |
|---|---|
| `parseCSV(text, delimiter)` | Parse CSV with quote handling |
| `normalizeKey(key)` | Normalize header keys for matching |
| `previewDelimited(mappingFile, dataFile)` | Preview delimited file processing |
| `previewFixedLength(flMappingFile, dataFile)` | Preview fixed-length file processing |
| `previewMultiRecordType(configFile, dataFile)` | Preview multi-record-type files |
| `autoDetectDelimiter(text)` | Detect delimiter from file content |
| `autoDetectHeader(text, delimiter)` | Detect if first row is a header |
| `generateStaticMapper()` | Generate self-contained JS mapper |
| `generateDynamicMapper()` | Generate runtime-flexible JS mapper |
| `generateMultiRecordTypeOutput()` | Generate hierarchical JSON output |
| `extractFixedLengthFields(line, fields, options)` | Extract fields by position |
| `detectRecordType(line, recordTypes)` | Identify record type from line content |
| `validateField(fieldDef, value)` | Validate field against rules |
| `runMappingDemo(jsCode, headers)` | Execute generated mapper on input data |
| `renderTable(headers, data)` | Render HTML table preview |
| `buildCSVOutput(mappedRows, headers)` | Build CSV string from mapped data |

### Helper Functions in Generated Mappers

| Function | Purpose |
|---|---|
| `escapeRegex(str)` | Escape special regex characters for use in `new RegExp()` — needed when pad characters contain regex-special chars |
| `detectRecordType(line)` | Static: hardcoded indicator matching. Dynamic: iterates config with exact match then first-char fallback |
| `extractFixedLengthFields(line, fields)` | Dynamic mapper: extracts all fields from a line using field definitions, applies justify/pad/default/logic |
| `processLine(line, rowIndex)` | Static mapper dispatcher: routes line to correct `map*()` function based on record type |
| `applyFixedLengthLogic(logic, value, line, fields, record)` | Dynamic mapper: applies transformation logic to an already-extracted fixed-length field value |

## Directory Conventions

- `input/` — Staging area for unprocessed input data files and mapping CSVs. Files here are pending processing.
- `output/` — Generated output files from processing. Contains `*_dynamic_mapper.js`, `*_static_mapper.js`, and `*_Mapped.csv` files. For multi-record types, mapped CSVs are split per record type: `*_{RecordTypeName}_Mapped.csv`.
- `archive/` — Processed files moved here after output generation. Input data files, mapping CSVs, and record type config files are relocated here once processing is complete.

## Processing Workflow

When processing files from `/input/`:

### Step 1: Gather User Inputs

1. Ask if the input file is Delimited or Fixed-Length.
2. If Delimited:
   - Ask which file is the input data file.
   - Ask which file is the mapping CSV file.
   - Ask about the delimiter used in the input data file.
   - Ask how many rows to skip from the top of the input file.
3. If Fixed-Length:
   - Ask if the input data file is a multi-record file.
   - If not multi-record (single record type):
     - Ask which file is the input data file.
     - Ask which file is the mapping CSV file.
   - If multi-record:
     - Ask which file is the input data file.
     - Ask which file is the record type config CSV file.
     - Inspect the config CSV: if it uses the combined `_CONFIG`/`_FIELD` format (single file with `RowType` column), no additional mapping files are needed.
     - If the config uses the separate-file format (references external mapping files per record type), read the config to identify all referenced mapping files and ask the user which file corresponds to each.

### Step 2: Generate Output Files

Generate three output files in `/output/` using the naming convention `{InputFileName without extension}_`:

#### For Delimited Inputs

- `*_dynamic_mapper.js` — Runtime Flexible mapper. Uses `createMapper(MappingTable)` to parse a mapping CSV at runtime. Includes full `applyLogic` with all transformation functions, `parseCSV`, and IPA usage instructions as comments.
- `*_static_mapper.js` — Self-Contained mapper. Uses `mapRecord(data, rowIndex)` with all field transformation rules hardcoded inline (Hardcode, Increment, RemoveLeadingZeroes, Left, Right, DateReformat, If/Then/Else, Trim, direct column refs). Includes a fallback `applyLogic`, `parseCSV`, and usage instructions as comments.
- `*_Mapped.csv` — Transformed CSV output with header row and all data rows processed through the mapping rules.

#### For Fixed-Length Inputs (Single Record Type)

- `*_dynamic_mapper.js` — Runtime Flexible mapper. Uses `createMapper(MappingTable)` to parse a fixed-length mapping CSV at runtime. Reads `TargetFieldName`, `Start`/`StartPosition`, `End`/`Length` (computes end from start+length if needed), `Required`, `Justify`, `MappingLogic`, `DefaultValue` columns. Uses `extractFixedLengthFields(line, fields)` to extract positional data. Includes `applyLogic` for transformation functions and IPA usage instructions as comments.
- `*_static_mapper.js` — Self-Contained mapper. Uses `mapRecord(line, rowIndex)` with all field extraction rules hardcoded inline using `line.substring(start - 1, end)`. Applies trim/justify, default values, and `MappingLogic` transformations inline. Includes a fallback `applyLogic` and usage instructions as comments.
- `*_Mapped.csv` — Transformed CSV output with header row and all data rows processed through the fixed-length mapping rules.

#### For Fixed-Length Inputs (Multi-Record Type)

- `*_dynamic_mapper.js` — Runtime Flexible mapper. Supports two config formats:
  - **Combined format:** Uses `createMapper(configCSV)` where the single CSV contains both `_CONFIG` rows (record type definitions) and `_FIELD` rows (field mappings per type). Parses `RowType`, `RecordType`, `Type Indicator Position`, `Type Indicator Length`, `Type Indicator Value`, `Parent Record Type`, `Output Name` from `_CONFIG` rows, and `Field Name`, `Start`, `End`, `Length`, `Required`, `Pad Character`, `Justify`, `Default Value`, `Mapping Logic` from `_FIELD` rows.
  - **Separate-file format:** Uses `createMapper(configCSV, mappingFiles)` where `mappingFiles` is an object keyed by filename containing each record type's mapping CSV content.
  - Both formats use `detectRecordType(line, recordTypes)` to identify each line's type, then `extractFixedLengthFields(line, fields)` with the corresponding mapping. Includes `applyLogic` (or `applyFixedLengthLogic` for fixed-length-specific transformations) and IPA usage instructions as comments.
- `*_static_mapper.js` — Self-Contained mapper. Hardcodes all record type detection logic and per-type field extraction rules inline. Each record type has its own extraction function (e.g., `mapHeader(line, rowIndex)`, `mapLine(line, rowIndex)`, `mapDetail(line, rowIndex)`, `mapComment(line, rowIndex)`). A `processLine(line, rowIndex)` dispatcher function uses `detectRecordType(line)` to route each line to the correct mapper and returns `{ type: typeName, data: record }`. Per-type header arrays (e.g., `headerHeaders`, `detailHeaders`, `trailerHeaders`) are defined at module level for CSV generation. Includes a fallback `applyLogic`, `parseCSV`, and usage instructions as comments.
- `*_Mapped.csv` — Transformed CSV output. For multi-record files, outputs one CSV per record type using the naming convention `{InputFileName}_{RecordTypeName}_Mapped.csv`. Each CSV contains only the headers relevant to that record type. No `RecordType` column is included since it is not a business class field.

### Step 3: Archive Processed Files

Move all processed input files from `/input/` to `/archive/`:
- Input data file.
- Mapping CSV file(s) (single mapping for delimited/single fixed-length, or all per-type mapping files for multi-record).
- Record type config CSV (if multi-record fixed-length).

### Output File Consistency Rules

- Both mapper JS files must be ES5-compatible (no `let`/`const`, no arrow functions, no template literals).
- Both mapper JS files must include the same `parseCSV` function implementation.
- The dynamic mapper must include the complete `applyLogic` function with all supported transformation functions (string, math, date, conditional, validation, static).
- The static mapper must inline transformation logic per field and include a fallback `applyLogic` for complex cases.
- Required field validation (`Required === 'Y'`) must throw errors with row-level messages in both mappers.
- The mapped CSV must use the same transformation logic as both mapper files to ensure consistent output.
- IPA usage instructions must be included as comments at the end of both mapper files.
- For delimited inputs: mappers use `parseCSV` to split rows, then reference columns by 0-indexed array position (converted from 1-indexed `InputColumnNumber`).
- For fixed-length inputs: mappers use `line.substring(start - 1, end)` to extract positional fields. `Justify` determines trim direction (left-justify trims right, right-justify trims left). `DefaultValue` is applied when extracted value is empty.
- **Justify + Pad Character interaction is critical.** Right-justified fields (e.g., numeric IDs, amounts) are padded with leading pad characters — strip leading pad chars. Left-justified fields (e.g., dates, text) are padded with trailing pad characters — strip trailing pad chars. Getting this wrong corrupts date fields (e.g., stripping leading zeros from `021622` turns MMDDYY date `021622` into `21622`).
- **Pad Character determines what to strip.** When `Pad Character` is `0`, strip zeros from the justify-appropriate side. When `Pad Character` is space, strip spaces. Do not assume all fields use the same pad character.
- For multi-record fixed-length inputs: mappers must include `detectRecordType` logic using indicator position and value from the record type config. Each record type's fields are extracted using its own mapping rules. The static mapper hardcodes separate extraction functions per record type. Mapped CSV output is split into one file per record type with only that type's headers — no `RecordType` column is included.
- **Record type indicator mismatch handling.** The config may define an indicator value (e.g., `BH`) that does not exactly match the actual data (e.g., `B1` where the second character is the start of the next field). The dynamic mapper should include a fallback that matches on the first character of the indicator when an exact match fails, provided no other record type claims an exact match. The static mapper should check for `PT` and `BT` first (exact matches), then fall back to first-character matching (e.g., `line.charAt(0) === 'B'`) for the header type.
- **GEAC overpunch notation.** GEAC/Infor systems encode the sign of numeric amounts using a trailing special character (e.g., `{` = +0, `}` = -0, `A`-`I` = +1 to +9, `J`-`R` = -1 to -9). The `Amount` and `Batch Total` fields may contain these characters. Preserve them as-is during extraction — do not attempt to parse or convert them unless the mapping logic explicitly requests it.

## When Modifying This Project

1. Keep `JavaScript_Mapper.html` and `mapper-core.js` in sync — both contain `parseCSV` and `applyLogic`.
2. Maintain ES5 compatibility. No modern JS syntax.
3. Update `docs/` markdown files when adding features or fixing bugs.
4. Test with both delimited and fixed-length sample files in `template/`.
5. The Reference tab in the UI has a `referenceData` object — update it when adding new functions.
6. Mapping CSV formats are documented in `template/README.md` — keep that current.
7. Do not modify files in `BIN/` — those are archived backups.
8. Generated output files in `output/` must follow the naming convention and consistency rules described in the Processing Workflow section.

## Learnings from GEAC AP Processing (2026-03-25)

- **GEAC AP file (`GEAC_AP_20220219.txt`)**: Multi-record fixed-length file with 3 record types: Header (BH), Detail (PT), Trailer (BT). Uses combined `_CONFIG`/`_FIELD` mapping format in a single CSV.
- **Record type indicator mismatch confirmed**: Header config defines indicator `BH` but actual data line starts with `B1` (where `1` is the first digit of Company ID at position 3). The `detectRecordType` fallback to first-character matching (`B` → Header) works correctly after checking `PT` and `BT` exact matches first.
- **Batch Total edge case**: When Batch Total is all zeros with no overpunch character (e.g., Trailer line `BT1100AP01200000000000000`), stripping leading zeros produces an empty string. Must fall back to `'0'` to satisfy required field validation.
- **GEAC overpunch preserved**: Amount fields like `15000}` and `8900{` and Batch Total `{` are preserved as-is after pad stripping. The overpunch character is the last character and survives right-justify leading-zero stripping.
- **Source Date and Effective Date are left-justified with pad='0'**: Trailing zeros are stripped. MMDDYY dates like `021622` have no trailing zeros so they remain intact. YYYYMMDD dates like `02162022` also remain intact.
- **Multi-record CSV output naming**: `{InputFileName}_{OutputName}_Mapped.csv` — e.g., `GEAC_AP_20220219_Headers_Mapped.csv`, `GEAC_AP_20220219_Details_Mapped.csv`, `GEAC_AP_20220219_Trailers_Mapped.csv`.
- **Item field default**: Detail `Item` field (pos 3-6) is right-justified with pad='0' and default='0000'. After stripping leading zeros, all-zero values become empty, so the default `0000` kicks in. This is correct behavior per the mapping.

## Learnings from CernerGLTrans Processing (2026-03-25)

- **CernerGLTrans file (`CernerGLTrans.txt`)**: Delimited (comma) file with 645 data rows, no header row, 0 rows to skip.
- **Mapping table (`CernerGL_MappingTable.csv`)**: 22 target fields with columns `TargetTableName`, `TargetFieldName`, `Required`, `InputColumnNumber`, `MappingLogic`, `SampleValue`. The `TargetTableName` column is informational only and not used in mapper generation.
- **Transformation functions used**: `Hardcode`, `Increment By 1`, `RemoveLeadingZeroes`, `Left`, `Right`, `Trim`, `DateReformat(MMDDYYYY→YYYYMMDD)`, `If/Then/Else` conditionals.
- **Column18 date handling**: Input dates are MMDDYYYY format (e.g., `10252025`), reformatted to YYYYMMDD (`20251025`). Both `TransactionDate` and `PostingDate` use the same Column18 source.
- **Conditional defaults**: `GeneralLedgerEvent` defaults to `TC` when Column6 is empty, `System` defaults to `GL` when Column15 is empty, `AutoReverse` defaults to `N` when Column17 is empty.
- **AccountingEntity vs ToAccountingEntity**: Both derive from Column3, but `AccountingEntity` applies `RemoveLeadingZeroes` while `ToAccountingEntity` uses the raw value.
- **AccountCode**: Uses `Left(Column5, 6)` — first 6 characters of the 10-digit account number (e.g., `1000080000` → `100008`).
- **FinanceDimension1**: Uses `Right(Column4, 3)` — last 3 characters of Column4 (e.g., `001020027` → `027`).
- **UnitsAmount**: Static hardcode of `'0'` — not sourced from input data.
- **HTML viewer generation**: Used Node.js script to build HTML with embedded JS code and CSV table, base64-encoded CSV for download button.
- **Auto-open HTML hook**: An agent hook (`auto-open-html`) is configured to automatically run `explorer.exe "${file}"` when any `.html` file is created in `output/`. No need to manually open generated HTML viewers — the hook handles it on `fileCreated` events matching `output/*.html`.

## Learnings from GEAC AP Re-Processing (2026-03-25)

- **GEAC AP file (`GEAC_AP_20220219.txt`)**: Re-processed using the combined `_CONFIG`/`_FIELD` mapping format in `GEACGL_MultiRecord_Mapping.csv`. 44 total lines: 1 Header, 42 Details, 1 Trailer.
- **Combined mapping CSV structure**: `_CONFIG` rows define 3 record types (Header/Detail/Trailer) with indicator position 1, length 2, values BH/PT/BT. `_FIELD` rows define per-type field mappings with Start/End/Length/Required/Pad Character/Justify/Default Value/Mapping Logic columns.
- **Dynamic mapper for multi-record**: Uses `createMapper(configCSV)` to parse the combined format. `detectRecordType(line, recordTypes)` with exact-match-first then first-character fallback. `extractFixedLengthFields(line, fields)` handles justify/pad/default/logic per field. `applyFixedLengthLogic()` operates on already-extracted values.
- **Static mapper for multi-record**: Hardcodes `detectRecordType(line)` checking PT/BT exact first, then `B` first-char fallback. Separate `mapHeader()`, `mapDetail()`, `mapTrailer()` functions with inline extraction. `processLine()` dispatcher routes to correct mapper. Per-type header arrays (`headerHeaders`, `detailHeaders`, `trailerHeaders`) defined at module level.
- **Multi-record CSV output**: Three separate files: `GEAC_AP_20220219_Headers_Mapped.csv` (1 row), `GEAC_AP_20220219_Details_Mapped.csv` (42 rows), `GEAC_AP_20220219_Trailers_Mapped.csv` (1 row). No `RecordType` column included.
- **HTML viewer for multi-record**: Uses sub-tabs within the CSV tab to show each record type's data separately. Download buttons per record type. Base64-encoded CSV data embedded for client-side downloads.
- **Batch Total edge case confirmed**: Trailer line `BT1100AP01200000000000000` — after stripping leading zeros from pos 12-25, result is empty string, falls back to default `'0'`.
- **GEAC overpunch preserved**: Amount fields like `15000}`, `8900{`, `10000{` preserved as-is after right-justify leading-zero stripping. The overpunch character is the trailing character and survives correctly.
- **Source Date and Effective Date confirmed**: Left-justified with pad='0', trailing zeros stripped. MMDDYY dates like `021622` and YYYYMMDD dates like `02162022` remain intact since they have no trailing zeros to strip.
- **Item field default confirmed**: All-zero `0000` at pos 3-6 becomes empty after leading-zero strip, default `0000` kicks in correctly.
- **DRCR Code values**: `60` = Credit (negative amount), `10` = Debit (positive amount). Right-justified with pad='0', leading zeros stripped.

## Learnings from OMRQ Requisition Processing (2026-03-25)

- **OMRQ file (`omrq.bcs.20250405101502.txt`)**: Multi-record fixed-length file with 4 record types: Header (H), Line (L), Detail (D), Comment (C). Uses combined `_CONFIG`/`_FIELD` mapping format in `OMRQ_MultiRecord_Mapping.csv`. 16 total records: 1 Header, 4 Lines, 7 Details, 4 Comments.
- **No line breaks in input file**: All 16 records are concatenated into a single line at a fixed width of 2330 characters per record (last record is 92 chars). The mappers include a `splitFixedWidthRecords(rawContent, recordWidth)` helper to split the raw content into individual record strings before processing.
- **Record width determination**: Each record is padded with spaces to 2330 characters regardless of the record type's actual field length (Header=738, Line=382, Comment/Detail=133). The fixed width was determined by analyzing gaps between record-type indicators in the raw data.
- **Record type detection**: Single-character indicator at position 1 with exact match (H/L/C/D). No fallback needed since all indicators are single characters and match exactly.
- **Parent-child hierarchy**: Header → Line → Detail, Header → Comment. Lines are children of Header, Details are children of Lines, Comments are children of Header.
- **Req Number all zeros**: All records have Req Number `0000000` at positions 6-12. After RemoveLeadingZeroes, this becomes `0` (the fallback when all zeros are stripped).
- **Line Number for Header**: Header Line Number (pos 13-18) is `000000`, not required, no default. After stripping leading zeros, becomes empty string. This is correct — headers don't have a line number.
- **Quantity field format**: 9.4 decimal format (13 chars, right-justified, pad='0'). Values like `0000000010000` become `10000` after RemoveLeadingZeroes. The decimal point is implied (last 4 digits are decimal places).
- **Tran Unit Cost format**: 13.5 decimal format (18 chars, right-justified, pad='0'). Values like `000000000004800000` become `4800000` after RemoveLeadingZeroes.
- **Date fields are left-justified with pad='0'**: YYYYMMDD dates like `20250405` have trailing zeros stripped. Since `20250405` has no trailing zeros, it remains intact.
- **Comment/Detail records share same field layout**: Both have 7 fields (Record Type, Company, Req Number, Line Number, Name, Comment Type, Comment) at the same positions. Detail records are line-level comments (children of Line), Comment records are header-level comments (children of Header).
- **Last record truncation**: The last Comment record is only 92 characters (not padded to 2330). The `extractFields` function handles this gracefully by using `Math.min(end, line.length)` for substring extraction.
- **Multi-record CSV output naming**: `{InputFileName}_{OutputName}_Mapped.csv` — e.g., `omrq.bcs.20250405101502_Headers_Mapped.csv`, `omrq.bcs.20250405101502_Lines_Mapped.csv`, `omrq.bcs.20250405101502_Details_Mapped.csv`, `omrq.bcs.20250405101502_Comments_Mapped.csv`.
- **HTML viewer for multi-record**: Uses sub-tabs within the CSV tab to show each record type's data separately (Headers, Lines, Details, Comments). Download buttons per record type. Base64-encoded CSV data embedded for client-side downloads.

## Learnings from SEPTA GEAC GL FE Processing (2026-03-25)

- **GL_FELA file (`GL_FELA_20210504_Test.txt`)**: Multi-record fixed-length file with 3 record types: Header (BH), Detail (PT), Trailer (BT). Uses combined `_CONFIG`/`_FIELD` mapping format in `SEPTA_GEACGL_MultiRecord_Mapping.csv`. 118 total lines: 1 Header, 116 Details, 1 Trailer.
- **Record type indicator mismatch confirmed**: Header config defines indicator `BH` but actual data line starts with `B1` (where `1` is the first digit of Batch Number at position 9). The `detectRecordType` fallback to first-character matching (`B` → Header) works correctly after checking `PT` and `BT` exact matches first.
- **Variable line lengths**: Header is 35 chars, most Detail lines are 180 chars, last Detail line is 126 chars (summary/offset record), Trailer is 25 chars. Static mapper uses `Math.min(end, line.length)` for safe substring extraction on shorter lines.
- **Detail field gaps**: Mapping defines fields at pos 1-13, 26-31, 35-138 but positions 14-25 and 32-34 are unmapped filler/spaces. These gaps are skipped in extraction — no filler columns in output.
- **Fund Serial data mismatch**: Mapping defines Fund Serial (pos 130-138) as Right-justified with pad='0', but actual data has spaces (not zeros) when the field is empty. Added `.trim()` after pad stripping to handle this edge case. Field is not required (Required=N) so empty values remain empty.
- **Source Date (pos 48-53)**: MMDDYY format, left-justified with pad='0'. Values like `032721` have no trailing zeros so they remain intact after stripping.
- **Effective Date (pos 54-61)**: MMDDYYYY format, left-justified with pad='0'. Values like `03272021` remain intact.
- **Batch Total in Header**: `00000001942480` at pos 12-25, right-justified pad='0'. After stripping leading zeros: `1942480`. No GEAC overpunch character in this file's batch total (unlike GEAC AP which had `{`).
- **All Detail records share same Source Date/Effective Date**: `032721`/`03272021` across all 116 detail lines. Single batch processing date.
- **DRCR Code values**: Most details are `10` (Debit). Last detail line is `60` (Credit) — the offset/summary record with Amount `1942480` matching the Batch Total.
- **Description field contains vendor info**: Vendor ID (9 chars) + Vendor Name (20 chars) + Fund Serial (18 chars) + Source Code (3 chars) concatenated. Some vendor names contain commas (e.g., `MedRisk, LLC`, `The MCS Group, Inc.`) requiring CSV quoting.
- **Multi-record CSV output naming**: `GL_FELA_20210504_Test_{OutputName}_Mapped.csv` — `GL_FELA_20210504_Test_Headers_Mapped.csv` (1 row), `GL_FELA_20210504_Test_Details_Mapped.csv` (116 rows), `GL_FELA_20210504_Test_Trailers_Mapped.csv` (1 row).
- **HTML viewer for multi-record**: Uses sub-tabs within the CSV tab to show each record type's data separately (Headers, Details, Trailers). Download buttons per record type. Base64-encoded CSV data embedded for client-side downloads.

## Learnings from CernerGLTrans Re-Processing (2026-03-26)

- **CernerGLTrans file (`CernerGLTrans.txt`)**: Delimited (comma) file with 645 data rows, no header row, 0 rows to skip. Same input file as previous processing but with updated mapping table.
- **Updated mapping table (`Aultman_Health_I8_CernerGLTrans_Mapping.csv`)**: 22 target fields with columns `TargetFieldName`, `InputColumnNumber`, `MappingLogic`, `Required`, `DataType`, `MinLength`, `MaxLength`, `MinValue`, `MaxValue`, `ValidValues`, `Pattern`. Key differences from previous `CernerGL_MappingTable.csv`:
  - `FinanceEnterpriseGroup`: Changed from `Hardcode '1'` to `Hardcode 'AHF'`.
  - `TransactionDate`: Changed from `DateReformat(Column18,'MMDDYYYY','YYYYMMDD')` to `DateReformat(Column7,'MMDDYYYY','YYYYMMDD')`. Column7 contains values like `10252025BLU` (11 chars, not 8), so DateReformat passes through as-is since length !== 8.
  - `UnitsAmount`: Changed from `Hardcode '0'` to `Column11` (direct column reference). Column11 contains space-padded values like ` `.
  - `FinanceDimension1`: Changed from `Right(Column4,3)` to `Right(Column4,5)`. Values like `001020027` now yield `20027` instead of `027`.
  - `AutoReverse`: Changed from conditional `If Column17 == '' Then 'N' Else Column17` to `Hardcode 'N'`.
  - `ToAccountingEntity`: No longer marked as Required (was Required=Y in previous mapping).
- **TransactionDate vs PostingDate divergence**: With the new mapping, TransactionDate uses Column7 (which contains run-group-like values e.g., `10252025BLU`) while PostingDate uses Column18 (clean MMDDYYYY dates e.g., `10252025` → `20251025`). These now produce different output values.
- **Mapping CSV has additional validation columns**: `DataType`, `MinLength`, `MaxLength`, `MinValue`, `MaxValue`, `ValidValues`, `Pattern` — these are informational/validation metadata not used in mapper generation but available for future validation enhancements.
- **Output files generated**: `CernerGLTrans_dynamic_mapper.js`, `CernerGLTrans_static_mapper.js`, `CernerGLTrans_Mapped.csv` (645 data rows + header). HTML viewer `CernerGLTrans_Mapped.html` with 3 tabs (Runtime Flexible JS, Self-Contained JS, Mapped CSV Output).

## Learnings from CernerGLTrans Processing v3 (2026-03-26)

- **CernerGLTrans file (`CernerGLTrans.txt`)**: Delimited (comma) file with 645 data rows, no header row, 0 rows to skip. Same input file as previous two processing runs.
- **Mapping table (`Aultman_Health_I8_CernerGLTrans_Mapping.csv`)**: 22 target fields. This version reverts `FinanceEnterpriseGroup` back to `Hardcode '1'` (was `Hardcode 'AHF'` in v2). All other mapping rules match the v2 mapping:
  - `TransactionDate`: `DateReformat(Column7,'MMDDYYYY','YYYYMMDD')` — Column7 values like `10252025BLU` (11 chars) pass through as-is since length !== 8.
  - `UnitsAmount`: `Column11` (direct column reference, space-padded values).
  - `FinanceDimension1`: `Right(Column4,5)` — values like `001020027` yield `20027`.
  - `AutoReverse`: `Hardcode 'N'`.
  - `ToAccountingEntity`: Not required.
- **Output consistency confirmed**: All three output files (`CernerGLTrans_dynamic_mapper.js`, `CernerGLTrans_static_mapper.js`, `CernerGLTrans_Mapped.csv`) use identical transformation logic. 645 data rows processed with 0 errors.
- **HTML viewer generated**: `CernerGLTrans_Mapped.html` with 3 tabs (Runtime Flexible JS, Self-Contained JS, Mapped CSV Output). Same theme as previous single-record viewers. Base64-encoded CSV for download button.
