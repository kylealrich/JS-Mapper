# Owens & Minor Requisition Interface Analysis

## File Overview

**Source File**: `input/omrq.bcs.20250405101502.txt`  
**Mapping Spec**: `input/Fixed Length Mapping.csv`  
**Format**: Fixed-length positional data  
**Interface**: Owens & Minor Requisition Interface (OMRQ)  
**Date**: April 5, 2025 10:15:02

## Record Structure

The file contains 4 record types with hierarchical relationships:

### Record Type Summary
- **H** - Header (1 record) - Contains requisition-level information
- **L** - Line Items (4 records) - Individual products/items ordered
- **D** - Detail Records (6 records) - Serial numbers and lot tracking
- **C** - Comment Records (1 record) - Additional information like patient MRN

## Header Record (H) Analysis

**Position 1**: Record Type = `H`  
**Total Length**: 738 characters

### Key Fields Extracted:

| Field | Position | Value | FSM Target | Notes |
|-------|----------|-------|------------|-------|
| Company | 5-8 | 0010 | RQH-COMPANY | Trim leading zeros → "10" |
| Req Number | 12-18 | 0000000 | RQH-REQNUMBER | Zero string → BLANK |
| Line Number | 13-18 | 000000 | N/A | Always zero for header |
| Requester | 19-28 | RQ500OMOR | RQH-REQUESTER | Needs crosswalk mapping |
| Req Location | 29-33 | 72000 | RQH-REQLOCATION | Requesting location |
| Req Del Date | 34-41 | 20250405 | RQH-REQDELDATE | YYYYMMDD format |
| Creation Date | 42-49 | 20250405 | RQH-CREATIONDATE | YYYYMMDD format |
| From Company | 50-53 | 0000 | RQH-FROMCOMPANY | Zero → BLANK |
| From Location | 54-58 | WARE | RQH-FROMLOCATION | Warehouse location |
| Print Req Flag | 135 | N | RQH-PRINTREQFL | Convert to Boolean |
| Account Unit | 278-292 | 10325 | RQH-ACCTUNIT | Cost Center |
| Dropship Flag | 324 | N | RQH-DROPSHIPFL | Convert to Boolean |
| One Src One PO | 623 | 1 | RQH-ONESRCONEPO | Boolean conversion |

### Blank/Expected Empty Fields:
- Buyer Code (89-91)
- Vendor (92-100)
- Purchase From Location (101-104)
- Vendor Name (105-134)
- Agreement Reference (136-165)
- All PO User Fields
- Activity Code (226-240)
- Account Category (241-245)
- All Dropship address fields (since Dropship = N)

## Line Item Records (L) Analysis

**Position 1**: Record Type = `L`  
**Total Length**: 738 characters per line  
**Count**: 4 line items

### Line Item 1
| Field | Position | Value | Description |
|-------|----------|-------|-------------|
| Item Number | 19-48 | SC-4275 | X Precision Hex Wrench |
| Description | 49-78 | X Precision Hex Wrench | Product description |
| Quantity | 79-88 | 0000000010 | 10 units |
| Unit of Measure | 89-91 | EA | Each |
| Unit Price | 92-106 | 000000000004800 | $0.48 (implied 4 decimals) |
| Required Flag | 107 | Y | Required item |
| Taxable Flag | 108 | Y | Taxable |

### Line Item 2
| Field | Position | Value | Description |
|-------|----------|-------|-------------|
| Item Number | 19-48 | 138152 | N ALPHA FEEELINK REMOTE KITBLE |
| Quantity | 79-88 | 0000000010 | 10 units |
| Unit Price | 92-106 | 000000000150000 | $150.00 |
| Required Flag | 107 | N | Not required |
| Taxable Flag | 108 | Y | Taxable |

### Line Item 3
| Field | Position | Value | Description |
|-------|----------|-------|-------------|
| Item Number | 19-48 | 138153 | N Precision Charging System |
| Quantity | 79-88 | 0000000010 | 10 units |
| Unit Price | 92-106 | 000000000150000 | $150.00 |

### Line Item 4
| Field | Position | Value | Description |
|-------|----------|-------|-------------|
| Item Number | 19-48 | 138104 | N WAVEWRITER ALPHA 32 IPG KIT |
| Quantity | 79-88 | 0000000010 | 10 units |
| Unit Price | 92-106 | 000000001930000 | $1,930.00 |

**Total Order Value**: $2,230.48 (10 units × sum of prices)

## Detail Records (D) Analysis

**Position 1**: Record Type = `D`  
**Purpose**: Serial number and lot tracking for medical devices

### Detail Record Breakdown:

**Line 1 (SC-4275)**: 1 detail record
- PLOT: 35867216 (Lot number)

**Line 2 (138152)**: 2 detail records
- PSER: 533799 (Serial number)
- PLOT: 533799 (Lot number)

**Line 3 (138153)**: 2 detail records
- PSER: 511619 (Serial number)
- PLOT: 511619 (Lot number)

**Line 4 (138104)**: 2 detail records
- PSER: 780019 (Serial number)
- PLOT: 780019 (Lot number)

### Regulatory Compliance Note:
Serial and lot tracking is required for FDA-regulated medical devices. This enables:
- Product recalls and traceability
- Expiration date management
- Patient safety tracking
- Regulatory compliance (21 CFR Part 820)

## Comment Record (C) Analysis

**Position 1**: Record Type = `C`  
**Content**: PMRN: 0004729561408aa

**PMRN** = Patient Medical Record Number  
This links the requisition to a specific patient for billing and tracking purposes.

## Data Transformation Requirements

### Numeric Field Processing:
1. **Trim Leading Zeros**: Company, quantities, prices
2. **Zero String to BLANK**: Req Number, Line Number when all zeros
3. **Decimal Conversion**: Prices have implied 4 decimal places (divide by 10000)

### Boolean Conversions:
- Y/N → True/False for: Print Req, Dropship, Quote, Tax flags

### Date Formatting:
- Input: YYYYMMDD (20250405)
- May need conversion based on FSM requirements

### Crosswalk Mappings Needed:
- **Requester Code**: RQ500OMOR → FSM Requester value
- **Location Codes**: Validate against FSM location master
- **Account Unit**: 10325 → FSM Cost Center validation

## Business Rules Identified

1. **Dropship Logic**: When Dropship Flag = N, all ship-to fields should be blank
2. **Line-Detail Relationship**: Detail records reference parent line items
3. **Serial Number Tracking**: High-value items (>$100) have serial numbers
4. **Required Items**: Flag indicates if item substitution is allowed
5. **One Source One PO**: Flag = 1 means create separate PO per vendor

## Integration Considerations

### FSM (Financial Supply Management) Mapping:
- Map to RQH (Requisition Header) table
- Map to RLN (Requisition Line) table
- Handle serial/lot tracking in inventory system
- Link to patient billing via PMRN

### Data Quality Checks:
- Validate location codes exist in FSM
- Verify account unit (cost center) is active
- Check item numbers against FSM item master
- Validate price reasonableness
- Ensure serial numbers are unique

### Error Handling:
- Missing required fields
- Invalid location codes
- Duplicate serial numbers
- Price discrepancies
- Invalid date formats

## Recommended Next Steps

1. **Create Fixed-Length Parser**: Build JavaScript function to extract fields by position
2. **Implement Transformation Rules**: Apply trim, conversion, and validation logic
3. **Generate CSV Output**: Create structured CSV for FSM import
4. **Build Validation Module**: Check data quality before FSM load
5. **Create Test Cases**: Use this file as baseline test data
6. **Document Crosswalk Tables**: Define requester and location mappings

## Technical Implementation Notes

### Parser Architecture:
```javascript
function parseOMRQRecord(line, recordType) {
  var record = {};
  
  if (recordType === 'H') {
    record.company = trimLeadingZeros(line.substring(4, 8));
    record.reqNumber = zeroToBlank(line.substring(11, 18));
    record.requester = line.substring(18, 28).trim();
    // ... continue for all header fields
  }
  
  return record;
}
```

### Validation Strategy:
- Field-level validation (format, length, type)
- Business rule validation (relationships, dependencies)
- Reference data validation (codes exist in master tables)
- Cross-record validation (detail records match line items)

## File Statistics

- **Total Records**: 12 (1 H + 4 L + 6 D + 1 C)
- **Total Characters**: 8,856 (12 × 738)
- **Line Items**: 4
- **Tracked Devices**: 3 (with serial numbers)
- **Order Date**: April 5, 2025
- **Delivery Location**: WARE (Warehouse)
- **Cost Center**: 10325
