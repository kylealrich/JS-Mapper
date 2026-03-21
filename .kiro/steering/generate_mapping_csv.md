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

### Determining Single vs Multi-Record
- **Single**: One business class target (e.g., "GLTransactionInterface business class").
- **Multiple**: Document references multiple record types, type indicator positions, or parent-child relationships between record types.

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
