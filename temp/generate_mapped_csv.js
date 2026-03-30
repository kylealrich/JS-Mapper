var fs = require('fs');

var inputText = fs.readFileSync('input/CernerGLTrans.txt', 'utf8');
var mappingText = fs.readFileSync('input/CernerGL_MappingTable.csv', 'utf8');

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

// Parse mapping table
var mappingRows = parseCSV(mappingText, ',');
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

var incrementCounter = 0;

function applyLogic(logic, data, field) {
  if (!logic) return null;
  logic = logic.trim();

  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0';
  }
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Trim\(Column(\d+)\)/i);
    if (col) {
      var value = data[col[1]-1];
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    }
  }
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(0, parseInt(match[2]));
  }
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').slice(-parseInt(match[2]));
  }
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter;
  }
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
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
      return condition ? thenResult : elseResult;
    }
  }
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }
  return null;
}

// Parse input data
var inputData = parseCSV(inputText, ',');
var dataRows = inputData.slice(0); // Skip 0 rows

// Transform data
var results = [];
var errors = [];
for (var r = 0; r < dataRows.length; r++) {
  try {
    var data = dataRows[r];
    var record = {};
    for (var m = 0; m < mappingRules.length; m++) {
      var rule = mappingRules[m];
      var value;
      if (rule.logic && rule.logic.trim()) {
        value = applyLogic(rule.logic, data, rule.field);
      } else if (rule.colNum !== null) {
        value = data[rule.colNum] || '';
      } else {
        value = null;
      }
      record[rule.field] = value;
      if (rule.required && (!value || !value.toString().trim())) {
        throw new Error('Required field "' + rule.field + '" is blank in row ' + (r + 1));
      }
    }
    results.push(record);
  } catch (e) {
    errors.push('Row ' + (r + 1) + ': ' + e.message);
  }
}

// Build CSV output
var csvLines = [headers.join(',')];
results.forEach(function(rec) {
  var row = headers.map(function(h) {
    var v = rec[h] != null ? rec[h].toString() : '';
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  });
  csvLines.push(row.join(','));
});

fs.writeFileSync('output/CernerGLTrans_Mapped.csv', csvLines.join('\n'), 'utf8');
console.log('Mapped CSV generated: ' + results.length + ' rows processed, ' + errors.length + ' errors');
if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(function(e) { console.log('  ' + e); });
}
