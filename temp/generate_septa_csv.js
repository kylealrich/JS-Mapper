var fs = require('fs');

// Read input file
var inputData = fs.readFileSync('input/GL_FELA_20210504_Test.txt', 'utf8');
var lines = inputData.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectRecordType(line) {
  var indicator = line.substring(0, 2);
  if (indicator === 'PT') return 'Detail';
  if (indicator === 'BT') return 'Trailer';
  if (line.charAt(0) === 'B') return 'Header';
  return null;
}

function mapHeader(line) {
  var record = {};
  var v;

  v = line.substring(0, 2).replace(/ +$/, '');
  if (v === '') v = 'BH';
  record['Transaction Code'] = v;

  v = line.substring(2, 6).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company ID'] = v;

  v = line.substring(6, 8).replace(/ +$/, '');
  record['Application Area'] = v;

  v = line.substring(8, 10).replace(/^0+/, '');
  if (v === '') v = '01';
  record['Batch Number'] = v;

  v = line.substring(10, 11).replace(/ +$/, '');
  if (v === '') v = '2';
  record['Data Type Code'] = v;

  v = line.substring(11, Math.min(25, line.length)).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Batch Total'] = v;

  v = (line.length >= 26) ? line.substring(25, 26).replace(/ +$/, '') : '';
  if (v === '') v = '0';
  record['Closed For Adjustment'] = v;

  v = (line.length >= 27) ? line.substring(26, Math.min(34, line.length)).replace(/0+$/, '') : '';
  record['Effective Date'] = v;

  return record;
}

function mapDetail(line) {
  var record = {};
  var v;

  v = line.substring(0, 2).replace(/ +$/, '');
  if (v === '') v = 'PT';
  record['Transaction Code'] = v;

  v = line.substring(2, 6).replace(/^0+/, '');
  if (v === '') v = '0000';
  record['Item'] = v;

  v = line.substring(6, 7).replace(/ +$/, '');
  if (v === '') v = '1';
  record['Trans ID'] = v;

  v = line.substring(7, 9).replace(/^0+/, '');
  if (v === '') v = '0';
  record['DRCR Code'] = v;

  v = line.substring(9, 13).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company ID'] = v;

  v = line.substring(25, 31).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Account'] = v;

  v = line.substring(34, 39).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Mgmt Center'] = v;

  v = line.substring(39, 43).replace(/^0+/, '');
  if (v === '') v = '0000';
  record['Cost Center'] = v;

  v = line.substring(43, 47).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Source Code'] = v;

  v = line.substring(47, 53).replace(/0+$/, '');
  record['Source Date'] = v;

  v = line.substring(53, 61).replace(/0+$/, '');
  record['Effective Date'] = v;

  v = line.substring(61, 74).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Amount'] = v;

  v = (line.length >= 75) ? line.substring(74, Math.min(129, line.length)).replace(/ +$/, '') : '';
  record['Description'] = v;

  v = (line.length >= 130) ? line.substring(129, Math.min(138, line.length)).replace(/^0+/, '') : '';
  v = v.trim();
  // Apply RemoveLeadingZeroes (if value has leading zeros after pad strip)
  if (v !== '') {
    v = v.replace(/^0+/, '') || '0';
  }
  record['Fund Serial'] = v;

  return record;
}

function mapTrailer(line) {
  var record = {};
  var v;

  v = line.substring(0, 2).replace(/ +$/, '');
  if (v === '') v = 'BT';
  record['Transaction Code'] = v;

  v = line.substring(2, 6).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company ID'] = v;

  v = line.substring(6, Math.min(8, line.length)).replace(/ +$/, '');
  record['Application Area'] = v;

  v = (line.length >= 9) ? line.substring(8, Math.min(10, line.length)).replace(/^0+/, '') : '';
  if (v === '') v = '01';
  record['Batch Number'] = v;

  v = (line.length >= 11) ? line.substring(10, 11).replace(/ +$/, '') : '';
  if (v === '') v = '2';
  record['Data Type Code'] = v;

  v = (line.length >= 12) ? line.substring(11, Math.min(25, line.length)).replace(/^0+/, '') : '';
  if (v === '') v = '0';
  record['Batch Total'] = v;

  return record;
}

var headerHeaders = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number', 'Data Type Code', 'Batch Total', 'Closed For Adjustment', 'Effective Date'];
var detailHeaders = ['Transaction Code', 'Item', 'Trans ID', 'DRCR Code', 'Company ID', 'Account', 'Mgmt Center', 'Cost Center', 'Source Code', 'Source Date', 'Effective Date', 'Amount', 'Description', 'Fund Serial'];
var trailerHeaders = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number', 'Data Type Code', 'Batch Total'];

var resultsByType = { Header: [], Detail: [], Trailer: [] };

lines.forEach(function(line, index) {
  var type = detectRecordType(line);
  if (type === 'Header') {
    resultsByType.Header.push(mapHeader(line));
  } else if (type === 'Detail') {
    resultsByType.Detail.push(mapDetail(line));
  } else if (type === 'Trailer') {
    resultsByType.Trailer.push(mapTrailer(line));
  }
});

function buildCSV(headers, rows) {
  var csvLines = [headers.join(',')];
  rows.forEach(function(r) {
    var row = headers.map(function(h) {
      var v = r[h] != null ? r[h].toString() : '';
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    });
    csvLines.push(row.join(','));
  });
  return csvLines.join('\n');
}

var headersCSV = buildCSV(headerHeaders, resultsByType.Header);
var detailsCSV = buildCSV(detailHeaders, resultsByType.Detail);
var trailersCSV = buildCSV(trailerHeaders, resultsByType.Trailer);

fs.writeFileSync('output/GL_FELA_20210504_Test_Headers_Mapped.csv', headersCSV);
fs.writeFileSync('output/GL_FELA_20210504_Test_Details_Mapped.csv', detailsCSV);
fs.writeFileSync('output/GL_FELA_20210504_Test_Trailers_Mapped.csv', trailersCSV);

console.log('Headers: ' + resultsByType.Header.length + ' rows');
console.log('Details: ' + resultsByType.Detail.length + ' rows');
console.log('Trailers: ' + resultsByType.Trailer.length + ' rows');
console.log('CSV files generated successfully.');

// Also output first header and first detail for verification
console.log('\nFirst Header:', JSON.stringify(resultsByType.Header[0]));
console.log('First Detail:', JSON.stringify(resultsByType.Detail[0]));
console.log('Last Detail:', JSON.stringify(resultsByType.Detail[resultsByType.Detail.length - 1]));
console.log('Trailer:', JSON.stringify(resultsByType.Trailer[0]));
