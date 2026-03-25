// Multi-Record Fixed-Length Self-Contained Static Mapper
// Generated: 2026-03-25
// Source: GL_FELA_20210504_Test.txt
// Mapping: SEPTA_GEACGL_MultiRecord_Mapping.csv
//
// This mapper has all record type detection and field extraction rules hardcoded.
// No external mapping file is needed at runtime.

var incrementCounter = 0;

// ============================================================================
// CSV Parser
// ============================================================================
function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  });
}

// ============================================================================
// Escape Regex Helper
// ============================================================================
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Per-Record-Type Headers
// ============================================================================
var headerHeaders = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number', 'Data Type Code', 'Batch Total', 'Closed For Adjustment', 'Effective Date'];
var detailHeaders = ['Transaction Code', 'Item', 'Trans ID', 'DRCR Code', 'Company ID', 'Account', 'Mgmt Center', 'Cost Center', 'Source Code', 'Source Date', 'Effective Date', 'Amount', 'Description', 'Fund Serial'];
var trailerHeaders = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number', 'Data Type Code', 'Batch Total'];

// ============================================================================
// Record Type Detection
// ============================================================================
function detectRecordType(line) {
  var indicator = line.substring(0, 2);
  // Exact matches first (PT and BT)
  if (indicator === 'PT') return 'Detail';
  if (indicator === 'BT') return 'Trailer';
  // First-character fallback for Header (config says BH but data has B1, B3, etc.)
  if (line.charAt(0) === 'B') return 'Header';
  return null;
}

// ============================================================================
// Header Extraction (pos 1-34, 8 fields)
// ============================================================================
function mapHeader(line, rowIndex) {
  var record = {};

  // Transaction Code: pos 1-2, Left justify, pad=' ', default='BH'
  var v = line.substring(0, 2).replace(/ +$/, '');
  if (v === '') v = 'BH';
  record['Transaction Code'] = v;

  // Company ID: pos 3-6, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(2, 6).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company ID'] = v;

  // Application Area: pos 7-8, Left justify, pad=' '
  v = line.substring(6, 8).replace(/ +$/, '');
  record['Application Area'] = v;

  // Batch Number: pos 9-10, Right justify, pad='0', default='01'
  v = line.substring(8, 10).replace(/^0+/, '');
  if (v === '') v = '01';
  record['Batch Number'] = v;

  // Data Type Code: pos 11, Left justify, pad=' ', default='2'
  v = line.substring(10, 11).replace(/ +$/, '');
  if (v === '') v = '2';
  record['Data Type Code'] = v;

  // Batch Total: pos 12-25, Right justify, pad='0', default='0'
  v = line.substring(11, Math.min(25, line.length)).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Batch Total'] = v;

  // Closed For Adjustment: pos 26, Left justify, pad=' ', default='0'
  v = (line.length >= 26) ? line.substring(25, 26).replace(/ +$/, '') : '';
  if (v === '') v = '0';
  record['Closed For Adjustment'] = v;

  // Effective Date: pos 27-34, Left justify, pad='0'
  v = (line.length >= 27) ? line.substring(26, Math.min(34, line.length)).replace(/0+$/, '') : '';
  record['Effective Date'] = v;

  // Validate required fields
  var requiredFields = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Header at line ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Detail Extraction (pos 1-138, 14 fields)
// ============================================================================
function mapDetail(line, rowIndex) {
  var record = {};

  // Transaction Code: pos 1-2, Left justify, pad=' ', default='PT'
  var v = line.substring(0, 2).replace(/ +$/, '');
  if (v === '') v = 'PT';
  record['Transaction Code'] = v;

  // Item: pos 3-6, Right justify, pad='0', default='0000', logic=RemoveLeadingZeroes (not in mapping but default applies)
  v = line.substring(2, 6).replace(/^0+/, '');
  if (v === '') v = '0000';
  record['Item'] = v;

  // Trans ID: pos 7, Left justify, pad=' ', default='1'
  v = line.substring(6, 7).replace(/ +$/, '');
  if (v === '') v = '1';
  record['Trans ID'] = v;

  // DRCR Code: pos 8-9, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(7, 9).replace(/^0+/, '');
  if (v === '') v = '0';
  record['DRCR Code'] = v;

  // Company ID: pos 10-13, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(9, 13).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company ID'] = v;

  // Account: pos 26-31, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(25, 31).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Account'] = v;

  // Mgmt Center: pos 35-39, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(34, 39).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Mgmt Center'] = v;

  // Cost Center: pos 40-43, Right justify, pad='0', default='0000', logic=RemoveLeadingZeroes
  v = line.substring(39, 43).replace(/^0+/, '');
  if (v === '') v = '0000';
  record['Cost Center'] = v;

  // Source Code: pos 44-47, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(43, 47).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Source Code'] = v;

  // Source Date: pos 48-53, Left justify, pad='0' (MMDDYY format)
  v = line.substring(47, 53).replace(/0+$/, '');
  record['Source Date'] = v;

  // Effective Date: pos 54-61, Left justify, pad='0' (MMDDYYYY format)
  v = line.substring(53, 61).replace(/0+$/, '');
  record['Effective Date'] = v;

  // Amount: pos 62-74, Right justify, pad='0', default='0' (GEAC overpunch preserved)
  v = line.substring(61, 74).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Amount'] = v;

  // Description: pos 75-129, Left justify, pad=' '
  v = (line.length >= 75) ? line.substring(74, Math.min(129, line.length)).replace(/ +$/, '') : '';
  record['Description'] = v;

  // Fund Serial: pos 130-138, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = (line.length >= 130) ? line.substring(129, Math.min(138, line.length)).replace(/^0+/, '') : '';
  v = v.trim();
  if (v !== '') {
    v = v.replace(/^0+/, '') || '0';
  }
  record['Fund Serial'] = v;

  // Validate required fields
  var requiredFields = ['Transaction Code', 'Item', 'DRCR Code', 'Company ID', 'Account', 'Mgmt Center', 'Source Code', 'Amount'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Detail at line ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Trailer Extraction (pos 1-25, 6 fields)
// ============================================================================
function mapTrailer(line, rowIndex) {
  var record = {};

  // Transaction Code: pos 1-2, Left justify, pad=' ', default='BT'
  var v = line.substring(0, 2).replace(/ +$/, '');
  if (v === '') v = 'BT';
  record['Transaction Code'] = v;

  // Company ID: pos 3-6, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(2, 6).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company ID'] = v;

  // Application Area: pos 7-8, Left justify, pad=' '
  v = line.substring(6, Math.min(8, line.length)).replace(/ +$/, '');
  record['Application Area'] = v;

  // Batch Number: pos 9-10, Right justify, pad='0', default='01'
  v = (line.length >= 9) ? line.substring(8, Math.min(10, line.length)).replace(/^0+/, '') : '';
  if (v === '') v = '01';
  record['Batch Number'] = v;

  // Data Type Code: pos 11, Left justify, pad=' ', default='2'
  v = (line.length >= 11) ? line.substring(10, 11).replace(/ +$/, '') : '';
  if (v === '') v = '2';
  record['Data Type Code'] = v;

  // Batch Total: pos 12-25, Right justify, pad='0', default='0'
  v = (line.length >= 12) ? line.substring(11, Math.min(25, line.length)).replace(/^0+/, '') : '';
  if (v === '') v = '0';
  record['Batch Total'] = v;

  // Validate required fields
  var requiredFields = ['Transaction Code', 'Company ID'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Trailer at line ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Process Line Dispatcher
// ============================================================================
function processLine(line, rowIndex) {
  var type = detectRecordType(line);
  if (!type) {
    throw new Error('Unknown record type at line ' + (rowIndex + 1));
  }
  var data;
  if (type === 'Header') {
    data = mapHeader(line, rowIndex);
  } else if (type === 'Detail') {
    data = mapDetail(line, rowIndex);
  } else if (type === 'Trailer') {
    data = mapTrailer(line, rowIndex);
  }
  return { type: type, data: data };
}

// ============================================================================
// Fallback applyLogic for complex cases
// ============================================================================
function applyLogic(logic, value) {
  if (!logic) return value;
  logic = logic.trim();

  if (/^RemoveLeadingZeroes$/i.test(logic)) {
    return value.replace(/^0+/, '') || '0';
  }
  if (/^Trim$/i.test(logic)) {
    return value.trim();
  }
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }
  return value;
}

// ============================================================================
// IPA Usage Instructions
// ============================================================================
// Step 1: Split input data into lines
// var lines = readFile_inputData.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
//
// Step 2: Process each line
// var resultsByType = { Header: [], Detail: [], Trailer: [] };
// try {
//   lines.forEach(function(line, index) {
//     var result = processLine(line, index);
//     resultsByType[result.type].push(result.data);
//   });
// } catch (error) {
//   ErrorMessage = error.message;
// }
//
// Step 3: Convert to CSV per record type
// // Headers CSV
// var headerCSV = [headerHeaders.join(',')];
// resultsByType.Header.forEach(function(r) {
//   var row = headerHeaders.map(function(h) {
//     var v = r[h] != null ? r[h].toString() : '';
//     return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
//   });
//   headerCSV.push(row.join(','));
// });
// // Repeat for Detail (detailHeaders) and Trailer (trailerHeaders)
