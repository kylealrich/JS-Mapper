// Cerner GL Transaction Mapper
// Generated mapper for transforming Cerner GL data
// Input: Comma-delimited file
// Skip rows: 0

// Global counter for increment operations
var incrementCounter = 0;

// Parse CSV with proper handling of quoted fields
function parseCSV(text, delimiter) {
  var rows = [];
  var currentRow = [];
  var currentField = '';
  var inQuotes = false;
  
  for (var i = 0; i < text.length; i++) {
    var char = text[i];
    var nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  return rows;
}

// Apply transformation logic
function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return '';
  
  // Hardcode values
  if (/^Hardcode\s+['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
    return match[1];
  }
  
  // Increment counter
  if (/^Increment By 1$/i.test(logic)) {
    incrementCounter++;
    return incrementCounter.toString();
  }
  
  // Column reference
  var colMatch = logic.match(/^Column(\d+)$/i);
  if (colMatch) {
    var colNum = parseInt(colMatch[1]);
    return (data[colNum - 1] || '').trim();
  }
  
  // RemoveLeadingZeroes
  if (/^RemoveLeadingZeroes\(Column(\d+)\)$/i.test(logic)) {
    var match = logic.match(/^RemoveLeadingZeroes\(Column(\d+)\)$/i);
    var colNum = parseInt(match[1]);
    var value = (data[colNum - 1] || '').trim();
    return value.replace(/^0+/, '') || '0';
  }
  
  // Left function
  if (/^Left\(Column(\d+),\s*(\d+)\)$/i.test(logic)) {
    var match = logic.match(/^Left\(Column(\d+),\s*(\d+)\)$/i);
    var colNum = parseInt(match[1]);
    var length = parseInt(match[2]);
    var value = (data[colNum - 1] || '').trim();
    return value.substring(0, length);
  }
  
  // Right function
  if (/^Right\(Column(\d+),\s*(\d+)\)$/i.test(logic)) {
    var match = logic.match(/^Right\(Column(\d+),\s*(\d+)\)$/i);
    var colNum = parseInt(match[1]);
    var length = parseInt(match[2]);
    var value = (data[colNum - 1] || '').trim();
    return value.substring(value.length - length);
  }
  
  // Trim function
  if (/^Trim\(Column(\d+)\)$/i.test(logic)) {
    var match = logic.match(/^Trim\(Column(\d+)\)$/i);
    var colNum = parseInt(match[1]);
    return (data[colNum - 1] || '').trim();
  }
  
  // If-Then-Else with == comparison
  if (/^If Column(\d+) == ['"](.*)['"] Then ['"](.*)['"] Else Column(\d+)$/i.test(logic)) {
    var match = logic.match(/^If Column(\d+) == ['"](.*)['"] Then ['"](.*)['"] Else Column(\d+)$/i);
    var colNum = parseInt(match[1]);
    var compareValue = match[2];
    var thenValue = match[3];
    var elseColNum = parseInt(match[4]);
    var value = (data[colNum - 1] || '').trim();
    return value === compareValue ? thenValue : (data[elseColNum - 1] || '').trim();
  }
  
  // If-Then-Else with hardcoded else
  if (/^If Column(\d+) == ['"](.*)['"] Then ['"](.*)['"] Else ['"](.*)['"]$/i.test(logic)) {
    var match = logic.match(/^If Column(\d+) == ['"](.*)['"] Then ['"](.*)['"] Else ['"](.*)['"]$/i);
    var colNum = parseInt(match[1]);
    var compareValue = match[2];
    var thenValue = match[3];
    var elseValue = match[4];
    var value = (data[colNum - 1] || '').trim();
    return value === compareValue ? thenValue : elseValue;
  }
  
  // DateReformat function
  if (/^DateReformat\(Column(\d+),\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)$/i.test(logic)) {
    var match = logic.match(/^DateReformat\(Column(\d+),\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)$/i);
    var colNum = parseInt(match[1]);
    var inputFormat = match[2];
    var outputFormat = match[3];
    var dateStr = (data[colNum - 1] || '').trim();
    
    if (!dateStr) return '';
    
    // Convert MMDDYYYY to YYYYMMDD
    if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD') {
      if (dateStr.length === 8) {
        return dateStr.substring(4, 8) + dateStr.substring(0, 4);
      }
    }
    
    return dateStr;
  }
  
  return '';
}

// Main transformation function
function transformData(inputText, mappingText, delimiter, skipRows) {
  // Parse input data
  var inputRows = parseCSV(inputText, delimiter);
  
  // Skip specified rows
  if (skipRows > 0) {
    inputRows = inputRows.slice(skipRows);
  }
  
  // Parse mapping configuration
  var mappingRows = parseCSV(mappingText, ',');
  var mappingHeaders = mappingRows[0];
  var mappingRules = mappingRows.slice(1);
  
  // Reset increment counter
  incrementCounter = 0;
  
  // Build output headers
  var outputHeaders = [];
  for (var i = 0; i < mappingRules.length; i++) {
    outputHeaders.push(mappingRules[i][1]); // TargetFieldName
  }
  
  // Transform each input row
  var outputRows = [outputHeaders];
  
  for (var r = 0; r < inputRows.length; r++) {
    var inputRow = inputRows[r];
    var outputRow = [];
    
    for (var m = 0; m < mappingRules.length; m++) {
      var rule = mappingRules[m];
      var inputColNum = rule[3]; // InputColumnNumber
      var mappingLogic = rule[4]; // MappingLogic
      
      var value = '';
      
      if (mappingLogic && mappingLogic.trim() !== '') {
        // Use mapping logic
        value = applyLogic(mappingLogic, inputRow, rule[1], r);
      } else if (inputColNum && inputColNum.trim() !== '') {
        // Use direct column reference
        var colNum = parseInt(inputColNum);
        value = (inputRow[colNum - 1] || '').trim();
      }
      
      outputRow.push(value);
    }
    
    outputRows.push(outputRow);
  }
  
  // Convert to CSV
  var outputText = '';
  for (var i = 0; i < outputRows.length; i++) {
    var row = outputRows[i];
    var csvRow = [];
    for (var j = 0; j < row.length; j++) {
      var field = row[j].toString();
      if (field.indexOf(',') >= 0 || field.indexOf('"') >= 0 || field.indexOf('\n') >= 0) {
        field = '"' + field.replace(/"/g, '""') + '"';
      }
      csvRow.push(field);
    }
    outputText += csvRow.join(',') + '\n';
  }
  
  return outputText;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV: parseCSV,
    applyLogic: applyLogic,
    transformData: transformData
  };
}
