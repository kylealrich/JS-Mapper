// Data Processing Script
var fs = require('fs');

// Load mapper core
var parseCSV = function(text, delimiter) {
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
};

var normalizeKey = function(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
};

var incrementCounter = 0;

var applyLogic = function(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();
  
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter;
  }
  
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }

  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0';
  }
  
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').trim();
  }
  
  if (/^Left\(/i.test(logic)) {
    var match = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').substring(0, parseInt(match[2]));
  }
  
  if (/^Right\(/i.test(logic)) {
    var match = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i);
    if (match) return (data[match[1]-1] || '').slice(-parseInt(match[2]));
  }
  
  if (/^If\s/i.test(logic)) {
    var simpleMatch = logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (simpleMatch) {
      var conditionRef = simpleMatch[1].trim();
      if (/Column(\d+)/i.test(conditionRef)) {
        var colNum = conditionRef.match(/Column(\d+)/i)[1];
        conditionRef = data[colNum - 1] || '';
      }
      var operator = simpleMatch[2];
      var compareValue = simpleMatch[3];
      var thenResult = simpleMatch[4];
      var elseResult = simpleMatch[5] || '';
      
      if (/Column(\d+)/i.test(thenResult)) {
        var colNum = thenResult.match(/Column(\d+)/i)[1];
        thenResult = data[colNum - 1] || '';
      }
      if (/Column(\d+)/i.test(elseResult)) {
        var colNum = elseResult.match(/Column(\d+)/i)[1];
        elseResult = data[colNum - 1] || '';
      }
      
      var condition = false;
      if (operator === '==' || operator === '=') condition = conditionRef == compareValue;
      else if (operator === '!=') condition = conditionRef != compareValue;
      
      return condition ? thenResult : elseResult;
    }
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
  
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }

  return null;
};

var createDynamicMapper = function(mappingData) {
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
      
      function safeGet(d, i, f, r) {
        if (i >= d.length) throw new Error('Column ' + (i + 1) + ' missing for "' + f + '"');
        return d[i] || '';
      }
      
      mappingRules.forEach(function(rule) {
        var value;
        
        if (rule.logic && rule.logic.trim()) {
          value = applyLogic(rule.logic, data, rule.field, rowIndex);
        } else if (rule.colNum !== null) {
          value = safeGet(data, rule.colNum, rule.field, rowIndex);
        } else {
          value = null;
        }
        
        record[rule.field] = value;
      });
      
      return record;
    },
    headers: headers
  };
};

// Read input files
var inputText = fs.readFileSync('input/CernerGLTrans_20251025.txt', 'utf8');
var mappingText = fs.readFileSync('input/CernerGL_MappingTable.csv', 'utf8');

// Parse mapping table
var mappingRows = parseCSV(mappingText, ',');
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
var allData = parseCSV(inputText, ',');
var inputData = allData.slice(0);

// Create mapper
var mapper = createDynamicMapper(parsedMappings);
var headers = mapper.headers;

// Transform data
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

// Write output
fs.writeFileSync('output/CernerGLTrans_20251025_mapped.csv', csvLines.join('\n'));
console.log('SUCCESS: Mapped CSV created with ' + results.length + ' records');
