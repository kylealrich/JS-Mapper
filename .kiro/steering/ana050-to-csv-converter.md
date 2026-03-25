---
inclusion: manual
---

# Generate Mapping CSV - Learnings & Optimization Notes

## Document Analysis (python-docx)

### Fast Table Identification
- The field mapping table is typically the **largest table** in the document (60-80+ rows).
- Look for tables with headers containing: `S No.`, `Target`, `Input/source file`, `Remarks`, `Type`, `Size`, `Required`.
- Skip small tables (< 10 rows) — they are metadata, email configs, test scenarios, or sign-off blocks.
- Table index is not fixed across documents; always scan by header signature, not by index.

### Column Mapping from Document to CSV
- The document's "Input/source file" column contains free-text descriptions with embedded column letters (e.g., "Column A", "Column C").
- Map column letters to 1-indexed numbers: A=1, B=2, C=3, ... Z=26.
- Transformation hints are embedded in the same cell (e.g., "Remove leading zeroes", "First 6 digits", "Last 5 digit").
- Hardcoded values appear as plain text without column references (e.g., "AHF", "0", "N").
- "Blank" or empty Input/source file means no mapping (leave InputColumnNumber and MappingLogic empty).

### Determining File Type
- **Delimited**: Document mentions "CSV", "comma", "pipe", "tab", column letters (A, B, C...), or shows tabular source data.
- **Fixed-Length**: Document mentions "Start", "End", character positions, or record type indicators.
- The Cerner GLTrans interface is **comma-delimited, single business class**.

### Determining Single vs Multi-Record / Multi-Business Class
- **Single**: One business class target (e.g., "GLTransactionInterface business class").
- **Multiple**: Document references multiple record types, type indicator positions, or parent-child relationships between record types.

### Multi-Record Single-File Mapping Format
For multi-record (multi-business class) fixed-length files, generate **one combined mapping CSV** instead of separate per-record-type files and a config file. The combined file uses a `RecordType` column to group field rows by record type, and embeds the record type config as special `_CONFIG` rows at the top.

#### Combined CSV Structure
```
RowType,RecordType,Field Name,Start,End,Length,Required,Pad Character,Justify,Default Value,Mapping Logic,Description,Type Indicator Position,Type Indicator Length,Type Indicator Value,Parent Record Type,Output Name
_CONFIG,Header,,,,,,,,,,,1,2,B1,,Headers
_CONFIG,Detail,,,,,,,,,,,1,2,PT,Header,Details
_CONFIG,Trailer,,,,,,,,,,,1,2,BT,Header,Trailers
_FIELD,Header,Transaction Code,1,2,2,Y, ,Left,BH,,BH=Batch Header,,,,,
_FIELD,Header,Company ID,3,6,4,Y,0,Right,,,"FinanceDimension1",,,,,
_FIELD,Detail,Transaction Code,1,2,2,Y, ,Left,PT,,Default PT,,,,,
_FIELD,Detail,Item,3,6,4,Y,0,Right,0000,,Default 0000,,,,,
_FIELD,Trailer,Transaction Code,1,2,2,Y, ,Left,BT,,Default BT,,,,,
...
```

- `RowType` column: `_CONFIG` for record type configuration rows, `_FIELD` for field mapping rows.
- `RecordType` column: the record type name (e.g., Header, Detail, Trailer, Line, Comment). Groups fields to their record type.
- `_CONFIG` rows carry `Type Indicator Position`, `Type Indicator Length`, `Type Indicator Value`, `Parent Record Type`, and `Output Name`. Field mapping columns are left empty.
- `_FIELD` rows carry the standard field mapping columns (`Field Name`, `Start`, `End`, `Length`, `Required`, `Pad Character`, `Justify`, `Default Value`, `Mapping Logic`, `Description`). Config columns are left empty.
- All `_CONFIG` rows appear before any `_FIELD` rows.
- One file replaces both the `RecordType_Config.csv` and all per-record-type mapping CSVs.
- Naming convention: `{InterfaceName}_MultiRecord_Mapping.csv`.

## Mapping Logic Translation Rules

### From Document Description to MappingLogic Syntax
| Document Description | MappingLogic |
|---|---|
| "Column X" (direct) | `ColumnN` |
| "Remove leading zeroes" + Column | `RemoveLeadingZeroes(ColumnN)` |
| "First N digits" + Column | `Left(ColumnN,N)` |
| "Last N digits" + Column | `Right(ColumnN,N)` |
| Hardcoded literal value | `Hardcode 'value'` |
| "Increment by 1" / "Sequence Number" | `Increment By 1` |
| Date field with format conversion | `DateReformat(ColumnN,'MMDDYYYY','YYYYMMDD')` |
| "X will default if left blank" | `If ColumnN == '' Then 'X' Else ColumnN` |
| "Blank" or no source | (leave empty) |
| "HardCoded = N" | `Hardcode 'N'` |

### DataType Mapping
| Document Type | CSV DataType |
|---|---|
| AlphaUpper, Alpha | string |
| Numeric | integer |
| Decimal (with size like 18.2) | decimal |
| Date | string (dates stored as formatted strings) |
| Boolean | string |
| UniqueID | (skip row — system-generated) |

### Fields to Skip
- `UniqueID` — system-generated, no mapping needed.
- `GLTransactionInterface_user_fields` — internal placeholder, no mapping.
- Fields with no source and no default (rows 20-47 ReportCurrencyAmount.*) — omit unless document specifies a source.
- `ErrorMessage` — system-generated.
- `SenderLogicalID`, `SenderComponentID`, `SenderCreationDateTime`, `SenderBODID`, `SenderOriginalBOD` — system/integration fields, omit.

## Archive Check
- Always check `/archive/` for existing mappings for the same interface before generating from scratch.
- An existing mapping can serve as a validated baseline — cross-reference against the document to catch updates.

## Performance Tips
- Extract only the field mapping table (largest table) — skip all others.
- Write a single Python script that extracts, analyzes, and determines file type in one pass.
- Clean up all temp files after generation.
- The `executePwsh` shell may be stuck from prior mapper runs — always use `controlPwshProcess` for shell commands.

## SoNH CB Recon (INT_FIN_093) - Learnings (2026-03-21)

### Document Structure
- The SoNH CB Recon document uses a different table structure than Aultman Health docs.
- The FSM field mapping table has headers: `FSM Field`, `Type`, `Field Size`, `Required Field?`, `Remarks`, `Sample Value`, `Bank Values /Fields`.
- Row 1 is a merged header row ("CashLedgerBankUpdate Business Class") with a note — skip it.
- Actual field rows start at Row 2.
- The "Bank Values /Fields" column names the bank format field (e.g., "Account Number", "Dollar Amount", "Status Code", "Paid Date", "Check Serial Number").
- There is NO separate bank format table with Start/End positions — positions must be derived from the sample record and extract sample table.

### Fixed-Length Position Derivation
- Sample record: `33118329320000262751R00000002873501092645236521` (47 chars)
- Extract sample table (Table 15) lists field values in order without position info.
- Derived positions:
  - Account Number: pos 1-10 (10 chars)
  - Check Serial Number: pos 11-20 (10 chars)
  - Status Code: pos 21-21 (1 char)
  - Dollar Amount: pos 22-33 (12 chars, 2 implied decimals)
  - Paid Date: pos 34-39 (6 chars, MMDDYY format)
  - Batch and Sequence Number: pos 40-47 (8 chars) — NOT mapped per document

### Engine Limitations Encountered
- `Divide()` only accepts two Column references — cannot do `Divide(Column4, Hardcode '100')`.
- `DateReformat()` only supports 8-char formats (MMDDYYYY, YYYYMMDD) — no MMDDYY (6-char) support.
- `ElseIf` is NOT supported in the If conditional parser — only `If...Then...Else`.
- `ImpliedDecimal` column in the mapping CSV is for documentation only — the exe does not process it.
- For fields requiring transformations beyond engine capabilities (implied decimal, MMDDYY dates), output the raw column value and rely on IPA to handle the conversion.

### Mapping Decisions
- CashManagementGroup: Hardcoded 'SONH' per document default.
- RunGroup: Hardcoded 'SONH_CBrecon' — IPA constructs the full RunGroup with CashCode and date at runtime.
- CashLedgerUpdateAction: `If Column3 == 'P' Then '4' Else '6'` — simplified from ElseIf since only P and R values exist.
- TransactionAmount: Raw Column4 with ImpliedDecimal=2 — IPA handles decimal insertion.
- ActionDate: Raw Column5 — IPA handles MMDDYY→YYYYMMDD conversion.
- CashCode: Hardcoded empty — IPA looks up CashCode from CashManagementAccount at runtime.
- CheckNumber: `RemoveLeadingZeroes(Column2)` per document sample showing "read as 262751".

### File Already in Archive
- The input docx was already in `/archive/` from a prior session — check before attempting move.
- PowerShell `Copy-Item` chokes on `+` in filenames — use `-LiteralPath` parameter.

## GEAC GL Outbound Interface (DES-020) - Learnings (2026-03-24)

### Document Structure
- Design specification document, not a standard field mapping table format.
- Field mapping is under "Proposed Solution" > "Field Mapping" heading (paragraph index ~58).
- Three separate mapping tables for three record types: Header (Table 7), Detail (Table 9), Trailer (Table 11).
- Each table has columns: `GEAC Mapping`, `Length/Size`, `Position`, `Value`, `CSF Mapping`.
- Sample data lines are in single-cell tables (Tables 6, 8, 10) between the mapping tables.
- Application Area lookup table (Table 4) maps GEAC codes to FSM equivalents.
- Special character encoding table (Table 5) maps characters to implied decimal values ({=+0, A=+1, }=-0, J=-1, etc.).

### File Type Determination
- **Fixed-Length, Multi-Record-Type** (3 record types: Header BH/B1, Detail PT, Trailer BT).
- Record type indicator is 2 characters at positions 1-2.
- Both Header and Trailer start with 'B' — single-position detection is insufficient.
- Config requires `Type Indicator Length` column set to 2 for proper detection.

### Position Validation Against Sample Data
- Header record: 34 characters total.
- Detail record: 180 characters total.
- Trailer record: 25 characters total.
- All positions validated correctly against `input/GEAC_AP_20220219.txt`.

### Key Mapping Notes
- Detail Source Code (pos 44-47): Document says "Keep 0000" but actual sample data shows application area code (e.g., "AP"). Document may be outdated.
- Detail Cost Center (pos 40-43): Document says default 0000 but sample shows actual FinanceDimension4 values (e.g., "0901").
- Detail Description (pos 75-129, 55 chars) and Fund Serial (pos 130-138, 9 chars) share the broader 75-180 range. Document says Description is 105 chars at 75-180, but Fund/Serial overlaps at 130-138.
- Amount field uses special character encoding for implied decimal (last character encodes sign and last digit).
- DRCR Code: 60=Credit (negative amount), 10=Debit (positive amount).

### Output Files Generated
- `GEACGL_MultiRecord_Mapping.csv` — Single combined mapping CSV with 3 `_CONFIG` rows (Header/BH, Detail/PT, Trailer/BT) and 31 `_FIELD` rows (8 Header + 17 Detail + 6 Trailer fields). Replaces the previous 4-file approach (separate per-record-type mappings + config).

### Archive Cross-Reference
- Prior GEAC GL mappings existed in `/archive/` (4 separate files: config + 3 per-record-type CSVs).
- Cross-referencing archive against document confirmed archive mappings were accurate.
- Key discrepancies in the document (resolved by archive/sample data):
  - Detail Description size: Doc says 105 chars (75-180), actual is 55 chars (75-129) with Fund/Serial at 130-138.
  - Detail Mgmt Center size: Doc says 4, actual is 5 (positions 35-39).
  - Header Data Type Code size: Doc says 2, actual is 1 (position 11 only).
  - Source Date format: Doc text says YYYYMMDD, sample data shows MMDDYY.

### Shell Environment Notes
- `executePwsh` on this machine often times out or shows garbled output — use `ignoreWarning: true` and `timeout: 10000`.
- Python commands work but need patience — the shell is slow to respond.
- Use `2>&1` to capture stderr in bash-on-Windows environment.
- `mv -Force` needed when file already exists in archive from a prior `cp`.
- `Move-Item -Force` works for archiving files on this machine.

## OMRQ Owens and Minor Requisition Interface (I71) - Learnings (2026-03-25)

### Document Structure
- Analysis and Design Specification document with field mapping embedded in Functional Requirements table (Table 4).
- FR 1.2.1 = Requisition Header (NBO), FR 1.2.2 = Requisition Line (NBO), FR 1.2.3 = Requisition Comment (NBO).
- FR 1.3.1-1.3.3 = OR Bill Only (BO) variants — same positional layout as NBO with minor mapping differences.
- Each FR cell contains nested tables: Table 0 = main mapping (8 cols: Position, Field Name, Type/Length, Description, Sample, S3 Table-Field, FSM Field, Remarks), Table 1 = extended fields (5 cols, no FSM mapping — reference only).
- No standalone field mapping table — must parse nested tables inside FR cells.

### File Type Determination
- **Fixed-Length, Multi-Record-Type** (4 record types: H=Header, L=Line, C=Header Comment, D=Detail/Line Comment).
- Record type indicator: position 1, length 1, values H/L/C/D.
- Record length: 2330 characters per record (per FR 1.1.1).
- File is newline-separated (not continuous), each line is one record.

### Record Type Hierarchy
- Header (H) is the root record.
- Line (L) is a child of Header.
- Comment (C) is a child of Header (header-level comments).
- Detail (D) is a child of Line (line-level comments/serial/lot tracking).

### Key Mapping Notes
- NBO and BO share identical positional layouts — only mapping logic differs for some fields (e.g., Buyer Code, Vendor, PO User Fld 5/6).
- NBO mapping used as primary since it's the default case.
- Comment (C) and Detail (D) share the same positional layout for positions 1-133 (Record Type, Company, Req Number, Line Number, Name, Comment Type, Comment). Positions 134-2330 are filler.
- Nested Table 1 in FR 1.2.1 and FR 1.2.2 contains extended fields (positions 739-2330 for Header, 383-2330 for Line) that are mostly user fields, patient info, and filler — included for reference but not actively mapped by Aultman.

### Validation Against Sample Data
- Sample file: `archive/omrq.bcs.20250405101502.txt` — 16 records (1 H + 4 L + 7 D + 4 C), 35042 total characters.
- All field positions validated correctly against sample data.
- Last record (C) is only 92 chars (truncated, no trailing filler) — mapping handles this since Comment fields only go to position 133.
- Item field (pos 19-50) contains both alphanumeric codes (SC-4275) and numeric codes (138152) — left-justified with space padding.
- Quantity (pos 83-95) is 13 chars with 9 whole + 4 decimal implied — e.g., `0000000010000` = 10.000.
- Tran Unit Cost (pos 100-117) is 18 chars with 13 whole + 5 decimal implied — e.g., `000000000004800000` = $0.048.

### Output Files Generated
- `output/OMRQ_MultiRecord_Mapping.csv` — Combined `_CONFIG`/`_FIELD` format with 4 `_CONFIG` rows and 112 `_FIELD` rows (54 Header + 44 Line + 7 Comment + 7 Detail).

## SEPTA GEAC GL Outbound Interface - Learnings (2026-03-25)

### Document Structure
- Design specification document titled "SEPTA GEAC GL Interface document-WIP 1.docx".
- Field mapping is under "Field Mapping" heading (Paragraph 27).
- Three record types documented in separate sections: Header (Heading 3, P[38]), Detail (Heading 3, P[49]), Trailer (Heading 3, P[63]).
- GEAC layout tables: Table 3 (Header, 9 rows), Table 6 (Detail, 15 rows), Table 9 (Trailer, 7 rows).
- CSF mapping tables: Table 11 (Header CSF, 9 rows), Table 13 (Detail CSF, 15 rows).
- Business Class field reference: Table 14 (60 rows) — GLTransactionInterface business class.
- Application Area lookup: Table 4 (13 rows) — AP, AR/CR, RV, PA, CT, PR, WI, AG, FA/FB/FC, FE, TW.
- GEAC overpunch character table: Table 7 (21 rows) — {=+0, A-I=+1 to +9, }=-0, J-R=-1 to -9.
- Sample data lines in single-cell tables: Table 2 (Header), Table 5 (Detail), Table 8 (Trailer), Table 10 (Header repeat), Table 12 (Detail repeat).

### File Type Determination
- **Fixed-Length, Multi-Record-Type** (3 record types: Header B1/BH, Detail PT, Trailer BT).
- Record type indicator is 2 characters at positions 1-2.
- Header starts with `B1` (not `BH`) — same mismatch pattern as Aultman GEAC. Config uses `BH` with first-character fallback to `B`.
- Multiple vendors feed GEAC GL files: FELA, TWS, AP, AR, PA, CT, RV, PR, WI, AG, FA/FB/FC.

### Position Validation Against Sample Data (`GL_FELA_20210504_Test.txt`)
- 118 total lines: 1 Header, 116 Details, 1 Trailer.
- Header record: 35 characters (pos 1-34 documented + 1 extra char at pos 35).
- Detail record: 180 characters total.
- Trailer record: 25 characters total.
- Positions 14-25 in Detail are blank/spaces (not documented in mapping tables — gap between Company ID pos 10-13 and Account pos 26-31).
- Positions 32-34 in Detail are blank/spaces (gap between Account pos 26-31 and Mgmt Center pos 35-39).
- All documented positions validated correctly against sample data.

### Key Mapping Notes
- **SEPTA-specific defaults**: FinanceEnterpriseGroup = "SPTA", AccountingEntity = "1", ToAccountingEntity = "1".
- **RunGroup**: Constructed from Header fields — Application Area + date (e.g., "TW20200301"). Not a simple positional extraction.
- **DRCR Code**: 10/11 = Debit, 60/61 = Credit. Used for amount sign computation: DRCR 60/61 multiplies positive amount by -1; DRCR 10/11 multiplies negative amount by -1.
- **Source Date**: MMDDYY format (6 chars, pos 48-53). Sample: `032721` = 03/27/21. Left-justified with pad='0'.
- **Effective Date**: MMDDYYYY format (8 chars). Header pos 27-34, Detail pos 54-61. Sample: `03272021`.
- **Amount**: 13 chars (pos 62-74) with GEAC overpunch notation. Right-justified, pad='0'. Sample values don't show overpunch in this file (all end with digits, not special chars).
- **Description**: Document says pos 75-180 (106 chars), but FUND/SERIAL overlaps at pos 130-138. Actual Description is pos 75-129 (55 chars), same as Aultman GEAC pattern.
- **Fund Serial**: Pos 130-138 (9 chars). For companies 4000, 5000, 6000 only. Maps to Project field.
- **Detail gaps**: Pos 14-25 (12 chars) and pos 32-34 (3 chars) are unmapped spaces in the GEAC format.
- **Last Detail line**: Shorter (126 chars) — Description and trailing fields truncated. This is the offsetting/balancing entry (DRCR=60).
- **GeneralLedgerEvent**: Defaults to "JE" if left blank (per Table 14 Row 9).
- **System**: Defaults to "GL" if left blank (per Table 14 Row 17).
- **CurrencyCode**: SEPTA doesn't process foreign currency transactions (per document note).

### Output Files Generated
- `output/SEPTA_GEACGL_MultiRecord_Mapping.csv` — Combined `_CONFIG`/`_FIELD` format with 3 `_CONFIG` rows and 28 `_FIELD` rows (8 Header + 14 Detail + 6 Trailer fields).
