/**
 * CernerGL Runtime Flexible Mapper
 * Generated: 2026-03-05
 * Input: CernerGLTrans_20251025.txt (Comma delimited, 0 rows skipped)
 * Mapping: CernerGL_MappingTable.csv
 * Type: Runtime Flexible - dynamically interprets mapping rules at runtime
 */

var fs = require('fs');
var path = require('path');

// ============================================================
// CSV Parser - handles quoted fields, escaped characters
// ============================================================
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

// ============================================================
// Normalize mapping table header keys
// ============================================================
function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ============================================================
// Increment counter (global state for Increment By 1)
// ============================================================
var incrementCounter = 0;

// ============================================================
// Apply transformation logic dynamically
// ============================================================
function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();

  // Increment By 1
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter;
  }

  // Hardcode 'value'
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }

  // RemoveLeadingZeroes(ColumnN)
  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').replace(/^0+/, '') || '0';
  }

  // Trim(ColumnN)
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').trim();
  }

  // Concat(Column1, Column2, ...)
  if (/^Concat\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return cols.map(function(c) { var n = c.match(/\d+/)[0]; return data[n - 1] || ''; }).join('');
  }

  // Sum(Column1, Column2, ...)
  if (/^Sum\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) {
      var sum = 0;
      cols.forEach(function(c) {
        var n = c.match(/\d+/)[0];
        var val = data[n - 1] || '0';
        if (!/^-?\d*\.?\d+$/.test(val.toString().trim())) throw new Error('Non-numeric value in Sum: ' + val);
        sum += parseFloat(val);
      });
      return sum;
    }
  }

  // Uppercase(ColumnN)
  if (/^Uppercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').toUpperCase();
  }

  // Lowercase(ColumnN)
  if (/^Lowercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1] - 1] || '').toLowerCase();
  }

  // Left(ColumnN, length)
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1] - 1] || '').substring(0, parseInt(match[2]));
  }

  // Right(ColumnN, length)
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1] - 1] || '').slice(-parseInt(match[2]));
  }

  // DateReformat(ColumnN, 'input', 'output')
  if (/^DateReformat\(/i.test(logic)) {
    var match = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) {
      var dateStr = (data[match[1] - 1] || '').trim();
      var inputFormat = match[2].toUpperCase();
      var outputFormat = match[3].toUpperCase();
      if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      return dateStr;
    }
  }

  // Today()
  if (/^Today\(/i.test(logic)) {
    var today = new Date();
    function pad(n) { return n < 10 ? '0' + n : n; }
    var fmtMatch = logic.match(/Today\('([^']*)'\)/i);
    if (fmtMatch) {
      var format = fmtMatch[1].toUpperCase();
      if (format === 'YYYYMMDD') return today.getFullYear() + '' + pad(today.getMonth() + 1) + pad(today.getDate());
      if (format === 'YYYY-MM-DD') return today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
      if (format === 'MM/DD/YYYY') return pad(today.getMonth() + 1) + '/' + pad(today.getDate()) + '/' + today.getFullYear();
    }
    return today.toLocaleDateString('en-US');
  }

  // Now()
  if (/^Now\(/i.test(logic)) {
    return new Date().toLocaleString('en-US');
  }

  // Conditional: If ... Then ... Else ...
  if (/^If\s/i.test(logic)) {
    var simpleMatch = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (simpleMatch) {
      var conditionRef = simpleMatch[1].trim();
      if (/Column(\d+)/i.test(conditionRef)) {
        var colNum = conditionRef.match(/Column(\d+)/i)[1];
        conditionRef = (data[colNum - 1] || '').trim();
      }
      var operator = simpleMatch[2];
      var compareValue = simpleMatch[3];
      var thenResult = simpleMatch[4];
      var elseResult = simpleMatch[5] || '';

      if (/Column(\d+)/i.test(thenResult)) {
        var cn = thenResult.match(/Column(\d+)/i)[1];
        thenResult = (data[cn - 1] || '').trim();
      }
      if (/Column(\d+)/i.test(elseResult)) {
        var cn = elseResult.match(/Column(\d+)/i)[1];
        elseResult = (data[cn - 1] || '').trim();
      }

      var condition = false;
      if (operator === '==' || operator === '=') condition = conditionRef == compareValue;
      else if (operator === '!=') condition = conditionRef != compareValue;
      else if (operator === '>') condition = parseFloat(conditionRef) > parseFloat(compareValue);
      else if (operator === '<') condition = parseFloat(conditionRef) < parseFloat(compareValue);
      else if (operator === '>=') condition = parseFloat(conditionRef) >= parseFloat(compareValue);
      else if (operator === '<=') condition = parseFloat(conditionRef) <= parseFloat(compareValue);

      return condition ? thenResult : elseResult;
    }
  }

  // Static quoted values
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }

  // Column reference
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return (data[colMatch[1] - 1] || '').trim();
  }

  // Fallback for unrecognized static text
  if (!/Column\d+/i.test(logic) && !/^(RemoveLeadingZeroes|Trim|Concat|Sum|If|Today|Now|Increment|DateReformat|Left|Right)/i.test(logic)) {
    return logic;
  }

  return null;
}

// ============================================================
// Create dynamic mapper from parsed mapping configuration
// ============================================================
function createDynamicMapper(mappingData) {
  var mappingRules = [];
  var headers = [];

  incrementCounter = 0;

  mappingData.forEach(function(m) {
    var field = m['targetfieldname'] || '';
    if (!field) return;
    var logic = m['mappinglogic'] || '';
    var colNum = m['inputcolumnnumber'] || '';
    var required = (m['required'] || '').toUpperCase() === 'Y';

    mappingRules.push({
      field: field,
      logic: logic,
      colNum: colNum ? parseInt(colNum) - 1 : null,
      required: required
    });
    headers.push(field);
  });

  return {
    mapRecord: function(data, rowIndex) {
      var record = {};

      function safeGet(d, i, f) {
        if (i >= d.length) throw new Error('Column ' + (i + 1) + ' missing for "' + f + '"');
        return d[i] || '';
      }

      mappingRules.forEach(function(rule) {
        var value;
        if (rule.logic && rule.logic.trim()) {
          value = applyLogic(rule.logic, data, rule.field, rowIndex);
        } else if (rule.colNum !== null) {
          value = safeGet(data, rule.colNum, rule.field);
        } else {
          value = null;
        }
        record[rule.field] = value;
      });

      return record;
    },
    headers: headers
  };
}

// ============================================================
// Main transformation pipeline
// ============================================================
function transformData(inputText, mappingTableText, delimiter, skipRows) {
  try {
    // Parse mapping table
    var mappingRows = parseCSV(mappingTableText, ',');
    var mappingHeaders = mappingRows[0].map(normalizeKey);
    var parsedMappings = [];

    for (var i = 1; i < mappingRows.length; i++) {
      var obj = {};
      for (var j = 0; j < mappingHeaders.length; j++) {
        obj[mappingHeaders[j]] = (mappingRows[i][j] || '').trim();
      }
      parsedMappings.push(obj);
    }

    // Parse input data
    var allData = parseCSV(inputText, delimiter);
    var inputData = allData.slice(skipRows || 0);

    // Create dynamic mapper
    var mapper = createDynamicMapper(parsedMappings);
    var headers = mapper.headers;

    // Transform all rows
    var results = inputData.map(function(row, index) {
      return mapper.mapRecord(row, index);
    });

    // Generate CSV output
    var csvLines = [headers.join(',')];
    results.forEach(function(r) {
      var row = headers.map(function(h) {
        var v = r[h] != null ? r[h].toString() : '';
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      });
      csvLines.push(row.join(','));
    });

    return {
      success: true,
      csvOutput: csvLines.join('\n'),
      rowCount: results.length,
      headers: headers,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      csvOutput: null,
      rowCount: 0,
      headers: null,
      error: error.message
    };
  }
}

// ============================================================
// Execute: Read files, transform, write output
// ============================================================
var scriptDir = path.dirname(process.argv[1]);
var rootDir = path.resolve(scriptDir, '..');

var inputFile = path.join(rootDir, 'input', 'CernerGLTrans_20251025.txt');
var mappingFile = path.join(rootDir, 'input', 'CernerGL_MappingTable.csv');
var outputFile = path.join(rootDir, 'output', 'CernerGL_Output.csv');

var inputText = fs.readFileSync(inputFile, 'utf8');
var mappingText = fs.readFileSync(mappingFile, 'utf8');

var result = transformData(inputText, mappingText, ',', 0);

if (result.success) {
  fs.writeFileSync(outputFile, result.csvOutput, 'utf8');
  console.log('Transformation complete: ' + result.rowCount + ' rows processed.');
  console.log('Output written to: ' + outputFile);
} else {
  console.error('Transformation failed: ' + result.error);
  process.exit(1);
}

// Module exports for IPA integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    normalizeKey: normalizeKey,
    applyLogic: applyLogic,
    createDynamicMapper: createDynamicMapper,
    transformData: transformData
  };
}
