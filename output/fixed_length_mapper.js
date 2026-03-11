// OMRQ Multi-Record Fixed-Length Mapper - Runtime Flexible
// Generated: 2025-03-11
// Input: omrq.bcs.20250405101502.txt
// Generation Type: Runtime Flexible (Dynamic)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function removeLeadingZeroes(value) {
  if (!value) return '';
  var result = value.replace(/^0+/, '');
  return result || '0';
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
// TRANSFORMATION LOGIC
// ============================================================================

function applyMappingLogic(logic, value) {
  if (!logic || logic.trim() === '') {
    return value;
  }
  
  var trimmedLogic = logic.trim();
  
  if (/^RemoveLeadingZeroes\(/i.test(trimmedLogic)) {
    return removeLeadingZeroes(value);
  }
  
  return value;
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
      {fieldName: 'Company', start: 2, end: 5, required: 'Y', logic: 'RemoveLeadingZeroes(Column2)', justify: 'right'},
      {fieldName: 'Req Number', start: 6, end: 12, required: 'Y', logic: 'RemoveLeadingZeroes(Column3)', justify: 'right'},
      {fieldName: 'Line Number', start: 13, end: 18, required: 'N', logic: '', justify: 'right'},
      {fieldName: 'Requester', start: 19, end: 28, required: 'Y', logic: ''},
      {fieldName: 'Req Location', start: 29, end: 33, required: 'Y', logic: ''},
      {fieldName: 'Req Del Date', start: 34, end: 41, required: 'Y', logic: ''},
      {fieldName: 'Creation Date', start: 42, end: 49, required: 'N', logic: ''},
      {fieldName: 'From Company', start: 50, end: 53, required: 'N', logic: 'RemoveLeadingZeroes(Column9)', justify: 'right'},
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
// MULTI-RECORD PROCESSOR
// ============================================================================

function getRecordLength(recordType) {
  var config = recordTypeConfig[recordType];
  if (!config || !config.mappingConfig || config.mappingConfig.length === 0) {
    return 0;
  }
  
  var maxEnd = 0;
  for (var i = 0; i < config.mappingConfig.length; i++) {
    var end = parseInt(config.mappingConfig[i].end);
    if (end > maxEnd) {
      maxEnd = end;
    }
  }
  
  return maxEnd;
}

function processMultiRecordFile(inputText) {
  var results = {
    Headers: [],
    LineItems: [],
    Details: [],
    Comments: []
  };
  
  var position = 0;
  
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
        fieldValue = applyMappingLogic(fieldConfig.logic, fieldValue);
      }
      
      if ((!fieldValue || fieldValue === '') && fieldConfig.defaultValue) {
        fieldValue = fieldConfig.defaultValue;
      }
      
      outputRecord[fieldConfig.fieldName] = fieldValue;
    }
    
    if (recordType === 'H') {
      results.Headers.push(outputRecord);
    } else if (recordType === 'L') {
      results.LineItems.push(outputRecord);
    } else if (recordType === 'D') {
      results.Details.push(outputRecord);
    } else if (recordType === 'C') {
      results.Comments.push(outputRecord);
    }
  }
  
  return results;
}

// ============================================================================
// CSV OUTPUT GENERATION
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
  var output = '';
  
  output += '=== HEADERS ===\n';
  if (results.Headers.length > 0) {
    var headerKeys = Object.keys(results.Headers[0]);
    output += headerKeys.map(escapeCSVField).join(',') + '\n';
    
    for (var i = 0; i < results.Headers.length; i++) {
      var row = [];
      for (var j = 0; j < headerKeys.length; j++) {
        row.push(escapeCSVField(results.Headers[i][headerKeys[j]]));
      }
      output += row.join(',') + '\n';
    }
  }
  
  output += '\n=== LINE ITEMS ===\n';
  if (results.LineItems.length > 0) {
    var lineKeys = Object.keys(results.LineItems[0]);
    output += lineKeys.map(escapeCSVField).join(',') + '\n';
    
    for (var i = 0; i < results.LineItems.length; i++) {
      var row = [];
      for (var j = 0; j < lineKeys.length; j++) {
        row.push(escapeCSVField(results.LineItems[i][lineKeys[j]]));
      }
      output += row.join(',') + '\n';
    }
  }
  
  output += '\n=== DETAILS ===\n';
  if (results.Details.length > 0) {
    var detailKeys = Object.keys(results.Details[0]);
    output += detailKeys.map(escapeCSVField).join(',') + '\n';
    
    for (var i = 0; i < results.Details.length; i++) {
      var row = [];
      for (var j = 0; j < detailKeys.length; j++) {
        row.push(escapeCSVField(results.Details[i][detailKeys[j]]));
      }
      output += row.join(',') + '\n';
    }
  }
  
  output += '\n=== COMMENTS ===\n';
  if (results.Comments.length > 0) {
    var commentKeys = Object.keys(results.Comments[0]);
    output += commentKeys.map(escapeCSVField).join(',') + '\n';
    
    for (var i = 0; i < results.Comments.length; i++) {
      var row = [];
      for (var j = 0; j < commentKeys.length; j++) {
        row.push(escapeCSVField(results.Comments[i][commentKeys[j]]));
      }
      output += row.join(',') + '\n';
    }
  }
  
  return output;
}
