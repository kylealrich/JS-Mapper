// OMRQ Multi-Record Fixed-Length Mapper - Enhanced
// Generated: 2025-03-11
// Optimized for Infor Process Developer (IPA)

// ============================================================================
// PERFORMANCE: PRE-COMPILED REGEX PATTERNS
// ============================================================================

var REGEX_PATTERNS = {
  removeLeadingZeroes: /^RemoveLeadingZeroes\(/i,
  trim: /^Trim\(/i,
  uppercase: /^Uppercase\(/i,
  lowercase: /^Lowercase\(/i,
  substring: /^Substring\(([^,]+),\s*(\d+),\s*(\d+)\)/i,
  left: /^Left\(([^,]+),\s*(\d+)\)/i,
  right: /^Right\(([^,]+),\s*(\d+)\)/i,
  concat: /^Concat\((.+)\)/i,
  replace: /^Replace\(([^,]+),\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"].*\)/i,
  padLeft: /^PadLeft\(([^,]+),\s*(\d+),\s*['"](.)['"]\)/i,
  padRight: /^PadRight\(([^,]+),\s*(\d+),\s*['"](.)['"]\)/i,
  dateReformat: /^DateReformat\(([^,]+),\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/i,
  sum: /^Sum\((.+)\)/i,
  multiply: /^Multiply\(([^,]+),\s*([^)]+)\)/i,
  divide: /^Divide\(([^,]+),\s*([^)]+)\)/i,
  round: /^Round\(([^,]+),\s*(\d+)\)/i,
  abs: /^Abs\(/i,
  ifThen: /^If\s+(.+?)\s+(==|!=|>|<|>=|<=)\s+['"]?([^'"]+?)['"]?\s+Then\s+['"]?([^'"]+?)['"]?(?:\s+Else\s+['"]?([^'"]+?)['"]?)?$/i,
  hardcode: /^Hardcode\s+['"](.+)['"]/i,
  today: /^Today\(\)/i,
  now: /^Now\(\)/i,
  fieldRef: /Field(\d+)/gi,
  numericTest: /^-?\d*\.?\d+$/
};

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

function removeLeadingZeroes(value) {
  if (!value) return '';
  var result = value.replace(/^0+/, '');
  return result || '0';
}

function trim(value) {
  return value ? value.toString().trim() : '';
}

function uppercase(value) {
  return value ? value.toString().toUpperCase() : '';
}

function lowercase(value) {
  return value ? value.toString().toLowerCase() : '';
}

function substring(value, start, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(start - 1, start - 1 + length);
}

function left(value, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(0, length);
}

function right(value, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(str.length - length);
}

function concat() {
  var result = '';
  for (var i = 0; i < arguments.length; i++) {
    result += arguments[i] || '';
  }
  return result;
}

function replace(value, oldStr, newStr) {
  if (!value) return '';
  return value.toString().split(oldStr).join(newStr);
}

function padLeft(value, length, padChar) {
  if (!value) value = '';
  var str = value.toString();
  while (str.length < length) {
    str = padChar + str;
  }
  return str;
}

function padRight(value, length, padChar) {
  if (!value) value = '';
  var str = value.toString();
  while (str.length < length) {
    str = str + padChar;
  }
  return str;
}

function dateReformat(value, inputFormat, outputFormat) {
  if (!value) return '';
  var dateStr = value.toString().replace(/[^0-9]/g, '');
  
  if (inputFormat === 'MMDDYYYY' && outputFormat === 'YYYYMMDD') {
    return dateStr.substring(4, 8) + dateStr.substring(0, 2) + dateStr.substring(2, 4);
  } else if (inputFormat === 'YYYYMMDD' && outputFormat === 'MMDDYYYY') {
    return dateStr.substring(4, 6) + dateStr.substring(6, 8) + dateStr.substring(0, 4);
  } else if (inputFormat === 'MMDDYYYY' && outputFormat === 'MM/DD/YYYY') {
    return dateStr.substring(0, 2) + '/' + dateStr.substring(2, 4) + '/' + dateStr.substring(4, 8);
  } else if (inputFormat === 'YYYYMMDD' && outputFormat === 'YYYY-MM-DD') {
    return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
  }
  
  return value;
}

function sum() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    var val = arguments[i];
    if (val && REGEX_PATTERNS.numericTest.test(val.toString().trim())) {
      total += parseFloat(val);
    }
  }
  return total.toString();
}

function multiply(val1, val2) {
  var num1 = parseFloat(val1) || 0;
  var num2 = parseFloat(val2) || 0;
  return (num1 * num2).toString();
}

function divide(val1, val2) {
  var num1 = parseFloat(val1) || 0;
  var num2 = parseFloat(val2) || 1;
  if (num2 === 0) return '0';
  return (num1 / num2).toString();
}

function round(value, decimals) {
  var num = parseFloat(value) || 0;
  var multiplier = Math.pow(10, decimals);
  return (Math.round(num * multiplier) / multiplier).toString();
}

function abs(value) {
  var num = parseFloat(value) || 0;
  return Math.abs(num).toString();
}

function today() {
  var d = new Date();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var year = d.getFullYear();
  return month + '/' + day + '/' + year;
}

function now() {
  var d = new Date();
  return d.toLocaleString();
}

function evaluateCondition(leftVal, operator, rightVal) {
  var left = leftVal.toString().trim();
  var right = rightVal.toString().trim();
  
  if (operator === '==') return left === right;
  if (operator === '!=') return left !== right;
  
  var leftNum = parseFloat(left);
  var rightNum = parseFloat(right);
  
  if (operator === '>') return leftNum > rightNum;
  if (operator === '<') return leftNum < rightNum;
  if (operator === '>=') return leftNum >= rightNum;
  if (operator === '<=') return leftNum <= rightNum;
  
  return false;
}

// ============================================================================
// FIXED-LENGTH FIELD EXTRACTION
// ============================================================================

function extractFixedLengthFields(line, mappingConfig) {
  var fields = {};
  
  for (var i = 0; i < mappingConfig.length; i++) {
    var field = mappingConfig[i];
    var start = parseInt(field.start) - 1;
    var end = parseInt(field.end);
    var value = line.substring(start, end);
    
    if (field.justify && field.justify.toLowerCase() === 'right') {
      value = value.replace(/^\s+/, '');
    } else {
      value = value.replace(/\s+$/, '');
    }
    
    fields[field.fieldName] = value;
  }
  
  return fields;
}

// ============================================================================
// TRANSFORMATION LOGIC ENGINE
// ============================================================================

function applyMappingLogic(logic, fields, fieldName) {
  if (!logic || logic.trim() === '') {
    return fields[fieldName] || '';
  }
  
  var trimmedLogic = logic.trim();
  var match;
  
  if (REGEX_PATTERNS.hardcode.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.hardcode);
    return match[1];
  }
  
  if (REGEX_PATTERNS.today.test(trimmedLogic)) {
    return today();
  }
  
  if (REGEX_PATTERNS.now.test(trimmedLogic)) {
    return now();
  }
  
  if (REGEX_PATTERNS.ifThen.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.ifThen);
    var leftSide = resolveFieldReference(match[1], fields);
    var operator = match[2];
    var rightSide = match[3];
    var thenValue = resolveFieldReference(match[4], fields);
    var elseValue = match[5] ? resolveFieldReference(match[5], fields) : '';
    
    if (evaluateCondition(leftSide, operator, rightSide)) {
      return thenValue;
    } else {
      return elseValue;
    }
  }
  
  var value = fields[fieldName] || '';
  
  if (REGEX_PATTERNS.removeLeadingZeroes.test(trimmedLogic)) {
    return removeLeadingZeroes(value);
  }
  
  if (REGEX_PATTERNS.trim.test(trimmedLogic)) {
    return trim(value);
  }
  
  if (REGEX_PATTERNS.uppercase.test(trimmedLogic)) {
    return uppercase(value);
  }
  
  if (REGEX_PATTERNS.lowercase.test(trimmedLogic)) {
    return lowercase(value);
  }
  
  if (REGEX_PATTERNS.abs.test(trimmedLogic)) {
    return abs(value);
  }
  
  if (REGEX_PATTERNS.substring.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.substring);
    var subValue = resolveFieldReference(match[1], fields);
    return substring(subValue, parseInt(match[2]), parseInt(match[3]));
  }
  
  if (REGEX_PATTERNS.left.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.left);
    var leftValue = resolveFieldReference(match[1], fields);
    return left(leftValue, parseInt(match[2]));
  }
  
  if (REGEX_PATTERNS.right.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.right);
    var rightValue = resolveFieldReference(match[1], fields);
    return right(rightValue, parseInt(match[2]));
  }
  
  if (REGEX_PATTERNS.concat.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.concat);
    var parts = match[1].split(',');
    var values = [];
    for (var i = 0; i < parts.length; i++) {
      values.push(resolveFieldReference(parts[i].trim(), fields));
    }
    return concat.apply(null, values);
  }
  
  if (REGEX_PATTERNS.replace.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.replace);
    var replaceValue = resolveFieldReference(match[1], fields);
    return replace(replaceValue, match[2], match[3]);
  }
  
  if (REGEX_PATTERNS.padLeft.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.padLeft);
    var padValue = resolveFieldReference(match[1], fields);
    return padLeft(padValue, parseInt(match[2]), match[3]);
  }
  
  if (REGEX_PATTERNS.padRight.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.padRight);
    var padValue = resolveFieldReference(match[1], fields);
    return padRight(padValue, parseInt(match[2]), match[3]);
  }
  
  if (REGEX_PATTERNS.dateReformat.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.dateReformat);
    var dateValue = resolveFieldReference(match[1], fields);
    return dateReformat(dateValue, match[2], match[3]);
  }
  
  if (REGEX_PATTERNS.sum.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.sum);
    var parts = match[1].split(',');
    var values = [];
    for (var i = 0; i < parts.length; i++) {
      values.push(resolveFieldReference(parts[i].trim(), fields));
    }
    return sum.apply(null, values);
  }
  
  if (REGEX_PATTERNS.multiply.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.multiply);
    var val1 = resolveFieldReference(match[1], fields);
    var val2 = resolveFieldReference(match[2], fields);
    return multiply(val1, val2);
  }
  
  if (REGEX_PATTERNS.divide.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.divide);
    var val1 = resolveFieldReference(match[1], fields);
    var val2 = resolveFieldReference(match[2], fields);
    return divide(val1, val2);
  }
  
  if (REGEX_PATTERNS.round.test(trimmedLogic)) {
    match = trimmedLogic.match(REGEX_PATTERNS.round);
    var roundValue = resolveFieldReference(match[1], fields);
    return round(roundValue, parseInt(match[2]));
  }
  
  return value;
}

function resolveFieldReference(ref, fields) {
  if (!ref) return '';
  
  var trimmedRef = ref.trim();
  
  if (trimmedRef.charAt(0) === "'" && trimmedRef.charAt(trimmedRef.length - 1) === "'") {
    return trimmedRef.substring(1, trimmedRef.length - 1);
  }
  
  if (trimmedRef.charAt(0) === '"' && trimmedRef.charAt(trimmedRef.length - 1) === '"') {
    return trimmedRef.substring(1, trimmedRef.length - 1);
  }
  
  if (fields[trimmedRef]) {
    return fields[trimmedRef];
  }
  
  return trimmedRef;
}

// ============================================================================
// RECORD TYPE CONFIGURATION
// ============================================================================

var recordTypeConfig = {
  'H': {
    name: 'Header',
    outputName: 'Headers',
    parent: null,
    mappingConfig: [
      {fieldName: 'Record Type', start: 1, end: 1, required: 'Y', logic: ''},
      {fieldName: 'Company', start: 2, end: 5, required: 'Y', logic: 'RemoveLeadingZeroes(Company)', justify: 'right'},
      {fieldName: 'Req Number', start: 6, end: 12, required: 'Y', logic: 'RemoveLeadingZeroes(Req Number)', justify: 'right'},
      {fieldName: 'Line Number', start: 13, end: 18, required: 'N', logic: '', justify: 'right'},
      {fieldName: 'Requester', start: 19, end: 28, required: 'Y', logic: ''},
      {fieldName: 'Req Location', start: 29, end: 33, required: 'Y', logic: ''},
      {fieldName: 'Req Del Date', start: 34, end: 41, required: 'Y', logic: ''},
      {fieldName: 'Creation Date', start: 42, end: 49, required: 'N', logic: ''},
      {fieldName: 'From Company', start: 50, end: 53, required: 'N', logic: 'RemoveLeadingZeroes(From Company)', justify: 'right'},
      {fieldName: 'From Location', start: 54, end: 58, required: 'N', logic: ''},
      {fieldName: 'Deliver To', start: 59, end: 88, required: 'N', logic: ''},
      {fieldName: 'Buyer Code', start: 89, end: 91, required: 'N', logic: ''},
      {fieldName: 'Vendor', start: 92, end: 100, required: 'N', logic: '', justify: 'right'},
      {fieldName: 'Purchase From Loc', start: 101, end: 104, required: 'N', logic: ''},
      {fieldName: 'Vendor Name', start: 105, end: 134, required: 'N', logic: ''},
      {fieldName: 'Print Req Fl', start: 135, end: 135, required: 'N', logic: '', defaultValue: 'N'},
      {fieldName: 'Agreement Ref', start: 136, end: 165, required: 'N', logic: ''},
      {fieldName: 'PO User Fld 1', start: 166, end: 166, required: 'N', logic: ''},
      {fieldName: 'PO User Fld 3', start: 167, end: 176, required: 'N', logic: ''},
      {fieldName: 'PO User Fld 5', start: 177, end: 206, required: 'N', logic: ''},
      {fieldName: 'User Date 1', start: 207, end: 214, required: 'N', logic: ''},
      {fieldName: 'User Date 2', start: 215, end: 222, required: 'N', logic: ''},
      {fieldName: 'Allocate Priority', start: 223, end: 224, required: 'N', logic: '', defaultValue: '50', justify: 'right'},
      {fieldName: 'Quote Fl', start: 225, end: 225, required: 'N', logic: '', defaultValue: 'N'},
      {fieldName: 'Activity', start: 226, end: 240, required: 'N', logic: ''},
      {fieldName: 'Account Category', start: 241, end: 245, required: 'N', logic: ''},
      {fieldName: 'Billing Category', start: 246, end: 277, required: 'N', logic: ''},
      {fieldName: 'Account Unit', start: 278, end: 292, required: 'Y', logic: ''},
      {fieldName: 'Account', start: 293, end: 298, required: 'N', logic: '', justify: 'right'},
      {fieldName: 'Sub Account', start: 299, end: 302, required: 'N', logic: '', justify: 'right'},
      {fieldName: 'Purchase Tax Code', start: 303, end: 312, required: 'N', logic: ''},
      {fieldName: 'Purchase Tax Fl', start: 313, end: 313, required: 'N', logic: '', defaultValue: 'N'},
      {fieldName: 'Operator Id', start: 314, end: 323, required: 'N', logic: ''},
      {fieldName: 'Dropship Fl', start: 324, end: 324, required: 'N', logic: '', defaultValue: 'N'},
      {fieldName: 'Dropsh Req Loc', start: 325, end: 325, required: 'N', logic: ''},
      {fieldName: 'Dropsh Req', start: 326, end: 326, required: 'N', logic: ''},
      {fieldName: 'Sh Name', start: 327, end: 356, required: 'N', logic: ''},
      {fieldName: 'Sh Addr 1', start: 357, end: 386, required: 'N', logic: ''},
      {fieldName: 'Sh Addr 2', start: 387, end: 416, required: 'N', logic: ''},
      {fieldName: 'Sh Addr 3', start: 417, end: 446, required: 'N', logic: ''},
      {fieldName: 'Sh Addr 4', start: 447, end: 476, required: 'N', logic: ''},
      {fieldName: 'Sh City-Addr5', start: 477, end: 494, required: 'N', logic: ''},
      {fieldName: 'Sh State-Prov', start: 495, end: 496, required: 'N', logic: ''},
      {fieldName: 'Sh Post Code', start: 497, end: 506, required: 'N', logic: ''},
      {fieldName: 'Sh Country', start: 507, end: 536, required: 'N', logic: ''},
      {fieldName: 'Sh County', start: 537, end: 561, required: 'N', logic: ''},
      {fieldName: 'Sh Phone Pref', start: 562, end: 567, required: 'N', logic: ''},
      {fieldName: 'Sh Phone', start: 568, end: 582, required: 'N', logic: ''},
      {fieldName: 'Sh Phone Ext', start: 583, end: 587, required: 'N', logic: ''},
      {fieldName: 'Sh Contact', start: 588, end: 617, required: 'N', logic: ''},
      {fieldName: 'Tran Curr Code', start: 618, end: 622, required: 'N', logic: ''},
      {fieldName: 'One Src One PO', start: 623, end: 623, required: 'N', logic: '', defaultValue: '1'},
      {fieldName: 'Location Rule', start: 624, end: 635, required: 'N', logic: ''},
      {fieldName: 'Segment Block', start: 636, end: 738, required: 'N', logic: ''}
    ]
  },
  'L': {
    name: 'Line',
    outputName: 'LineItems',
    parent: 'Header',
    mappingConfig: [
      {fieldName: 'Record Type', start: 1, end: 1, required: 'Y', logic: ''},
      {fieldName: 'Requisition Number', start: 2, end: 14, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Line Number', start: 15, end: 29, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Item Number', start: 30, end: 59, required: 'N', logic: ''},
      {fieldName: 'Item Description', start: 60, end: 99, required: 'N', logic: ''},
      {fieldName: 'Quantity', start: 100, end: 114, required: 'N', logic: '', defaultValue: '0', justify: 'right'},
      {fieldName: 'Unit of Measure', start: 115, end: 116, required: 'N', logic: ''},
      {fieldName: 'Unit Price', start: 117, end: 131, required: 'N', logic: '', defaultValue: '0', justify: 'right'},
      {fieldName: 'Extended Amount', start: 132, end: 146, required: 'N', logic: '', defaultValue: '0', justify: 'right'},
      {fieldName: 'Taxable Flag', start: 147, end: 147, required: 'N', logic: ''}
    ]
  },
  'D': {
    name: 'Detail',
    outputName: 'Details',
    parent: 'Line',
    mappingConfig: [
      {fieldName: 'Record Type', start: 1, end: 1, required: 'Y', logic: ''},
      {fieldName: 'Requisition Number', start: 2, end: 14, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Line Number', start: 15, end: 29, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Detail Sequence', start: 30, end: 34, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Detail Type', start: 35, end: 94, required: 'N', logic: ''},
      {fieldName: 'Detail Value', start: 95, end: 154, required: 'N', logic: ''}
    ]
  },
  'C': {
    name: 'Comment',
    outputName: 'Comments',
    parent: 'Header',
    mappingConfig: [
      {fieldName: 'Record Type', start: 1, end: 1, required: 'Y', logic: ''},
      {fieldName: 'Requisition Number', start: 2, end: 14, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Comment Sequence', start: 15, end: 29, required: 'Y', logic: '', justify: 'right'},
      {fieldName: 'Comment Type', start: 30, end: 89, required: 'N', logic: ''},
      {fieldName: 'Comment Text', start: 90, end: 1089, required: 'N', logic: ''}
    ]
  }
};

// ============================================================================
// PERFORMANCE: CACHED RECORD LENGTHS
// ============================================================================

var cachedRecordLengths = {};

function getRecordLength(recordType) {
  if (cachedRecordLengths[recordType]) {
    return cachedRecordLengths[recordType];
  }
  
  var config = recordTypeConfig[recordType];
  if (!config || !config.mappingConfig || config.mappingConfig.length === 0) {
    cachedRecordLengths[recordType] = 0;
    return 0;
  }
  
  var maxEnd = 0;
  for (var i = 0; i < config.mappingConfig.length; i++) {
    var end = parseInt(config.mappingConfig[i].end);
    if (end > maxEnd) {
      maxEnd = end;
    }
  }
  
  cachedRecordLengths[recordType] = maxEnd;
  return maxEnd;
}

// ============================================================================
// MULTI-RECORD PROCESSOR WITH HIERARCHICAL SUPPORT
// ============================================================================

function processMultiRecordFile(inputText) {
  var results = {
    Headers: [],
    LineItems: [],
    Details: [],
    Comments: [],
    recordCounts: {
      H: 0,
      L: 0,
      D: 0,
      C: 0
    }
  };
  
  var position = 0;
  var currentHeaderId = null;
  var currentLineId = null;
  
  var recordLengths = {
    'H': getRecordLength('H'),
    'L': getRecordLength('L'),
    'D': getRecordLength('D'),
    'C': getRecordLength('C')
  };
  
  while (position < inputText.length) {
    var recordType = inputText.charAt(position);
    
    if (recordType !== 'H' && recordType !== 'L' && recordType !== 'D' && recordType !== 'C') {
      position++;
      continue;
    }
    
    var recordLength = recordLengths[recordType];
    if (recordLength === 0) {
      position++;
      continue;
    }
    
    var record = inputText.substring(position, position + recordLength);
    position += recordLength;
    
    var config = recordTypeConfig[recordType];
    var fields = extractFixedLengthFields(record, config.mappingConfig);
    var outputRecord = {};
    
    for (var j = 0; j < config.mappingConfig.length; j++) {
      var fieldConfig = config.mappingConfig[j];
      var fieldValue = fields[fieldConfig.fieldName];
      
      if (fieldConfig.logic) {
        fieldValue = applyMappingLogic(fieldConfig.logic, fields, fieldConfig.fieldName);
      }
      
      if ((!fieldValue || fieldValue === '') && fieldConfig.defaultValue) {
        fieldValue = fieldConfig.defaultValue;
      }
      
      outputRecord[fieldConfig.fieldName] = fieldValue;
    }
    
    if (recordType === 'H') {
      currentHeaderId = outputRecord['Req Number'] || results.recordCounts.H.toString();
      outputRecord['_recordId'] = currentHeaderId;
      results.Headers.push(outputRecord);
      results.recordCounts.H++;
    } else if (recordType === 'L') {
      currentLineId = outputRecord['Line Number'] || results.recordCounts.L.toString();
      outputRecord['_parentHeaderId'] = currentHeaderId;
      outputRecord['_recordId'] = currentLineId;
      results.LineItems.push(outputRecord);
      results.recordCounts.L++;
    } else if (recordType === 'D') {
      outputRecord['_parentHeaderId'] = currentHeaderId;
      outputRecord['_parentLineId'] = currentLineId;
      results.Details.push(outputRecord);
      results.recordCounts.D++;
    } else if (recordType === 'C') {
      outputRecord['_parentHeaderId'] = currentHeaderId;
      results.Comments.push(outputRecord);
      results.recordCounts.C++;
    }
  }
  
  return results;
}

// ============================================================================
// CSV OUTPUT GENERATION WITH STRING BUILDER OPTIMIZATION
// ============================================================================

function escapeCSVField(field) {
  if (field === null || field === undefined) {
    return '';
  }
  
  var str = field.toString();
  
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  
  return str;
}

function generateCSVOutput(results) {
  var outputParts = [];
  
  outputParts.push('=== HEADERS ===\n');
  if (results.Headers.length > 0) {
    var headerKeys = Object.keys(results.Headers[0]);
    var headerRow = [];
    for (var k = 0; k < headerKeys.length; k++) {
      headerRow.push(escapeCSVField(headerKeys[k]));
    }
    outputParts.push(headerRow.join(',') + '\n');
    
    for (var i = 0; i < results.Headers.length; i++) {
      var row = [];
      for (var j = 0; j < headerKeys.length; j++) {
        row.push(escapeCSVField(results.Headers[i][headerKeys[j]]));
      }
      outputParts.push(row.join(',') + '\n');
    }
  }
  
  outputParts.push('\n=== LINE ITEMS ===\n');
  if (results.LineItems.length > 0) {
    var lineKeys = Object.keys(results.LineItems[0]);
    var lineHeaderRow = [];
    for (var k = 0; k < lineKeys.length; k++) {
      lineHeaderRow.push(escapeCSVField(lineKeys[k]));
    }
    outputParts.push(lineHeaderRow.join(',') + '\n');
    
    for (var i = 0; i < results.LineItems.length; i++) {
      var row = [];
      for (var j = 0; j < lineKeys.length; j++) {
        row.push(escapeCSVField(results.LineItems[i][lineKeys[j]]));
      }
      outputParts.push(row.join(',') + '\n');
    }
  }
  
  outputParts.push('\n=== DETAILS ===\n');
  if (results.Details.length > 0) {
    var detailKeys = Object.keys(results.Details[0]);
    var detailHeaderRow = [];
    for (var k = 0; k < detailKeys.length; k++) {
      detailHeaderRow.push(escapeCSVField(detailKeys[k]));
    }
    outputParts.push(detailHeaderRow.join(',') + '\n');
    
    for (var i = 0; i < results.Details.length; i++) {
      var row = [];
      for (var j = 0; j < detailKeys.length; j++) {
        row.push(escapeCSVField(results.Details[i][detailKeys[j]]));
      }
      outputParts.push(row.join(',') + '\n');
    }
  }
  
  outputParts.push('\n=== COMMENTS ===\n');
  if (results.Comments.length > 0) {
    var commentKeys = Object.keys(results.Comments[0]);
    var commentHeaderRow = [];
    for (var k = 0; k < commentKeys.length; k++) {
      commentHeaderRow.push(escapeCSVField(commentKeys[k]));
    }
    outputParts.push(commentHeaderRow.join(',') + '\n');
    
    for (var i = 0; i < results.Comments.length; i++) {
      var row = [];
      for (var j = 0; j < commentKeys.length; j++) {
        row.push(escapeCSVField(results.Comments[i][commentKeys[j]]));
      }
      outputParts.push(row.join(',') + '\n');
    }
  }
  
  return outputParts.join('');
}
