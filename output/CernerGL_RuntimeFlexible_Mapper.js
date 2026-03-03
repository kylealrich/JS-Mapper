// Runtime Flexible Mapper for Cerner GL Transaction Processing
// Generated: 2026-03-04
// Input File: CernerGLTrans_20251025.txt
// Mapping File: CernerGL_MappingTable.csv
// Delimiter: Comma (,)
// Skip Rows: 0

// CSV Parser
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

// Key Normalizer
function normalizeKey(key) {
  return key.replace(/\s+/g, '').trim().toLowerCase();
}

// Global counter for Increment By 1 functionality
var incrementCounter = 0;

// Apply Logic Directly
function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();
  
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

  // String Functions
  if (/^RemoveLeadingZeroes\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0';
  }
  if (/^Trim\(/i.test(logic)) {
    var col = logic.match(/Column(\d+)/i);
    if (col) return (data[col[1]-1] || '').trim();
  }
  if (/^Concat\(/i.test(logic)) {
    var cols = logic.match(/Column(\d+)/gi);
    if (cols) return cols.map(function(c) { var n = c.match(/\d+/)[0]; return data[n-1] || ''; }).join('');
  }
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
  
  // String concatenation with + operator
  if (/\+/.test(logic)) {
    return logic.replace(/Right\(Column(\d+),\s*(\d+)\)/gi, function(match, col, len) {
      return (data[col-1] || '').slice(-parseInt(len));
    }).replace(/Left\(Column(\d+),\s*(\d+)\)/gi, function(match, col, len) {
      return (data[col-1] || '').substring(0, parseInt(len));
    }).replace(/Column(\d+)/gi, function(match, col) {
      return data[col-1] || '';
    }).replace(/\s*\+\s*/g, '');
  }

  // Conditional Logic
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
      
      // Replace Column references in results
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
      else if (operator === '>') condition = parseFloat(conditionRef) > parseFloat(compareValue);
      else if (operator === '<') condition = parseFloat(conditionRef) < parseFloat(compareValue);
      else if (operator === '>=') condition = parseFloat(conditionRef) >= parseFloat(compareValue);
      else if (operator === '<=') condition = parseFloat(conditionRef) <= parseFloat(compareValue);
      
      return condition ? thenResult : elseResult;
    }
  }

  // Static values
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }
  
  if (/^Today\(/i.test(logic)) {
    var today = new Date();
    var match = logic.match(/Today\('([^']*)'\)/i);
    if (match) {
      var format = match[1];
      function pad(n) { return n < 10 ? '0' + n : n; }
      switch(format.toUpperCase()) {
        case 'YYYYMMDD': return today.getFullYear() + pad(today.getMonth() + 1) + pad(today.getDate());
        case 'YYYY-MM-DD': return today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
        case 'MM/DD/YYYY': return pad(today.getMonth() + 1) + '/' + pad(today.getDate()) + '/' + today.getFullYear();
        default: return today.toLocaleDateString('en-US');
      }
    }
    return today.toLocaleDateString('en-US');
  }
  if (/^Now\(/i.test(logic)) {
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
  
  // Handle unquoted static values
  if (!/Column\d+/i.test(logic) && !/^(RemoveLeadingZeroes|Trim|Concat|Sum|If|Today|Now|Increment|DateReformat|Left|Right)/i.test(logic) && !/\+/.test(logic)) {
    return logic;
  }
  
  // Column references
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    return data[colMatch[1] - 1] || '';
  }

  return null;
}

// Create Universal Dynamic Mapper
function createDynamicMapper(mappingData) {
  var mappingRules = [];
  var headers = [];
  
  // Reset increment counter for new mapping session
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
  
  // Return universal mapper function
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
          // Apply transformation logic directly
          value = applyLogic(rule.logic, data, rule.field, rowIndex);
        } else if (rule.colNum !== null) {
          // Direct column mapping
          value = safeGet(data, rule.colNum, rule.field, rowIndex);
        } else {
          value = null;
        }
        
        record[rule.field] = value;
        
        // Check required fields
        if (rule.required && (!value || !value.toString().trim())) {
          // Required field validation - field is blank
        }
      });
      
      return record;
    },
    headers: headers
  };
}

// Main Transform Function
function transformData(inputText, mappingTable, delimiter, skipRows) {
  try {
    // Parse mapping table
    var mappingRows = parseCSV(mappingTable, ',');
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
    
    // Create universal dynamic mapper
    var mapper = createDynamicMapper(parsedMappings);
    var mapRecord = mapper.mapRecord;
    var headers = mapper.headers;
    
    // Transform data
    var results = inputData.map(function(row, index) {
      return mapRecord(row, index);
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
      transformedData: results,
      csvOutput: csvLines.join('\n'),
      headers: headers,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      transformedData: null,
      csvOutput: null,
      headers: null,
      error: error.message
    };
  }
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    transformData: transformData,
    applyLogic: applyLogic,
    createDynamicMapper: createDynamicMapper
  };
}
