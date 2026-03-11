# Quick Start - Enhanced JavaScript Mapper

## 🚀 What's New?

Your JavaScript Mapper now has 4 powerful enhancements built-in:

1. **Implied Decimals** - `12345` → `123.45` automatically
2. **Field Validation** - Data type, range, pattern, valid values
3. **Enhanced Mapping** - Support for validation columns
4. **Drag-and-Drop** - Drag files from desktop

---

## ⚡ 30-Second Quick Start

### Step 1: Use the Enhanced Template
Copy `input/Enhanced_FixedLength_Mapping_Template.csv` and customize it.

### Step 2: Add Your Fields
```csv
Field Name,Start,End,Decimal Places,Data Type,Valid Values
Amount,1,15,2,Numeric,
Status,16,16,0,Alpha,A|I|P
```

### Step 3: Drag and Drop
1. Open `JavaScript_Mapper.html`
2. Drag your data file onto "Select Input Data File"
3. Drag your mapping file onto "Fixed-Length Mapping CSV"
4. Click Preview

**That's it!** Decimals and validation work automatically.

---

## 💰 Example: Financial Data

### Your Mapping CSV:
```csv
Field Name,Start,End,Decimal Places,Data Type,Min Value,Max Value
Account,1,10,0,Numeric,1,9999999999
Amount,11,25,2,Numeric,0.01,999999999.99
Date,26,33,0,Date,,
```

### Your Data File:
```
00012345670000012345202501150
```

### Output:
```json
{
  "Account": "1234567",
  "Amount": "123.45",
  "Date": "20250115"
}
```

**Decimal conversion happened automatically!**

---

## ✅ Example: Data Validation

### Your Mapping CSV:
```csv
Field Name,Start,End,Data Type,Pattern,Valid Values
Email,1,50,Alphanumeric,^[^@]+@[^@]+\.[^@]+$,
State,51,52,Alpha,,CA|NY|TX|FL
Status,53,53,Alpha,,A|I|P
```

### Invalid Data:
```
invalid-email                                     XX A
```

### Validation Errors:
```
Field: Email
Value: invalid-email
Error: Value does not match required pattern

Field: State
Value: XX
Error: Value "XX" not in valid list: CA|NY|TX|FL
```

---

## 🎯 Common Use Cases

### Use Case 1: Bank Transaction File
```csv
Field Name,Start,End,Decimal Places,Required
Account,1,10,0,Y
Amount,11,25,2,Y
Date,26,33,0,Y
```
**Result**: Amounts automatically converted to dollars and cents

### Use Case 2: Customer Data with Validation
```csv
Field Name,Start,End,Data Type,Pattern
Email,1,50,Alphanumeric,^[^@]+@[^@]+\.[^@]+$
Phone,51,60,Numeric,^\d{10}$
Zip,61,65,Numeric,^\d{5}$
```
**Result**: Invalid emails, phones, and zips are caught immediately

### Use Case 3: Status Codes
```csv
Field Name,Start,End,Valid Values
Status,1,1,A|I|P
Type,2,2,H|L|D|C
Priority,3,3,1|2|3|4|5
```
**Result**: Only valid codes are accepted

---

## 🎨 Drag-and-Drop in Action

**Before**: Click Browse → Navigate folders → Select file → Click Open

**After**: Drag file from desktop → Drop on input → Done!

**Works on**:
- ✅ Data file input
- ✅ Mapping file input
- ✅ Fixed-length mapping input
- ✅ Record type config input

---

## 📋 Validation Column Reference

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| Data Type | Text | Numeric, Alpha, Alphanumeric, Date | Validates data type |
| Decimal Places | Number | 2 | Implied decimals (2 = divide by 100) |
| Min Value | Number | 0.01 | Minimum numeric value |
| Max Value | Number | 999999.99 | Maximum numeric value |
| Min Length | Number | 5 | Minimum string length |
| Max Length | Number | 50 | Maximum string length |
| Pattern | Regex | ^\d{10}$ | Regex pattern to match |
| Valid Values | Text | A\|I\|P | Pipe-separated valid values |

---

## 🔧 Enable Validation (Optional)

By default, validation is **disabled** for backward compatibility.

To enable validation, modify the processing code:

```javascript
// Find this line in your code:
var record = extractFixedLengthFields(line, fields);

// Change to:
var record = extractFixedLengthFields(line, fields, { validate: true });

// Then check for errors:
if (record._validationErrors) {
  console.log('Validation errors:', record._validationErrors);
}
```

---

## 📁 Files You Need

### Required:
- `JavaScript_Mapper.html` - Main application (now enhanced!)
- Your data file (.txt)
- Your mapping CSV

### Templates:
- `input/Enhanced_FixedLength_Mapping_Template.csv` - Use this!
- `input/FixedLength_Mapping_Template.csv` - Original (still works)

### Documentation:
- `INTEGRATION_COMPLETE.md` - What was integrated
- `ENHANCEMENTS_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `WORKFLOW_GUIDE.md` - Complete workflow

---

## ⚠️ Important Notes

### Backward Compatibility
✅ All existing mappings work without changes
✅ New columns are optional
✅ Validation is opt-in
✅ Decimal Places defaults to 0 (no conversion)

### Column Names
Column names are case-insensitive and space-insensitive:
- `Decimal Places` = `decimalplaces` = `DecimalPlaces` ✅
- `Data Type` = `datatype` = `DataType` ✅

### Validation
Validation only runs if you pass `{ validate: true }` option.
Without it, validation columns are ignored (for performance).

---

## 🎓 Learning Path

### Beginner (5 minutes)
1. Open `JavaScript_Mapper.html`
2. Try drag-and-drop with existing files
3. See it work!

### Intermediate (15 minutes)
1. Copy enhanced template
2. Add `Decimal Places` to amount fields
3. Process a financial file
4. Verify decimal conversion

### Advanced (30 minutes)
1. Add validation columns to mapping
2. Enable validation in code
3. Test with invalid data
4. Review validation errors

---

## 🐛 Quick Troubleshooting

**Decimals not converting?**
- Check `Decimal Places` column exists
- Verify value is a number

**Validation not working?**
- Did you pass `{ validate: true }`?
- Check column names are correct

**Drag-and-drop not working?**
- Refresh the page
- Check browser console for errors

---

## 📞 Need Help?

1. Check `INTEGRATION_COMPLETE.md` for detailed info
2. Review `ENHANCEMENTS_IMPLEMENTATION_GUIDE.md` for examples
3. Look at `Enhanced_FixedLength_Mapping_Template.csv` for reference
4. Check browser console for error messages

---

## 🎉 You're Ready!

Your JavaScript Mapper is now enhanced with:
- ✅ Automatic decimal conversion
- ✅ Comprehensive validation
- ✅ Drag-and-drop upload
- ✅ 100% backward compatible

**Start using it right now - no additional setup needed!**

Just open `JavaScript_Mapper.html` and drag your files in. 🚀
