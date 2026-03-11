# JavaScript Mapper - Test Files Guide

This guide explains all the test files available and how to use them to test the JavaScript Mapper application.

---

## 📁 Test File Categories

### 1. Delimited Files (CSV)
### 2. Delimited Files (Pipe-Delimited)
### 3. Fixed-Length Files (Single Mapping)
### 4. Fixed-Length Files (Multi-Record-Type)
### 5. Split Function Tests

---

## 1️⃣ DELIMITED FILES (CSV)

### Test Set: Basic Delimited Processing

**Input File**: `sample_delimited_input.csv`
**Mapping File**: `sample_delimited_mapping.csv`

#### What This Tests
- ✅ Auto-detect delimiter (comma)
- ✅ Auto-detect header row
- ✅ Split() function (name, email, phone, date, tags)
- ✅ String functions (Trim, Lowercase, Replace, RemoveLeadingZeroes)
- ✅ Date reformatting
- ✅ Conditional logic (If-Then-Else)
- ✅ Math functions (Round)
- ✅ Validation columns (all 8 types)
- ✅ Increment counter
- ✅ Today() and Now() functions

#### How to Test
1. Open `JavaScript_Mapper.html` in browser
2. Select **File Type**: Delimited
3. Upload **Mapping Table**: `test/sample_delimited_mapping.csv`
4. Upload **Input File**: `test/sample_delimited_input.csv`
5. System should auto-detect:
   - Delimiter: Comma (,)
   - Headers: Yes (skip 1 row)
6. Click **Generate JavaScript Mapper**
7. Review generated code
8. Click **Process Data**
9. Download and verify output

#### Expected Output Fields
- CustomerID (leading zeros removed)
- FirstName, LastName (split from FullName)
- EmailAddress (lowercase)
- EmailUser, EmailDomain (split from email)
- AreaCode, PhoneExchange, PhoneNumber (split from phone)
- FullPhone (dashes removed)
- TransactionMonth, TransactionDay, TransactionYear (split from date)
- TransactionDate (reformatted to YYYYMMDD)
- Amount, AmountRounded
- Status, StatusCode (conditional logic)
- Tag1, Tag2, Tag3 (split from tags)
- AccountNumber, AccountNumberPadded
- RecordID (auto-increment)
- ProcessDate, ProcessTimestamp

#### Sample Input Row
```
1001,John Doe,john.doe@example.com,555-123-4567,01/15/2025,1250.50,Active,"urgent,finance,approved",00012345
```

#### Expected Output Row
```
1001,John,Doe,john.doe@example.com,john.doe,example.com,555,123,4567,5551234567,01,15,2025,20250115,1250.50,1250,Active,A,urgent,finance,approved,12345,0000012345,1,03/10/2025,3/10/2025 2:30:45 PM
```

---

## 2️⃣ DELIMITED FILES (PIPE-DELIMITED)

### Test Set: Pipe Delimiter Auto-Detection

**Input File**: `sample_pipe_delimited_input.txt`
**Mapping File**: `sample_delimited_mapping.csv` (same as above)

#### What This Tests
- ✅ Auto-detect delimiter (pipe |)
- ✅ Auto-detect header row
- ✅ All transformation functions work with pipe delimiter

#### How to Test
1. Open `JavaScript_Mapper.html` in browser
2. Select **File Type**: Delimited
3. Upload **Mapping Table**: `test/sample_delimited_mapping.csv`
4. Upload **Input File**: `test/sample_pipe_delimited_input.txt`
5. System should auto-detect:
   - Delimiter: Pipe (|)
   - Headers: Yes (skip 1 row)
6. Confirm auto-detection
7. Process data

#### Sample Input Row
```
2001|Sarah Connor|sarah.connor@skynet.com|310-555-1234|02/15/2025|5000.00|Active|urgent,security,classified|00087654
```

---

## 3️⃣ FIXED-LENGTH FILES (SINGLE MAPPING)

### Test Set: Basic Fixed-Length Processing

**Input File**: `sample_fixedlength_input.txt`
**Mapping File**: `sample_fixedlength_mapping.csv`

#### What This Tests
- ✅ Fixed-length field extraction
- ✅ Implied decimal support (Amount field)
- ✅ Trim() function for fixed-length fields
- ✅ Date reformatting
- ✅ Conditional logic
- ✅ Validation rules for fixed-length
- ✅ RemoveLeadingZeroes

#### File Structure
```
Position  Length  Field
1-4       4       CustomerID
5-14      10      FirstName
15-24     10      LastName
25-54     30      Email
55-64     10      Phone
65-72     8       TransactionDate (YYYYMMDD)
73-79     7       Amount (implied 2 decimals)
80-80     1       StatusCode
```

#### How to Test
1. Open `JavaScript_Mapper.html` in browser
2. Select **File Type**: Fixed Length (Single Mapping)
3. Upload **Mapping Table**: `test/sample_fixedlength_mapping.csv`
4. Upload **Input File**: `test/sample_fixedlength_input.txt`
5. Click **Generate JavaScript Mapper**
6. Click **Process Data**
7. Verify implied decimals work (1250500 → 12505.00)

#### Sample Input Row
```
0001John      Doe       john.doe@example.com        5551234567202501151250500A
```

#### Expected Output
```
CustomerID: 1
FirstName: John
LastName: Doe
Email: john.doe@example.com
Phone: 5551234567
TransactionDate: 2025-01-15
Amount: 12505.00
StatusCode: A
Status: Active
```

---

## 4️⃣ FIXED-LENGTH FILES (MULTI-RECORD-TYPE)

### Test Set: Hierarchical Multi-Record Processing

**Input File**: `sample_multirecord_input.txt`
**Config File**: `sample_multirecord_config.csv`
**Mapping Files**:
- `sample_multirecord_header_mapping.csv` (H records)
- `sample_multirecord_line_mapping.csv` (L records)
- `sample_multirecord_detail_mapping.csv` (D records)
- `sample_multirecord_comment_mapping.csv` (C records)

#### What This Tests
- ✅ Multi-record-type detection
- ✅ Hierarchical JSON output
- ✅ Different mappings per record type
- ✅ Header-Line-Detail-Comment structure
- ✅ Record type identification (position 1)

#### File Structure
```
Record Type H (Header):
Position 1: H
Position 2-9: ProcessDate (YYYYMMDD)
Position 10-18: BatchID
Position 19-43: BatchName

Record Type L (Line):
Position 1: L
Position 2-5: CustomerID
Position 6-15: FirstName
Position 16-25: LastName
Position 26-32: Amount (implied 2 decimals)
Position 33: StatusCode
Position 34-41: TransactionDate
Position 42-51: InvoiceNumber

Record Type D (Detail):
Position 1: D
Position 2-5: DetailID
Position 6-50: DetailText

Record Type C (Comment):
Position 1: C
Position 2-5: CommentID
Position 6-50: CommentText
```

#### How to Test
1. Open `JavaScript_Mapper.html` in browser
2. Select **File Type**: Fixed Length (Multi-Record-Type)
3. Upload **Record Type Config**: `test/sample_multirecord_config.csv`
4. Upload **Input File**: `test/sample_multirecord_input.txt`
5. System will prompt for each mapping file:
   - Header mapping: `test/sample_multirecord_header_mapping.csv`
   - Line mapping: `test/sample_multirecord_line_mapping.csv`
   - Detail mapping: `test/sample_multirecord_detail_mapping.csv`
   - Comment mapping: `test/sample_multirecord_comment_mapping.csv`
6. Click **Process Data**
7. Download hierarchical JSON output

#### Expected JSON Structure
```json
{
  "Header": {
    "RecordType": "H",
    "ProcessDate": "2025-03-10",
    "BatchID": "BATCH001",
    "BatchName": "DAILY_TRANSACTIONS"
  },
  "Lines": [
    {
      "RecordType": "L",
      "CustomerID": 1,
      "FirstName": "John",
      "LastName": "Doe",
      "Amount": 12505.00,
      "StatusCode": "A",
      "TransactionDate": "2025-01-15",
      "InvoiceNumber": "INV-001"
    },
    ...
  ],
  "Details": [
    {
      "RecordType": "D",
      "DetailID": 1,
      "DetailText": "Additional details for transaction 0001"
    },
    ...
  ],
  "Comments": [
    {
      "RecordType": "C",
      "CommentID": 3,
      "CommentText": "Summary: 3 transactions, Total: 4500.75"
    }
  ]
}
```

---

## 5️⃣ SPLIT FUNCTION TESTS

### Test Set: Split() Function Comprehensive Testing

**Input File**: `test_split_input.txt`
**Mapping File**: `test_split_function.csv`

#### What This Tests
- ✅ Split by space (name parsing)
- ✅ Split by @ (email parsing)
- ✅ Split by dash (phone parsing)
- ✅ Multiple splits from same column
- ✅ Missing parts handling (returns empty string)

#### How to Test
1. Open `JavaScript_Mapper.html` in browser
2. Select **File Type**: Delimited
3. Upload **Mapping Table**: `test/test_split_function.csv`
4. Upload **Input File**: `test/test_split_input.txt`
5. Set delimiter to comma
6. Click **Process Data**

#### Sample Input
```
John Doe,john.doe@example.com,555-123-4567
```

#### Expected Output
```
FirstName: John
LastName: Doe
EmailUser: john.doe
EmailDomain: example.com
AreaCode: 555
PhoneExchange: 123
PhoneNumber: 4567
```

---

## 🧪 TESTING CHECKLIST

### Delimited Files
- [ ] CSV with comma delimiter
- [ ] Pipe-delimited file
- [ ] Tab-delimited file (create your own)
- [ ] Auto-detect delimiter works
- [ ] Auto-detect headers works
- [ ] Skip rows configuration
- [ ] All transformation functions
- [ ] Split() function
- [ ] Validation columns parsed

### Fixed-Length Files (Single)
- [ ] Field extraction by position
- [ ] Implied decimals work
- [ ] Trim() removes spaces
- [ ] Date reformatting
- [ ] All transformation functions
- [ ] Validation rules

### Fixed-Length Files (Multi-Record)
- [ ] Record type detection
- [ ] Multiple mapping files
- [ ] Hierarchical JSON output
- [ ] Header records
- [ ] Line records
- [ ] Detail records
- [ ] Comment records

### Transformation Functions
- [ ] RemoveLeadingZeroes
- [ ] Trim
- [ ] Uppercase/Lowercase
- [ ] Left/Right
- [ ] Split (new!)
- [ ] Replace
- [ ] PadLeft/PadRight
- [ ] Concat
- [ ] DateReformat
- [ ] Sum/Multiply/Divide/Round
- [ ] If-Then-Else
- [ ] Increment By 1
- [ ] Today/Now
- [ ] Hardcode

### Validation Features
- [ ] Required field validation
- [ ] DataType validation
- [ ] MinLength/MaxLength
- [ ] MinValue/MaxValue
- [ ] ValidValues list
- [ ] Pattern (regex)

---

## 📊 TEST DATA SUMMARY

| File Name | Type | Records | Features Tested |
|-----------|------|---------|-----------------|
| sample_delimited_input.csv | Delimited | 5 | All delimited features |
| sample_pipe_delimited_input.txt | Delimited | 3 | Pipe delimiter |
| sample_fixedlength_input.txt | Fixed | 5 | Single mapping |
| sample_multirecord_input.txt | Fixed | 7 | Multi-record-type |
| test_split_input.txt | Delimited | 3 | Split() function |

---

## 🎯 QUICK START TESTING

### 5-Minute Test (Delimited)
1. Open `JavaScript_Mapper.html`
2. Upload `sample_delimited_mapping.csv`
3. Upload `sample_delimited_input.csv`
4. Accept auto-detection
5. Click "Process Data"
6. Verify output has 24 columns

### 5-Minute Test (Fixed-Length)
1. Open `JavaScript_Mapper.html`
2. Select "Fixed Length (Single Mapping)"
3. Upload `sample_fixedlength_mapping.csv`
4. Upload `sample_fixedlength_input.txt`
5. Click "Process Data"
6. Verify Amount shows 12505.00 (not 1250500)

### 10-Minute Test (Multi-Record)
1. Open `JavaScript_Mapper.html`
2. Select "Fixed Length (Multi-Record-Type)"
3. Upload `sample_multirecord_config.csv`
4. Upload `sample_multirecord_input.txt`
5. Upload all 4 mapping files when prompted
6. Click "Process Data"
7. Verify JSON has Header, Lines, Details, Comments

---

## 🐛 TROUBLESHOOTING

### Issue: Auto-detection not working
**Solution**: Make sure file has at least 2 rows of data

### Issue: Split() returns empty
**Solution**: Check delimiter is correct and index is 1-based (not 0-based)

### Issue: Implied decimals not working
**Solution**: Verify ImpliedDecimal column is set to 2 in mapping

### Issue: Multi-record not creating JSON
**Solution**: Ensure RecordType column is position 1 in all mappings

### Issue: Validation columns not parsed
**Solution**: Column names must match exactly (case-insensitive but no spaces)

---

## 📝 CREATING YOUR OWN TEST FILES

### Delimited File Template
```csv
Column1,Column2,Column3
Value1,Value2,Value3
```

### Fixed-Length File Template
```
AAAAAABBBBBCCCCC
12345678901234567
```

### Mapping File Template (Delimited)
```csv
TargetFieldName,InputColumnNumber,MappingLogic,Required
Field1,1,Column1,Y
Field2,2,Trim(Column2),N
```

### Mapping File Template (Fixed-Length)
```csv
TargetFieldName,StartPosition,Length,MappingLogic,Required,ImpliedDecimal
Field1,1,5,Column1,Y,0
Field2,6,10,Trim(Column2),N,0
```

---

## ✅ TEST COMPLETION CHECKLIST

- [ ] All delimited test files work
- [ ] All fixed-length test files work
- [ ] All transformation functions tested
- [ ] Auto-detection features tested
- [ ] Split() function tested
- [ ] Validation columns tested
- [ ] Multi-record-type tested
- [ ] Generated JavaScript code is valid
- [ ] Output data is correct
- [ ] No console errors

---

## 🎉 SUCCESS CRITERIA

Your testing is successful if:
1. ✅ All test files process without errors
2. ✅ Auto-detection works correctly
3. ✅ Split() function produces expected output
4. ✅ Implied decimals work (12505.00 not 1250500)
5. ✅ Multi-record creates hierarchical JSON
6. ✅ Generated JavaScript is syntactically correct
7. ✅ Output matches expected results

---

**Happy Testing! 🚀**
