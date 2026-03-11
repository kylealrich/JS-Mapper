// ============================================================================
// Multi-Record Fixed-Length Mapper - Final Enhanced Version
// ============================================================================
// Generated: 2025-03-11
// Optimized for Infor Process Developer (IPA)
//
// FEATURES:
// - 25+ transformation functions (string, math, date, conditional)
// - Pre-compiled regex patterns for performance
// - Cached record lengths
// - String builder optimization
// - Hierarchical parent-child relationships
// - Record counters per type
// - Error handling and validation
// - Custom output delimiters
// - Separate file generation per record type
// - Custom headers/footers
// ============================================================================

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

/**
 * Removes leading zeros from a value
 * @param {string} value - The value to process
 * @return {string} Value without leading zeros
 */
function removeLeadingZeroes(value) {
  if (!value) return '';
  var result = value.replace(/^0+/, '');
  return result || '0';
}

/**
 * Trims whitespace from both ends of a value
 * @param {string} value - The value to trim
 * @return {string} Trimmed value
 */
function trim(value) {
  return value ? value.toString().trim() : '';
}

/**
 * Converts value to uppercase
 * @param {string} value - The value to convert
 * @return {string} Uppercase value
 */
function uppercase(value) {
  return value ? value.toString().toUpperCase() : '';
}

/**
 * Converts value to lowercase
 * @param {string} value - The value to convert
 * @return {string} Lowercase value
 */
function lowercase(value) {
  return value ? value.toString().toLowerCase() : '';
}

/**
 * Extracts a substring from a value
 * @param {string} value - The source value
 * @param {number} start - Starting position (1-indexed)
 * @param {number} length - Number of characters to extract
 * @return {string} Extracted substring
 */
function substring(value, start, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(start - 1, start - 1 + length);
}

/**
 * Extracts leftmost characters from a value
 * @param {string} value - The source value
 * @param {number} length - Number of characters to extract
 * @return {string} Left portion of value
 */
function left(value, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(0, length);
}

/**
 * Extracts rightmost characters from a value
 * @param {string} value - The source value
 * @param {number} length - Number of characters to extract
 * @return {string} Right portion of value
 */
function right(value, length) {
  if (!value) return '';
  var str = value.toString();
  return str.substring(str.length - length);
}

/**
 * Concatenates multiple values
 * @return {string} Concatenated result
 */
function concat() {
  var result = '';
  for (var i = 0; i < arguments.length; i++) {
    result += arguments[i] || '';
  }
  return result;
}

/**
 * Replaces all occurrences of a string
 * @param {string} value - The source value
 * @param {string} oldStr - String to replace
 * @param {string} newStr - Replacement string
 * @return {string} Value with replacements
 */
function replace(value, oldStr, newStr) {
  if (!value) return '';
  return value.toString().split(oldStr).join(newStr);
}

/**
 * Pads value on the left with a character
 * @param {string} value - The value to pad
 * @param {number} length - Target length
 * @param {string} padChar - Character to pad with
 * @return {string} Padded value
 */
function padLeft(value, length, padChar) {
  if (!value) value = '';
  var str = value.toString();
  while (str.length < length) {
    str = padChar + str;
  }
  return str;
}

/**
 * Pads value on the right with a character
 * @param {string} value - The value to pad
 * @param {number} length - Target length
 * @param {string} padChar - Character to pad with
 * @return {string} Padded value
 */
function padRight(value, length, padChar) {
  if (!value) value = '';
  var str = value.toString();
  while (str.length < length) {
    str = str + padChar;
  }
  return str;
}

/**
 * Reformats a date from one format to another
 * @param {string} value - The date value
 * @param {string} inputFormat - Input date format
 * @param {string} outputFormat - Output date format
 * @return {string} Reformatted date
 */
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

/**
 * Sums multiple numeric values
 * @return {string} Sum as string
 */
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

/**
 * Multiplies two numeric values
 * @param {string} val1 - First value
 * @param {string} val2 - Second value
 * @return {string} Product as string
 */
function multiply(val1, val2) {
  var num1 = parseFloat(val1) || 0;
  var num2 = parseFloat(val2) || 0;
  return (num1 * num2).toString();
}

/**
 * Divides two numeric values
 * @param {string} val1 - Dividend
 * @param {string} val2 - Divisor
 * @return {string} Quotient as string
 */
function divide(val1, val2) {
  var num1 = parseFloat(val1) || 0;
  var num2 = parseFloat(val2) || 1;
  if (num2 === 0) return '0';
  return (num1 / num2).toString();
}

/**
 * Rounds a numeric value to specified decimal places
 * @param {string} value - The value to round
 * @param {number} decimals - Number of decimal places
 * @return {string} Rounded value as string
 */
function round(value, decimals) {
  var num = parseFloat(value) || 0;
  var multiplier = Math.pow(10, decimals);
  return (Math.round(num * multiplier) / multiplier).toString();
}

/**
 * Returns absolute value of a number
 * @param {string} value - The value
 * @return {string} Absolute value as string
 */
function abs(value) {
  var num = parseFloat(value) || 0;
  return Math.abs(num).toString();
}

/**
 * Returns current date
 * @return {string} Current date in M/D/YYYY format
 */
function today() {
  var d = new Date();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var year = d.getFullYear();
  return month + '/' + day + '/' + year;
}

/**
 * Returns current date and time
 * @return {string} Current timestamp
 */
function now() {
  var d = new Date();
  return d.toLocaleString();
}

/**
 * Evaluates a conditional expression
 * @param {string} leftVal - Left operand
 * @param {string} operator - Comparison operator
 * @param {string} rightVal - Right operand
 * @return {boolean} Result of comparison
 */
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
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates that a required field has a value
 * @param {string} fieldName - Name of the field
 * @param {string} value - Field value
 * @param {number} rowNum - Row number for error reporting
 * @return {object} Validation result {valid: boolean, error: string}
 */
function validateRequired(fieldName, value, rowNum) {
  if (!value || value.toString().trim() === '') {
    return {
      valid: false,
      error: 'Row ' + rowNum + ': Required field "' + fieldName + '" is empty'
    };
  }
  return {valid: true, error: null};
}

/**
 * Validates field length
 * @param {string} fieldName - Name of the field
 * @param {string} value - Field value
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {number} rowNum - Row number for error reporting
 * @return {object} Validation result
 */
function validateLength(fieldName, value, minLength, maxLength, rowNum) {
  var len = value ? value.toString().length : 0;
  if (len < minLength || len > maxLength) {
    return {
      valid: false,
      error: 'Row ' + rowNum + ': Field "' + fieldName + '" length ' + len + ' not in range ' + minLength + '-' + maxLength
    };
  }
  return {valid: true, error: null};
}

/**
 * Validates numeric range
 * @param {string} fieldName - Name of the field
 * @param {string} value - Field value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} rowNum - Row number for error reporting
 * @return {object} Validation result
 */
function validateRange(fieldName, value, min, max, rowNum) {
  var num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return {
      valid: false,
      error: 'Row ' + rowNum + ': Field "' + fieldName + '" value ' + value + ' not in range ' + min + '-' + max
    };
  }
  return {valid: true, error: null};
}

// ============================================================================
// FIXED-LENGTH FIELD EXTRACTION WITH ERROR HANDLING
// ============================================================================

/**
 * Extracts fixed-length fields from a line with error handling
 * @param {string} line - The input line
 * @param {array} mappingConfig - Field mapping configuration
 * @param {number} rowNum - Row number for error reporting
 * @return {object} Extracted fields or error
 */
function extractFixedLengthFields(line, mappingConfig, rowNum) {
  var fields = {};
  var errors = [];
  
  try {
    for (var i = 0; i < mappingConfig.length; i++) {
      var field = mappingConfig[i];
      var start = parseInt(field.start) - 1;
      var end = parseInt(field.end);
      
      if (start < 0 || end > line.length) {
        errors.push('Row ' + rowNum + ': Field "' + field.fieldName + '" position out of bounds');
        continue;
      }
      
      var value = line.substring(start, end);
      
      if (field.justify && field.justify.toLowerCase() === 'right') {
        value = value.replace(/^\s+/, '');
      } else {
        value = value.replace(/\s+$/, '');
      }
      
      fields[field.fieldName] = value;
    }
    
    return {success: true, fields: fields, errors: errors};
  } catch (e) {
    return {
      success: false,
      fields: {},
      errors: ['Row ' + rowNum + ': Field extraction error - ' + e.toString()]
    };
  }
}

// ============================================================================
// TRANSFORMATION LOGIC ENGINE
// ============================================================================

/**
 * Applies mapping logic to a field value
 * @param {string} logic - The transformation logic
 * @param {object} fields - All field values
 * @param {string} fieldName - Name of current field
 * @return {string} Transformed value
 */
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

/**
 * Resolves a field reference to its actual value
 * @param {string} ref - Field reference
 * @param {object} fields - All field values
 * @return {string} Resolved value
 */
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

/**
 * Gets the record length for a record type (cached)
 * @param {string} recordType - The record type identifier
 * @return {number} Record length in characters
 */
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
// MULTI-RECORD PROCESSOR WITH ERROR HANDLING
// ============================================================================

/**
 * Processes a multi-record fixed-length file with validation
 * @param {string} inputText - The input file content
 * @return {object} Processing results with data and errors
 */
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
    },
    errors: [],
    warnings: []
  };
  
  var position = 0;
  var currentHeaderId = null;
  var currentLineId = null;
  var recordNumber = 0;
  
  var recordLengths = {
    'H': getRecordLength('H'),
    'L': getRecordLength('L'),
    'D': getRecordLength('D'),
    'C': getRecordLength('C')
  };
  
  while (position < inputText.length) {
    var recordType = inputText.charAt(position);
    recordNumber++;
    
    if (recordType !== 'H' && recordType !== 'L' && recordType !== 'D' && recordType !== 'C') {
      results.warnings.push('Record ' + recordNumber + ': Unknown record type "' + recordType + '" - skipped');
      position++;
      continue;
    }
    
    var recordLength = recordLengths[recordType];
    if (recordLength === 0) {
      results.errors.push('Record ' + recordNumber + ': No configuration for record type "' + recordType + '"');
      position++;
      continue;
    }
    
    var record = inputText.substring(position, position + recordLength);
    position += recordLength;
    
    var config = recordTypeConfig[recordType];
    var extraction = extractFixedLengthFields(record, config.mappingConfig, recordNumber);
    
    if (!extraction.success) {
      results.errors = results.errors.concat(extraction.errors);
      continue;
    }
    
    if (extraction.errors.length > 0) {
      results.warnings = results.warnings.concat(extraction.errors);
    }
    
    var fields = extraction.fields;
    var outputRecord = {};
    
    for (var j = 0; j < config.mappingConfig.length; j++) {
      var fieldConfig = config.mappingConfig[j];
      var fieldValue = fields[fieldConfig.fieldName];
      
      try {
        if (fieldConfig.logic) {
          fieldValue = applyMappingLogic(fieldConfig.logic, fields, fieldConfig.fieldName);
        }
        
        if ((!fieldValue || fieldValue === '') && fieldConfig.defaultValue) {
          fieldValue = fieldConfig.defaultValue;
        }
        
        if (fieldConfig.required && fieldConfig.required.toUpperCase() === 'Y') {
          var validation = validateRequired(fieldConfig.fieldName, fieldValue, recordNumber);
          if (!validation.valid) {
            results.errors.push(validation.error);
          }
        }
        
        outputRecord[fieldConfig.fieldName] = fieldValue;
      } catch (e) {
        results.errors.push('Record ' + recordNumber + ', Field "' + fieldConfig.fieldName + '": ' + e.toString());
        outputRecord[fieldConfig.fieldName] = '';
      }
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
// OUTPUT GENERATION WITH CUSTOM DELIMITERS
// ============================================================================

/**
 * Escapes a field value for delimited output
 * @param {string} field - The field value
 * @param {string} delimiter - The delimiter character
 * @return {string} Escaped field value
 */
function escapeDelimitedField(field, delimiter) {
  if (field === null || field === undefined) {
    return '';
  }
  
  var str = field.toString();
  
  if (str.indexOf(delimiter) !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  
  return str;
}

/**
 * Generates output with custom delimiter
 * @param {object} results - Processing results
 * @param {string} delimiter - Output delimiter (default: ',')
 * @param {boolean} includeHeader - Include file header (default: true)
 * @param {boolean} includeFooter - Include file footer (default: true)
 * @return {string} Formatted output
 */
function generateDelimitedOutput(results, delimiter, includeHeader, includeFooter) {
  delimiter = delimiter || ',';
  includeHeader = includeHeader !== false;
  includeFooter = includeFooter !== false;
  
  var outputParts = [];
  var timestamp = now();
  
  if (includeHeader) {
    outputParts.push('# Multi-Record Fixed-Length Output\n');
    outputParts.push('# Generated: ' + timestamp + '\n');
    outputParts.push('# Total Records: ' + (results.recordCounts.H + results.recordCounts.L + results.recordCounts.D + results.recordCounts.C) + '\n');
    outputParts.push('#\n');
  }
  
  outputParts.push('=== HEADERS ===\n');
  if (results.Headers.length > 0) {
    var headerKeys = Object.keys(results.Headers[0]);
    var headerRow = [];
    for (var k = 0; k < headerKeys.length; k++) {
      headerRow.push(escapeDelimitedField(headerKeys[k], delimiter));
    }
    outputParts.push(headerRow.join(delimiter) + '\n');
    
    for (var i = 0; i < results.Headers.length; i++) {
      var row = [];
      for (var j = 0; j < headerKeys.length; j++) {
        row.push(escapeDelimitedField(results.Headers[i][headerKeys[j]], delimiter));
      }
      outputParts.push(row.join(delimiter) + '\n');
    }
  }
  
  outputParts.push('\n=== LINE ITEMS ===\n');
  if (results.LineItems.length > 0) {
    var lineKeys = Object.keys(results.LineItems[0]);
    var lineHeaderRow = [];
    for (var k = 0; k < lineKeys.length; k++) {
      lineHeaderRow.push(escapeDelimitedField(lineKeys[k], delimiter));
    }
    outputParts.push(lineHeaderRow.join(delimiter) + '\n');
    
    for (var i = 0; i < results.LineItems.length; i++) {
      var row = [];
      for (var j = 0; j < lineKeys.length; j++) {
        row.push(escapeDelimitedField(results.LineItems[i][lineKeys[j]], delimiter));
      }
      outputParts.push(row.join(delimiter) + '\n');
    }
  }
  
  outputParts.push('\n=== DETAILS ===\n');
  if (results.Details.length > 0) {
    var detailKeys = Object.keys(results.Details[0]);
    var detailHeaderRow = [];
    for (var k = 0; k < detailKeys.length; k++) {
      detailHeaderRow.push(escapeDelimitedField(detailKeys[k], delimiter));
    }
    outputParts.push(detailHeaderRow.join(delimiter) + '\n');
    
    for (var i = 0; i < results.Details.length; i++) {
      var row = [];
      for (var j = 0; j < detailKeys.length; j++) {
        row.push(escapeDelimitedField(results.Details[i][detailKeys[j]], delimiter));
      }
      outputParts.push(row.join(delimiter) + '\n');
    }
  }
  
  outputParts.push('\n=== COMMENTS ===\n');
  if (results.Comments.length > 0) {
    var commentKeys = Object.keys(results.Comments[0]);
    var commentHeaderRow = [];
    for (var k = 0; k < commentKeys.length; k++) {
      commentHeaderRow.push(escapeDelimitedField(commentKeys[k], delimiter));
    }
    outputParts.push(commentHeaderRow.join(delimiter) + '\n');
    
    for (var i = 0; i < results.Comments.length; i++) {
      var row = [];
      for (var j = 0; j < commentKeys.length; j++) {
        row.push(escapeDelimitedField(results.Comments[i][commentKeys[j]], delimiter));
      }
      outputParts.push(row.join(delimiter) + '\n');
    }
  }
  
  if (includeFooter) {
    outputParts.push('\n# Summary:\n');
    outputParts.push('# Headers: ' + results.recordCounts.H + '\n');
    outputParts.push('# Line Items: ' + results.recordCounts.L + '\n');
    outputParts.push('# Details: ' + results.recordCounts.D + '\n');
    outputParts.push('# Comments: ' + results.recordCounts.C + '\n');
    outputParts.push('# Errors: ' + results.errors.length + '\n');
    outputParts.push('# Warnings: ' + results.warnings.length + '\n');
  }
  
  return outputParts.join('');
}

/**
 * Generates separate output for a single record type
 * @param {array} records - Array of records
 * @param {string} recordTypeName - Name of record type
 * @param {string} delimiter - Output delimiter
 * @param {boolean} includeHeader - Include file header
 * @return {string} Formatted output for record type
 */
function generateSeparateOutput(records, recordTypeName, delimiter, includeHeader) {
  delimiter = delimiter || ',';
  includeHeader = includeHeader !== false;
  
  var outputParts = [];
  var timestamp = now();
  
  if (includeHeader) {
    outputParts.push('# ' + recordTypeName + ' Output\n');
    outputParts.push('# Generated: ' + timestamp + '\n');
    outputParts.push('# Record Count: ' + records.length + '\n');
    outputParts.push('#\n');
  }
  
  if (records.length > 0) {
    var keys = Object.keys(records[0]);
    var headerRow = [];
    for (var k = 0; k < keys.length; k++) {
      headerRow.push(escapeDelimitedField(keys[k], delimiter));
    }
    outputParts.push(headerRow.join(delimiter) + '\n');
    
    for (var i = 0; i < records.length; i++) {
      var row = [];
      for (var j = 0; j < keys.length; j++) {
        row.push(escapeDelimitedField(records[i][keys[j]], delimiter));
      }
      outputParts.push(row.join(delimiter) + '\n');
    }
  }
  
  return outputParts.join('');
}

// ============================================================================
// IPA INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Main entry point for IPA workflows
 * Usage: var results = processFixedLengthFile(inputText);
 * @param {string} inputText - The input file content
 * @return {object} Processing results
 */
function processFixedLengthFile(inputText) {
  return processMultiRecordFile(inputText);
}

/**
 * Generates CSV output (default delimiter)
 * Usage: var csv = generateCSV(results);
 * @param {object} results - Processing results
 * @return {string} CSV output
 */
function generateCSV(results) {
  return generateDelimitedOutput(results, ',', true, true);
}

/**
 * Generates pipe-delimited output
 * Usage: var output = generatePipeDelimited(results);
 * @param {object} results - Processing results
 * @return {string} Pipe-delimited output
 */
function generatePipeDelimited(results) {
  return generateDelimitedOutput(results, '|', true, true);
}

/**
 * Generates tab-delimited output
 * Usage: var output = generateTabDelimited(results);
 * @param {object} results - Processing results
 * @return {string} Tab-delimited output
 */
function generateTabDelimited(results) {
  return generateDelimitedOutput(results, '\t', true, true);
}

/**
 * Generates separate CSV files for each record type
 * Usage: var files = generateSeparateFiles(results);
 * Returns: {Headers: string, LineItems: string, Details: string, Comments: string}
 * @param {object} results - Processing results
 * @return {object} Separate outputs by record type
 */
function generateSeparateFiles(results) {
  return {
    Headers: generateSeparateOutput(results.Headers, 'Headers', ',', true),
    LineItems: generateSeparateOutput(results.LineItems, 'Line Items', ',', true),
    Details: generateSeparateOutput(results.Details, 'Details', ',', true),
    Comments: generateSeparateOutput(results.Comments, 'Comments', ',', true)
  };
}
