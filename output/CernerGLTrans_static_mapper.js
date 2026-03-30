// Self-Contained Static Mapper - No external mapping table required
var incrementCounter = 0;

function mapRecord(data, rowIndex) {
  var record = {};

  function safeGet(d, i, f, r) {
    if (i >= d.length) throw new Error('Row ' + (r + 1) + ': Column ' + (i + 1) + ' missing for "' + f + '"');
    return d[i] || '';
  }

  // FinanceEnterpriseGroup
  record["FinanceEnterpriseGroup"] = "1";
  if (!record["FinanceEnterpriseGroup"] || !record["FinanceEnterpriseGroup"].toString().trim()) {
    throw new Error('Required field "FinanceEnterpriseGroup" is blank in row ' + (rowIndex + 1));
  }

  // GLTransactionInterface.RunGroup
  record["GLTransactionInterface.RunGroup"] = safeGet(data, 0, "GLTransactionInterface.RunGroup", rowIndex);
  if (!record["GLTransactionInterface.RunGroup"] || !record["GLTransactionInterface.RunGroup"].toString().trim()) {
    throw new Error('Required field "GLTransactionInterface.RunGroup" is blank in row ' + (rowIndex + 1));
  }

  // GLTransactionInterface.SequenceNumber
  record["GLTransactionInterface.SequenceNumber"] = ++incrementCounter;
  if (!record["GLTransactionInterface.SequenceNumber"] || !record["GLTransactionInterface.SequenceNumber"].toString().trim()) {
    throw new Error('Required field "GLTransactionInterface.SequenceNumber" is blank in row ' + (rowIndex + 1));
  }

  // AccountingEntity
  record["AccountingEntity"] = (data[2] || '').replace(/^0+/, '') || '0';
  if (!record["AccountingEntity"] || !record["AccountingEntity"].toString().trim()) {
    throw new Error('Required field "AccountingEntity" is blank in row ' + (rowIndex + 1));
  }

  // Status
  record["Status"] = "0";

  // ToAccountingEntity
  record["ToAccountingEntity"] = safeGet(data, 2, "ToAccountingEntity", rowIndex);
  if (!record["ToAccountingEntity"] || !record["ToAccountingEntity"].toString().trim()) {
    throw new Error('Required field "ToAccountingEntity" is blank in row ' + (rowIndex + 1));
  }

  // AccountCode
  record["AccountCode"] = (data[4] || '').substring(0, 6);
  if (!record["AccountCode"] || !record["AccountCode"].toString().trim()) {
    throw new Error('Required field "AccountCode" is blank in row ' + (rowIndex + 1));
  }

  // GeneralLedgerEvent
  record["GeneralLedgerEvent"] = (data[5] || '') == '' ? 'TC' : (data[5] || '');

  // JournalCode
  record["JournalCode"] = (function() { var value = data[15]; if (value === null || value === undefined) return ''; return value.toString().trim(); })();

  // TransactionDate
  record["TransactionDate"] = (function(dateStr) { return dateStr && dateStr.length === 8 ? dateStr.substring(4, 8) + dateStr.substring(0, 4) : dateStr; })(data[17] || '');

  // Reference
  record["Reference"] = safeGet(data, 7, "Reference", rowIndex);

  // Description
  record["Description"] = safeGet(data, 8, "Description", rowIndex);

  // CurrencyCode
  record["CurrencyCode"] = safeGet(data, 9, "CurrencyCode", rowIndex);

  // UnitsAmount
  record["UnitsAmount"] = "0";

  // TransactionAmount
  record["TransactionAmount"] = safeGet(data, 11, "TransactionAmount", rowIndex);

  // System
  record["System"] = (data[14] || '') == '' ? 'GL' : (data[14] || '');

  // AutoReverse
  record["AutoReverse"] = (data[16] || '') == '' ? 'N' : (data[16] || '');

  // PostingDate
  record["PostingDate"] = (function(dateStr) { return dateStr && dateStr.length === 8 ? dateStr.substring(4, 8) + dateStr.substring(0, 4) : dateStr; })(data[17] || '');
  if (!record["PostingDate"] || !record["PostingDate"].toString().trim()) {
    throw new Error('Required field "PostingDate" is blank in row ' + (rowIndex + 1));
  }

  // Project
  record["Project"] = safeGet(data, 18, "Project", rowIndex);

  // FinanceDimension1
  record["FinanceDimension1"] = (data[3] || '').slice(-3);

  // FinanceDimension3
  record["FinanceDimension3"] = safeGet(data, 19, "FinanceDimension3", rowIndex);

  // DocumentNumber
  record["DocumentNumber"] = safeGet(data, 20, "DocumentNumber", rowIndex);

  return record;
}

// Fallback function for complex mapping logic
function applyLogic(logic, data, field) {
  if (!logic) return null;
  logic = logic.trim();

  // Handle basic cases that weren't inlined
  if (/^Column(\d+)$/i.test(logic)) {
    var colMatch = logic.match(/^Column(\d+)$/i);
    return data[colMatch[1] - 1] || '';
  }

  // Static values
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }

  // Unquoted static values
  if (!/Column\d+/i.test(logic) && !/^(RemoveLeadingZeroes|Trim|Concat|Split|Sum|If|Today|Now|Increment|DateReformat|Hardcode)/i.test(logic)) {
    return logic;
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

// Usage Instructions for Static Mapper:
// 1. Parse your input data:
// var inputData = parseCSV(yourInputFileContent, ',');
// var dataRows = inputData.slice(0); // Skip 0 rows

// 2. Transform each row:
// var results = dataRows.map(function(row, index) {
//   return mapRecord(row, index);
// });

// 3. Convert to CSV:
// var headers = ['FinanceEnterpriseGroup', 'GLTransactionInterface.RunGroup', 'GLTransactionInterface.SequenceNumber', 'AccountingEntity', 'Status', 'ToAccountingEntity', 'AccountCode', 'GeneralLedgerEvent', 'JournalCode', 'TransactionDate', 'Reference', 'Description', 'CurrencyCode', 'UnitsAmount', 'TransactionAmount', 'System', 'AutoReverse', 'PostingDate', 'Project', 'FinanceDimension1', 'FinanceDimension3', 'DocumentNumber'];
// var csvLines = [headers.join(',')];
// results.forEach(function(r) {
//   var row = headers.map(function(h) {
//     var v = r[h] != null ? r[h].toString() : '';
//     return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
//   });
//   csvLines.push(row.join(','));
// });
// var outputCSV = csvLines.join('\n');
