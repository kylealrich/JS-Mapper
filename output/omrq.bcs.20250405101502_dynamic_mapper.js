// Multi-Record Fixed-Length Dynamic Mapper - Combined _CONFIG/_FIELD Format
// Generated: 2026-03-25
// Source: omrq.bcs.20250405101502.txt
// Mapping: OMRQ_MultiRecord_Mapping.csv
//
// This mapper dynamically interprets a combined _CONFIG/_FIELD mapping CSV at runtime.
// Supports multi-record-type fixed-length files with parent-child hierarchy.
// NOTE: Input file has no line breaks - records are concatenated at fixed 2330-char intervals.

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
// Key Normalizer
// ============================================================================
function normalizeKey(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

// ============================================================================
// Escape Regex Helper
// ============================================================================
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Detect Record Type
// ============================================================================
function detectRecordType(line, recordTypes) {
  var i, rt, pos, len, indicator;
  // First pass: exact match
  for (i = 0; i < recordTypes.length; i++) {
    rt = recordTypes[i];
    pos = parseInt(rt.indicatorPosition) - 1;
    len = parseInt(rt.indicatorLength);
    indicator = line.substring(pos, pos + len);
    if (indicator === rt.indicatorValue) {
      return rt;
    }
  }
  // Second pass: first-character fallback
  for (i = 0; i < recordTypes.length; i++) {
    rt = recordTypes[i];
    pos = parseInt(rt.indicatorPosition) - 1;
    if (line.charAt(pos) === rt.indicatorValue.charAt(0)) {
      return rt;
    }
  }
  return null;
}

// ============================================================================
// Extract Fixed-Length Fields
// ============================================================================
function extractFixedLengthFields(line, fields) {
  var record = {};
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var start = parseInt(f.start) - 1;
    var end = parseInt(f.end);
    var raw = line.substring(start, end);
    var value = raw;
    var justify = (f.justify || '').toLowerCase();
    var padChar = f.padCharacter || '';

    // Apply justify + pad character stripping
    if (padChar !== '') {
      var escapedPad = escapeRegex(padChar);
      if (justify === 'right') {
        // Right-justified: strip leading pad characters
        value = value.replace(new RegExp('^' + escapedPad + '+'), '');
      } else if (justify === 'left') {
        // Left-justified: strip trailing pad characters
        value = value.replace(new RegExp(escapedPad + '+$'), '');
      }
    } else {
      value = value.trim();
    }

    // Apply default value if empty
    if (value === '' && f.defaultValue) {
      value = f.defaultValue;
    }

    // Apply mapping logic if present
    if (f.mappingLogic && f.mappingLogic.trim()) {
      value = applyFixedLengthLogic(f.mappingLogic, value, line, fields, record);
    }

    // Required field validation
    if (f.required && (!value || !value.toString().trim())) {
      throw new Error('Required field "' + f.fieldName + '" is blank');
    }

    record[f.fieldName] = value;
  }
  return record;
}

// ============================================================================
// Apply Fixed-Length Logic
// ============================================================================
function applyFixedLengthLogic(logic, value, line, fields, record) {
  if (!logic) return value;
  logic = logic.trim();

  // RemoveLeadingZeroes
  if (/^RemoveLeadingZeroes$/i.test(logic)) {
    return value.replace(/^0+/, '') || '0';
  }

  // Trim
  if (/^Trim$/i.test(logic)) {
    return value.trim();
  }

  // Left(n)
  if (/^Left\((\d+)\)$/i.test(logic)) {
    var match = logic.match(/^Left\((\d+)\)$/i);
    return value.substring(0, parseInt(match[1]));
  }

  // Right(n)
  if (/^Right\((\d+)\)$/i.test(logic)) {
    var match = logic.match(/^Right\((\d+)\)$/i);
    return value.slice(-parseInt(match[1]));
  }

  // Uppercase
  if (/^Uppercase$/i.test(logic)) {
    return value.toUpperCase();
  }

  // Lowercase
  if (/^Lowercase$/i.test(logic)) {
    return value.toLowerCase();
  }

  // Hardcode
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }

  // Increment By 1
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter.toString();
  }

  // DateReformat
  if (/^DateReformat\(/i.test(logic)) {
    var match = logic.match(/DateReformat\('([^']*)',\s*'([^']*)'\)/i);
    if (match) {
      var inputFormat = match[1].toUpperCase();
      var outputFormat = match[2].toUpperCase();
      if (inputFormat === 'MMDDYY' && outputFormat === 'YYYYMMDD' && value.length === 6) {
        var mm = value.substring(0, 2);
        var dd = value.substring(2, 4);
        var yy = value.substring(4, 6);
        var year = parseInt(yy) > 50 ? '19' + yy : '20' + yy;
        return year + mm + dd;
      }
      if (inputFormat === 'YYYYMMDD' && outputFormat === 'MMDDYYYY' && value.length === 8) {
        return value.substring(4, 6) + value.substring(6, 8) + value.substring(0, 4);
      }
      if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD' && value.length === 8) {
        return value.substring(4, 8) + value.substring(0, 4);
      }
    }
    return value;
  }

  // Static values in quotes
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }

  return value;
}

// ============================================================================
// Create Mapper from Combined _CONFIG/_FIELD CSV
// ============================================================================
function createMapper(configCSV) {
  var rows = parseCSV(configCSV, ',');
  var headers = rows[0].map(normalizeKey);
  var recordTypes = [];
  var fieldsByType = {};

  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = (rows[i][j] || '').trim();
    }

    var rowType = obj['rowtype'] || '';

    if (rowType === '_CONFIG') {
      var rt = {
        name: obj['recordtype'] || '',
        indicatorPosition: obj['typeindicatorposition'] || '1',
        indicatorLength: obj['typeindicatorlength'] || '1',
        indicatorValue: obj['typeindicatorvalue'] || '',
        parentRecordType: obj['parentrecordtype'] || '',
        outputName: obj['outputname'] || obj['recordtype'] || ''
      };
      recordTypes.push(rt);
      fieldsByType[rt.name] = [];
    } else if (rowType === '_FIELD') {
      var recType = obj['recordtype'] || '';
      if (!fieldsByType[recType]) {
        fieldsByType[recType] = [];
      }
      fieldsByType[recType].push({
        fieldName: obj['fieldname'] || '',
        start: obj['start'] || '1',
        end: obj['end'] || '1',
        length: obj['length'] || '',
        required: (obj['required'] || '').toUpperCase() === 'Y',
        padCharacter: obj['padcharacter'] || '',
        justify: obj['justify'] || '',
        defaultValue: obj['defaultvalue'] || '',
        mappingLogic: obj['mappinglogic'] || '',
        description: obj['description'] || ''
      });
    }
  }

  // Build headers per record type
  var headersByType = {};
  for (var typeName in fieldsByType) {
    if (fieldsByType.hasOwnProperty(typeName)) {
      headersByType[typeName] = fieldsByType[typeName].map(function(f) { return f.fieldName; });
    }
  }

  return {
    recordTypes: recordTypes,
    fieldsByType: fieldsByType,
    headersByType: headersByType,
    processLine: function(line, rowIndex) {
      var rt = detectRecordType(line, recordTypes);
      if (!rt) {
        throw new Error('Unknown record type at line ' + (rowIndex + 1));
      }
      var fields = fieldsByType[rt.name] || [];
      var record = extractFixedLengthFields(line, fields);
      return { type: rt.name, outputName: rt.outputName, data: record };
    }
  };
}

// ============================================================================
// Split No-Linebreak Input into Fixed-Width Records
// ============================================================================
// The OMRQ input file has no line breaks. Records are concatenated at a fixed
// width of 2330 characters each (last record may be shorter).
// Use this helper to split the raw content into individual record strings.
function splitFixedWidthRecords(rawContent, recordWidth) {
  var records = [];
  var content = rawContent.replace(/\r?\n/g, '');
  var pos = 0;
  while (pos < content.length) {
    var len = Math.min(recordWidth, content.length - pos);
    records.push(content.substring(pos, pos + len));
    pos += recordWidth;
  }
  return records;
}

// ============================================================================
// IPA Usage Instructions
// ============================================================================
// Step 1: Create mapper from combined _CONFIG/_FIELD mapping CSV
// var mapper = createMapper(readFile_mappingCSV);
//
// Step 2: Split input data into records (no line breaks in this file)
// var lines = splitFixedWidthRecords(readFile_inputData, 2330);
//
// Step 3: Process each record with error handling
// var resultsByType = {};
// try {
//   lines.forEach(function(line, index) {
//     var result = mapper.processLine(line, index);
//     if (!resultsByType[result.type]) {
//       resultsByType[result.type] = { outputName: result.outputName, rows: [] };
//     }
//     resultsByType[result.type].rows.push(result.data);
//   });
// } catch (error) {
//   ErrorMessage = error.message;
// }
//
// Step 4: Convert to CSV per record type
// for (var typeName in resultsByType) {
//   var typeData = resultsByType[typeName];
//   var typeHeaders = mapper.headersByType[typeName];
//   var csvLines = [typeHeaders.join(',')];
//   typeData.rows.forEach(function(r) {
//     var row = typeHeaders.map(function(h) {
//       var v = r[h] != null ? r[h].toString() : '';
//       return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
//     });
//     csvLines.push(row.join(','));
//   });
//   // Output CSV: omrq.bcs.20250405101502_{typeData.outputName}_Mapped.csv
//   var outputCSV = csvLines.join('\n');
// }
