# JavaScript Mapper - Complete Workflow Guide

## 🎯 Overview
The JavaScript Mapper now supports three modes:
1. **Delimited Files** - CSV, pipe, tab-delimited files
2. **Fixed-Length Files (Single Mapping)** - One mapping for entire file
3. **Fixed-Length Files (Multi-Record-Type)** - Different mappings for H/L/D/C records

---

## 📋 Mode 1: Delimited Files

### Files Needed:
- Input data file (CSV/TXT with delimiters)
- Mapping CSV file

### Steps:
1. Open `JavaScript_Mapper.html` in browser
2. **File Type**: Select "Delimited" (default)
3. **Select Input Data File**: Choose your CSV/TXT file
4. **Select Mapping CSV**: Choose your mapping configuration
5. **Delimiter**: Select appropriate delimiter (comma, pipe, tab, etc.)
6. **Skip Rows**: Set number of header rows to skip (default: 1)
7. Click **"Preview Files"**
8. Review the mapping table and input preview
9. **Generation Type**: Choose "Runtime Flexible" or "Self-Contained"
10. Click **"Generate Mapper JS + Output CSV"**
11. Download JavaScript file and CSV output

---

## 📋 Mode 2: Fixed-Length Files (Single Mapping)

### Files Needed:
- Input data file (fixed-length TXT)
- Fixed-length mapping CSV

### Mapping CSV Format:
```csv
Field Name,Start,End,Length,Required,Mapping Logic,Pad Character,Justify,Default Value,Description
Company,1,4,4,Y,RemoveLeadingZeroes(Column1),0,Right,,Company number
Name,5,34,30,Y,,,,Left,Customer name
```

### Steps:
1. Open `JavaScript_Mapper.html` in browser
2. **File Type**: Select "Fixed-Length"
3. **Select Input Data File**: Choose your fixed-length TXT file
4. **Fixed-Length Mapping CSV**: Choose your mapping file
5. **Multi-Record-Type File**: Leave UNCHECKED
6. Click **"Preview Files"**
7. Review field layout and data preview
8. Click **"Generate Mapper JS + Output CSV"**
9. Download JavaScript file and CSV output

### Template:
Use `input/FixedLength_Mapping_Template.csv` as a starting point

---

## 📋 Mode 3: Multi-Record-Type Files (OMRQ Example)

### Files Needed:
- Input data file: `input/omrq.bcs.20250405101502.txt`
- Record type config: `input/OMRQ_RecordType_Config.csv`
- Header mapping: `input/OMRQ_Header_FixedLength_Mapping.csv`
- Line mapping: `input/OMRQ_Line_FixedLength_Mapping.csv`
- Detail mapping: `input/OMRQ_Detail_FixedLength_Mapping.csv`
- Comment mapping: `input/OMRQ_Comment_FixedLength_Mapping.csv`

### Record Type Config Format:
```csv
Record Type,Type Indicator Position,Type Indicator Value,Mapping File,Parent Record Type,Output Name
Header,1,H,OMRQ_Header_FixedLength_Mapping.csv,,Headers
Line,1,L,OMRQ_Line_FixedLength_Mapping.csv,Header,LineItems
Detail,1,D,OMRQ_Detail_FixedLength_Mapping.csv,Line,Details
Comment,1,C,OMRQ_Comment_FixedLength_Mapping.csv,Header,Comments
```

### Steps:
1. Open `JavaScript_Mapper.html` in browser
2. **File Type**: Select "Fixed-Length"
3. **Select Input Data File**: Choose `omrq.bcs.20250405101502.txt`
4. **Multi-Record-Type File**: CHECK this box ✅
5. **Record Type Configuration CSV**: Choose `OMRQ_RecordType_Config.csv`
6. Click **"Preview Files"**
7. **File Selection Dialog**: Select ALL 4 mapping files:
   - `OMRQ_Header_FixedLength_Mapping.csv`
   - `OMRQ_Line_FixedLength_Mapping.csv`
   - `OMRQ_Detail_FixedLength_Mapping.csv`
   - `OMRQ_Comment_FixedLength_Mapping.csv`
8. Review preview showing records grouped by type
9. Click **"Generate Mapper JS + Output CSV"**
10. Download JavaScript mapper and hierarchical JSON output

### Output Format:
The multi-record-type mode generates hierarchical JSON with parent-child relationships:
```json
[
  {
    "type": "Header",
    "data": { "Company": "0001", "Req Number": "1234567", ... },
    "children": {
      "LineItems": [
        {
          "type": "Line",
          "data": { "Item Number": "ABC123", ... },
          "children": {
            "Details": [ ... ]
          }
        }
      ],
      "Comments": [ ... ]
    }
  }
]
```

---

## 🔄 Reset Button

The Reset button now properly resets ALL controls:
- File type back to "Delimited"
- All file inputs cleared
- Multi-record-type checkbox unchecked
- Multi-record-type config panel hidden
- All preview sections cleared
- All internal variables reset

---

## 📁 File Locations

### Templates:
- `input/FixedLength_Mapping_Template.csv` - Blank fixed-length mapping template
- `input/RecordType_Config_Template.csv` - Blank record type config template

### OMRQ Example Files:
- `input/omrq.bcs.20250405101502.txt` - Sample data file
- `input/OMRQ_RecordType_Config.csv` - Record type configuration
- `input/OMRQ_Header_FixedLength_Mapping.csv` - Header record mapping (53 fields)
- `input/OMRQ_Line_FixedLength_Mapping.csv` - Line record mapping (10 fields)
- `input/OMRQ_Detail_FixedLength_Mapping.csv` - Detail record mapping (6 fields)
- `input/OMRQ_Comment_FixedLength_Mapping.csv` - Comment record mapping (5 fields)

### Documentation:
- `docs/multi-record-type-guide.md` - Detailed multi-record-type documentation
- `ALL_FIXED.md` - Summary of all fixes applied
- `FINAL_STATUS.md` - Final status report

---

## 🎨 UI Features

### Tabs:
1. **JS Generator** - Main transformation interface
2. **Mapping Table Converter** - Work in progress
3. **Reference** - Function library with examples

### Visual Indicators:
- File type toggle shows/hides relevant controls
- Multi-record-type checkbox enables config panel
- Preview button validates files before generation
- Generate button only enabled after successful preview
- Download buttons appear after successful generation

---

## ⚠️ Common Issues

### Issue: "Please select both files"
**Solution**: Ensure you've selected both the data file and mapping file(s)

### Issue: Multi-record-type preview doesn't work
**Solution**: Make sure you:
1. Checked the "Multi-Record-Type File" checkbox
2. Selected the record type config file
3. Selected ALL mapping files when prompted

### Issue: Reset button doesn't clear everything
**Solution**: This has been fixed. Reset now clears all controls including file type.

### Issue: Preview shows "Work In Progress"
**Solution**: This has been fixed. Fixed-length mode now shows proper UI.

---

## 🚀 Quick Start Examples

### Example 1: Simple CSV Transformation
```
1. File Type: Delimited
2. Data: test/Cerner_GL_04082025BLU2.csv
3. Mapping: test/CernerGL_Mapping.csv
4. Delimiter: Comma
5. Preview → Generate
```

### Example 2: Fixed-Length Single Mapping
```
1. File Type: Fixed-Length
2. Data: input/NH-TREASURY-DEPT-UC-YB-O.250813030526.txt
3. Mapping: input/BOA_CashRecon_FixedLength_Mapping.csv
4. Multi-Record-Type: Unchecked
5. Preview → Generate
```

### Example 3: Multi-Record-Type (OMRQ)
```
1. File Type: Fixed-Length
2. Data: input/omrq.bcs.20250405101502.txt
3. Multi-Record-Type: Checked ✅
4. Config: input/OMRQ_RecordType_Config.csv
5. Preview → Select all 4 mapping files
6. Generate → Download JSON
```

---

## 📊 Status: FULLY FUNCTIONAL ✅

All features are working:
- ✅ Delimited file support
- ✅ Fixed-length single mapping
- ✅ Multi-record-type with hierarchical output
- ✅ Preview functionality
- ✅ Reset button
- ✅ Generate and download
- ✅ All UI controls

---

## 🎓 Next Steps

1. Test with your own data files
2. Create custom mapping configurations
3. Use templates for new file formats
4. Integrate generated JavaScript into your workflows
5. Explore the Reference tab for available functions

---

## 📞 Support

For issues or questions:
1. Check `docs/troubleshooting.md`
2. Review `docs/multi-record-type-guide.md`
3. See function reference in the Reference tab
4. Check `ALL_FIXED.md` for recent fixes
