// Auto-generated Self Contained Mapper
// Generated: 2026-03-21 23:19:32
// Type: Delimited
// Records: 645

function mapRecord(data, rowIndex) {
  var record = {};
  record['FinanceEnterpriseGroup'] = applyLogic('Hardcode \'1\'', data, 'FinanceEnterpriseGroup', rowIndex);
  record['GLTransactionInterface.RunGroup'] = data[0] || '';
  record['GLTransactionInterface.SequenceNumber'] = applyLogic('Increment By 1', data, 'GLTransactionInterface.SequenceNumber', rowIndex);
  record['AccountingEntity'] = applyLogic('RemoveLeadingZeroes(Column3)', data, 'AccountingEntity', rowIndex);
  record['Status'] = applyLogic('Hardcode \'0\'', data, 'Status', rowIndex);
  record['ToAccountingEntity'] = data[2] || '';
  record['AccountCode'] = applyLogic('Left(Column5,6)', data, 'AccountCode', rowIndex);
  record['GeneralLedgerEvent'] = applyLogic('If Column6 == \'\' Then \'TC\' Else Column6', data, 'GeneralLedgerEvent', rowIndex);
  record['JournalCode'] = applyLogic('Trim(Column16)', data, 'JournalCode', rowIndex);
  record['TransactionDate'] = applyLogic('DateReformat(Column18,\'MMDDYYYY\',\'YYYYMMDD\')', data, 'TransactionDate', rowIndex);
  record['Reference'] = data[7] || '';
  record['Description'] = data[8] || '';
  record['CurrencyCode'] = data[9] || '';
  record['UnitsAmount'] = applyLogic('\'0\'', data, 'UnitsAmount', rowIndex);
  record['TransactionAmount'] = data[11] || '';
  record['System'] = applyLogic('If Column15 == \'\' Then \'GL\' Else Column15', data, 'System', rowIndex);
  record['AutoReverse'] = applyLogic('If Column17 == \'\' Then \'N\' Else Column17', data, 'AutoReverse', rowIndex);
  record['PostingDate'] = applyLogic('DateReformat(Column18,\'MMDDYYYY\',\'YYYYMMDD\')', data, 'PostingDate', rowIndex);
  record['Project'] = data[18] || '';
  record['FinanceDimension1'] = applyLogic('Right(Column4,3)', data, 'FinanceDimension1', rowIndex);
  record['FinanceDimension3'] = data[19] || '';
  record['DocumentNumber'] = data[20] || '';
  return record;
}

var incrementCounter = 0;

function applyLogic(logic, data, field, rowIndex) {
  if (!logic) return null;
  logic = logic.trim();
  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return String(incrementCounter); }
  if (/^Hardcode\s+['"](.*)['"]/i.test(logic)) { return logic.match(/^Hardcode\s+['"](.*)['"]/i)[1]; }
  if (/^['"].*['"]$/.test(logic)) { return logic.slice(1, -1); }
  var col = logic.match(/^Column(\d+)$/i);
  if (col) return (data[col[1]-1] || '');
  if (/^RemoveLeadingZeroes\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').replace(/^0+/,'')||'0'; }
  if (/^RemoveTrailingSpaces\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').replace(/\s+$/,''); }
  if (/^Trim\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').trim(); }
  if (/^Uppercase\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').toUpperCase(); }
  if (/^Lowercase\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return (data[c[1]-1]||'').toLowerCase(); }
  if (/^Left\(/i.test(logic)) { var m=logic.match(/Left\(Column(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').substring(0,parseInt(m[2])); }
  if (/^Right\(/i.test(logic)) { var m=logic.match(/Right\(Column(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').slice(-parseInt(m[2])); }
  if (/^Concat\(/i.test(logic)) { var cs=logic.match(/Column(\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\d+/)[0];return data[n-1]||'';}).join(''); }
  if (/^DateReformat\(/i.test(logic)) { var m=logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i); if(m){var d=data[m[1]-1]||'';if(m[2].toUpperCase()==='MMDDYYYY'&&m[3].toUpperCase()==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);return d;} }
  if (/^Today\(/i.test(logic)) { var d=new Date(); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); }
  if (/^Now\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }
  if (!/Column\d+/i.test(logic)) return logic;
  return null;
}

var MAPPING_RULES = [{'field': 'FinanceEnterpriseGroup', 'logic': "Hardcode '1'", 'colNum': null, 'start': null, 'end': null}, {'field': 'GLTransactionInterface.RunGroup', 'logic': '', 'colNum': 0, 'start': null, 'end': null}, {'field': 'GLTransactionInterface.SequenceNumber', 'logic': 'Increment By 1', 'colNum': null, 'start': null, 'end': null}, {'field': 'AccountingEntity', 'logic': 'RemoveLeadingZeroes(Column3)', 'colNum': null, 'start': null, 'end': null}, {'field': 'Status', 'logic': "Hardcode '0'", 'colNum': null, 'start': null, 'end': null}, {'field': 'ToAccountingEntity', 'logic': '', 'colNum': 2, 'start': null, 'end': null}, {'field': 'AccountCode', 'logic': 'Left(Column5,6)', 'colNum': null, 'start': null, 'end': null}, {'field': 'GeneralLedgerEvent', 'logic': "If Column6 == '' Then 'TC' Else Column6", 'colNum': null, 'start': null, 'end': null}, {'field': 'JournalCode', 'logic': 'Trim(Column16)', 'colNum': null, 'start': null, 'end': null}, {'field': 'TransactionDate', 'logic': "DateReformat(Column18,'MMDDYYYY','YYYYMMDD')", 'colNum': null, 'start': null, 'end': null}, {'field': 'Reference', 'logic': '', 'colNum': 7, 'start': null, 'end': null}, {'field': 'Description', 'logic': '', 'colNum': 8, 'start': null, 'end': null}, {'field': 'CurrencyCode', 'logic': '', 'colNum': 9, 'start': null, 'end': null}, {'field': 'UnitsAmount', 'logic': "'0'", 'colNum': null, 'start': null, 'end': null}, {'field': 'TransactionAmount', 'logic': '', 'colNum': 11, 'start': null, 'end': null}, {'field': 'System', 'logic': "If Column15 == '' Then 'GL' Else Column15", 'colNum': null, 'start': null, 'end': null}, {'field': 'AutoReverse', 'logic': "If Column17 == '' Then 'N' Else Column17", 'colNum': null, 'start': null, 'end': null}, {'field': 'PostingDate', 'logic': "DateReformat(Column18,'MMDDYYYY','YYYYMMDD')", 'colNum': null, 'start': null, 'end': null}, {'field': 'Project', 'logic': '', 'colNum': 18, 'start': null, 'end': null}, {'field': 'FinanceDimension1', 'logic': 'Right(Column4,3)', 'colNum': null, 'start': null, 'end': null}, {'field': 'FinanceDimension3', 'logic': '', 'colNum': 19, 'start': null, 'end': null}, {'field': 'DocumentNumber', 'logic': '', 'colNum': 20, 'start': null, 'end': null}];

var HEADERS = ['FinanceEnterpriseGroup', 'GLTransactionInterface.RunGroup', 'GLTransactionInterface.SequenceNumber', 'AccountingEntity', 'Status', 'ToAccountingEntity', 'AccountCode', 'GeneralLedgerEvent', 'JournalCode', 'TransactionDate', 'Reference', 'Description', 'CurrencyCode', 'UnitsAmount', 'TransactionAmount', 'System', 'AutoReverse', 'PostingDate', 'Project', 'FinanceDimension1', 'FinanceDimension3', 'DocumentNumber'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mapRecord:mapRecord, applyLogic:applyLogic, MAPPING_RULES:MAPPING_RULES, HEADERS:HEADERS };
}