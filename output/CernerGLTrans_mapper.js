// Cerner GL Transaction Mapper - Generated Mapper Function
// Generated: 2025-03-01
// Input: CernerGLTrans_20251025.txt
// Mapping: CernerGL_MappingTable.csv

// Global counter for increment functionality
var incrementCounter = 0;

/**
 * Map a single Cerner GL transaction record
 * @param {Array} data - Input data row (array of values)
 * @param {Number} rowIndex - Row index for tracking
 * @returns {Object} Mapped record object
 */
function mapCernerGLRecord(data, rowIndex) {
  var record = {};
  
  // FinanceEnterpriseGroup - Hardcode '1'
  record.FinanceEnterpriseGroup = '1';
  
  // GLTransactionInterface.RunGroup - Column1
  record['GLTransactionInterface.RunGroup'] = data[0] || '';
  
  // GLTransactionInterface.SequenceNumber - Increment By 1
  incrementCounter++;
  record['GLTransactionInterface.SequenceNumber'] = incrementCounter;
  
  // AccountingEntity - RemoveLeadingZeroes(Column3)
  record.AccountingEntity = (data[2] || '').replace(/^0+/, '') || '0';
  
  // Status - Hardcode '0'
  record.Status = '0';
  
  // ToAccountingEntity - Column3
  record.ToAccountingEntity = data[2] || '';
  
  // AccountCode - Left(Column5,6)
  record.AccountCode = (data[4] || '').substring(0, 6);
  
  // GeneralLedgerEvent - If Column6 == '' Then 'TC' Else Column6
  record.GeneralLedgerEvent = (data[5] || '') === '' ? 'TC' : data[5];
  
  // JournalCode - Trim(Column16)
  record.JournalCode = (data[15] || '').trim();
  
  // TransactionDate - DateReformat(Column18,'MMDDYYYY','YYYYMMDD')
  var transDate = data[17] || '';
  if (transDate.length === 8) {
    record.TransactionDate = transDate.substring(4, 8) + transDate.substring(0, 4);
  } else {
    record.TransactionDate = transDate;
  }
  
  // Reference - Column8
  record.Reference = data[7] || '';
  
  // Description - Column9
  record.Description = data[8] || '';
  
  // CurrencyCode - Column10
  record.CurrencyCode = data[9] || '';
  
  // UnitsAmount - '0'
  record.UnitsAmount = '0';
  
  // TransactionAmount - Column12
  record.TransactionAmount = data[11] || '';
  
  // System - If Column15 == '' Then 'GL' Else Column15
  record.System = (data[14] || '') === '' ? 'GL' : data[14];
  
  // AutoReverse - If Column17 == '' Then 'N' Else Column17
  record.AutoReverse = (data[16] || '') === '' ? 'N' : data[16];
  
  // PostingDate - DateReformat(Column18,'MMDDYYYY','YYYYMMDD')
  var postDate = data[17] || '';
  if (postDate.length === 8) {
    record.PostingDate = postDate.substring(4, 8) + postDate.substring(0, 4);
  } else {
    record.PostingDate = postDate;
  }
  
  // Project - Column19
  record.Project = data[18] || '';
  
  // FinanceDimension1 - Right(Column4,3)
  record.FinanceDimension1 = (data[3] || '').slice(-3);
  
  // FinanceDimension3 - Column20
  record.FinanceDimension3 = data[19] || '';
  
  // DocumentNumber - Column21
  record.DocumentNumber = data[20] || '';
  
  return record;
}

/**
 * Process multiple records
 * @param {Array} inputData - Array of input data rows
 * @returns {Array} Array of mapped records
 */
function processCernerGLData(inputData) {
  incrementCounter = 0;
  var results = [];
  
  for (var i = 0; i < inputData.length; i++) {
    results.push(mapCernerGLRecord(inputData[i], i));
  }
  
  return results;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mapCernerGLRecord: mapCernerGLRecord,
    processCernerGLData: processCernerGLData
  };
}
