// Universal Dynamic Mapper - Works with any mapping table
// Generated: 2026-03-25
// Source: CernerGLTrans.txt
// Mapping: CernerGL_MappingTable.csv
var incrementCounter = 0;

function createMapper(MappingTable) {
  var mappingRows = parseCSV(MappingTable, ',');
  var mappingHeaders = mappingRows[0].map(function(h) { return h.replace(/\s+/g, '').trim().toLowerCase(); });
  var mappingRules = [];
  var headers = [];

  for (var i = 1; i < mappingRows.length; i++) {
    var obj = {};
    for (var j = 0; j < mappingHeaders.length; j++) {
      obj[mappingHeaders[j]] = (mappingRows[i][j] || '').trim();
    }
    var field = obj['targetfieldname'] || '';
    if (!field) continue;
    mappingRules.push({
      field: field,
      logic: obj['mappinglogic'] || '',
      colNum: obj['inputcolumnnumber'] ? parseInt(obj['inputcolumnnumber']) - 1 : null,
      required: (obj['required'] || '').toUpperCase() === 'Y'
    });
    headers.push(field);
  }

  return {
    mapRecord: function(data, rowIndex) {
      var record = {};
      function safeGet(d, i, f, r) { if (i >= d.length) throw new Error('Column ' + (i + 1) + ' missing for "' + f + '"'); return d[i] || ''; }

      mappingRules.forEach(function(rule) {
        var value;
        if (rule.logic && rule.logic.trim()) {
          value = applyLogic(rule.logic, data, rule.field);
        } else if (rule.colNum !== null) {
          value = safeGet(data, rule.colNum, rule.field, rowIndex);
        } else {
          value = null;
        }
        record[rule.field] = value;
        if (rule.required && (!value || !value.toString().trim())) {
          throw new Error('Required field "' + rule.field + '" is blank in row ' + (rowIndex + 1));
        }
      });
      return record;
    },
    headers: headers
  };
}

function applyLogic(logic, data, field) {
  if (!logic) return null;
  logic = logic.trim();

  // String Functions
  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0';
  }
  if (/^RemoveTrailingSpaces\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/\s+$/, '');
  }
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Trim\(Column(\d+)\)/i);
    if (col) {
      var value = data[col[1]-1];
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    }
  }
  if (/^Concat\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return cols.map(function(c) { var n = c.match(/\d+/)[0]; return data[n-1] || ''; }).join('');
  }
  if (/^Substring\(/i.test(logic)) {
    var match = logic.match(/Substring\(Column(\d+),\s*(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(parseInt(match[2]), parseInt(match[2]) + parseInt(match[3]));
  }
  if (/^Uppercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').toUpperCase();
  }
  if (/^Lowercase\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').toLowerCase();
  }
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(0, parseInt(match[2]));
  }
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').slice(-parseInt(match[2]));
  }
  if (/^Replace\(/i.test(logic)) {
    var match = logic.match(/Replace\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) return (data[match[1]-1] || '').replace(new RegExp(match[2], 'g'), match[3]);
  }
  if (/^PadLeft\(/i.test(logic)) {
    var match = logic.match(/PadLeft\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i);
    if (match) { var str = data[match[1]-1] || ''; while (str.length < parseInt(match[2])) str = match[3] + str; return str; }
  }
  if (/^PadRight\(/i.test(logic)) {
    var match = logic.match(/PadRight\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i);
    if (match) { var str = data[match[1]-1] || ''; while (str.length < parseInt(match[2])) str = str + match[3]; return str; }
  }
  if (/^AddLeft\(/i.test(logic)) {
    var match = logic.match(/AddLeft\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (match) { var prefix = ''; for (var i = 0; i < parseInt(match[3]); i++) prefix += match[2]; return prefix + (data[match[1]-1] || ''); }
  }
  if (/^AddRight\(/i.test(logic)) {
    var match = logic.match(/AddRight\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (match) { var suffix = ''; for (var i = 0; i < parseInt(match[3]); i++) suffix += match[2]; return (data[match[1]-1] || '') + suffix; }
  }
  if (/^Split\(/i.test(logic)) {
    var match = logic.match(/Split\(Column(\d+),\s*'([^']*)',\s*(\d+)\)/i);
    if (match) {
      var value = data[match[1]-1] || '';
      var delimiter = match[2];
      var index = parseInt(match[3]) - 1;
      var parts = value.split(delimiter);
      return parts[index] || '';
    }
  }

  // Math Functions
  if (/^Sum\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) {
      var sum = 0;
      cols.forEach(function(col) {
        var n = col.match(/\d+/)[0];
        var val = data[n - 1] || '0';
        if (!/^-?\d*\.?\d+$/.test(val.toString().trim())) throw new Error('Non-numeric value in Sum: ' + val);
        sum += parseFloat(val);
      });
      return sum;
    }
  }
  if (/^Multiply\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols && cols.length >= 2) {
      var result = 1;
      cols.forEach(function(col) {
        var n = col.match(/\d+/)[0];
        result *= parseFloat(data[n - 1] || 0);
      });
      return result;
    }
  }
  if (/^Divide\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols && cols.length >= 2) {
      var n1 = cols[0].match(/\d+/)[0];
      var n2 = cols[1].match(/\d+/)[0];
      var divisor = parseFloat(data[n2 - 1]);
      return divisor !== 0 ? parseFloat(data[n1 - 1] || 0) / divisor : 0;
    }
  }
  if (/^Round\(/i.test(logic)) {
    var match = logic.match(/Round\(Column(\d+),\s*(\d+)\)/i);
    if (match) return Math.round(parseFloat(data[match[1]-1] || 0) * Math.pow(10, parseInt(match[2]))) / Math.pow(10, parseInt(match[2]));
  }
  if (/^Abs\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return Math.abs(parseFloat(data[col[1]-1] || 0));
  }
  if (/^Max\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return Math.max.apply(Math, cols.map(function(c) { var n = c.match(/\d+/)[0]; return parseFloat(data[n-1] || 0); }));
  }
  if (/^Min\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return Math.min.apply(Math, cols.map(function(c) { var n = c.match(/\d+/)[0]; return parseFloat(data[n-1] || 0); }));
  }

  // Increment By 1 functionality
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter;
  }

  // Hardcode functionality
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }

  // Date Functions
  if (/^Today\(\)$/i.test(logic)) {
    return new Date().toLocaleDateString('en-US');
  }
  if (/^Now\(\)$/i.test(logic)) {
    return new Date().toLocaleString('en-US');
  }
  if (/^DateReformat\(/i.test(logic)) {
    var match = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (match) {
      var dateStr = data[match[1]-1] || '';
      var inputFormat = match[2].toUpperCase();
      var outputFormat = match[3].toUpperCase();
      if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD' && dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
      return dateStr;
    }
  }

  // Conditional Logic
  if (/^If\s/i.test(logic)) {
    var simpleMatch = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+ElseIf\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?)*(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (simpleMatch) {
      var conditionRef = simpleMatch[1].trim().replace(/Column(\d+)/gi, function(_, n) { return data[n - 1] || ''; });
      var operator = simpleMatch[2];
      var compareValue = simpleMatch[3];
      var thenResult = simpleMatch[4].replace(/Column(\d+)/gi, function(_, n) { return data[n - 1] || ''; });
      var elseResult = simpleMatch[9] ? simpleMatch[9].replace(/Column(\d+)/gi, function(_, n) { return data[n - 1] || ''; }) : '';

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

  // Validation Functions
  if (/^IsEmpty\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (!data[col[1]-1] || data[col[1]-1].toString().trim() === '') ? 'true' : 'false';
  }
  if (/^IsNumeric\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return /^-?\d*\.?\d+$/.test((data[col[1]-1] || '').toString().trim()) ? 'true' : 'false';
  }

  // Static values
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }

  // Handle unquoted static values (but not function names)
  if (!/Column\d+/i.test(logic) && !/^(RemoveLeadingZeroes|RemoveTrailingSpaces|Trim|Concat|Substring|Uppercase|Lowercase|Left|Right|Replace|PadLeft|PadRight|AddLeft|AddRight|Split|Sum|Multiply|Divide|Round|Abs|Max|Min|If|Today|Now|Increment|DateReformat|Hardcode|IsEmpty|IsNumeric)/i.test(logic)) {
    return logic;
  }

  // Column references
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }

  return null;
}

// Parse input file data:
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


// Helper Functions for IPA:

// IPA Usage - Copy all functions above, then use:
// Step 1: Create mapper from mapping table
// var mapper = createMapper(readFile_mappingTable);

// Step 2: Parse and process input data
// var inputData = parseCSV(readFile_inputData, ',');
// var dataRows = inputData.slice(0); // Skip 0 rows

// Step 3: Transform data with error handling
// try {
//   var results = dataRows.map(function(row, index) {
//     return mapper.mapRecord(row, index);
//   });
// } catch (error) {
//   ErrorMessage = error.message;
//   results = [];
// }

// Step 4: Convert to CSV format
// var csvLines = [mapper.headers.join(',')];
// results.forEach(function(r) {
//   var row = mapper.headers.map(function(h) {
//     var v = r[h] != null ? r[h].toString() : '';
//     return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
//   });
//   csvLines.push(row.join(','));
// });
// var outputCSV = csvLines.join('\n');
