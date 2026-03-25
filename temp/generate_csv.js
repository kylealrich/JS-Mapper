var fs = require('fs');
var data = fs.readFileSync('input/GL_FELA_20210504_Test.txt', 'utf8');
var lines = data.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });

function detectRecordType(line) {
  var indicator = line.substring(0, 2);
  if (indicator === 'PT') return 'Detail';
  if (indicator === 'BT') return 'Trailer';
  if (line.charAt(0) === 'B') return 'Header';
  return null;
}

var headerHeaders = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number', 'Data Type Code', 'Batch Total', 'Closed For Adjustment', 'Effective Date'];
var detailHeaders = ['Transaction Code', 'Item', 'Trans ID', 'DRCR Code', 'Company ID', 'Account', 'Mgmt Center', 'Cost Center', 'Source Code', 'Source Date', 'Effective Date', 'Amount', 'Description', 'Fund Serial'];
var trailerHeaders = ['Transaction Code', 'Company ID', 'Application Area', 'Batch Number', 'Data Type Code', 'Batch Total'];

var headerRows = [];
var detailRows = [];
var trailerRows = [];

lines.forEach(function(line, idx) {
  var type = detectRecordType(line);
  if (type === 'Header') {
    var r = {};
    r['Transaction Code'] = line.substring(0, 2).replace(/ +$/, '') || 'BH';
    var cid = line.substring(2, 6).replace(/^0+/, ''); r['Company ID'] = cid || '0';
    r['Application Area'] = line.substring(6, 8).replace(/ +$/, '');
    var bn = line.substring(8, 10).replace(/^0+/, ''); r['Batch Number'] = bn || '01';
    var dtc = line.substring(10, 11).replace(/ +$/, ''); r['Data Type Code'] = dtc || '2';
    var bt = line.substring(11, 25).replace(/^0+/, ''); r['Batch Total'] = bt || '0';
    var ca = line.substring(25, 26).replace(/ +$/, ''); r['Closed For Adjustment'] = ca || '0';
    r['Effective Date'] = line.substring(26, 34).replace(/0+$/, '');
    headerRows.push(r);
  } else if (type === 'Detail') {
    var r = {};
    r['Transaction Code'] = line.substring(0, 2).replace(/ +$/, '') || 'PT';
    var item = line.substring(2, 6).replace(/^0+/, ''); r['Item'] = item || '0000';
    var tid = line.substring(6, 7).replace(/ +$/, ''); r['Trans ID'] = tid || '1';
    var drcr = line.substring(7, 9).replace(/^0+/, ''); r['DRCR Code'] = drcr || '0';
    var cid2 = line.substring(9, 13).replace(/^0+/, ''); r['Company ID'] = cid2 || '0';
    var acct = line.substring(25, 31).replace(/^0+/, ''); r['Account'] = acct || '0';
    var mc = line.substring(34, 39).replace(/^0+/, ''); r['Mgmt Center'] = mc || '0';
    var cc = line.substring(39, 43).replace(/^0+/, ''); r['Cost Center'] = cc || '0000';
    var sc = line.substring(43, 47).replace(/^0+/, ''); r['Source Code'] = sc || '0';
    r['Source Date'] = line.substring(47, 53).replace(/0+$/, '');
    r['Effective Date'] = line.substring(53, 61).replace(/0+$/, '');
    var amt = line.substring(61, 74).replace(/^0+/, ''); r['Amount'] = amt || '0';
    r['Description'] = line.substring(74, Math.min(129, line.length)).replace(/ +$/, '');
    var fs2 = line.length >= 130 ? line.substring(129, Math.min(138, line.length)).replace(/^0+/, '') : '';
    r['Fund Serial'] = fs2;
    detailRows.push(r);
  } else if (type === 'Trailer') {
    var r = {};
    r['Transaction Code'] = line.substring(0, 2).replace(/ +$/, '') || 'BT';
    var cid3 = line.substring(2, 6).replace(/^0+/, ''); r['Company ID'] = cid3 || '0';
    r['Application Area'] = line.substring(6, 8).replace(/ +$/, '');
    var bn2 = line.substring(8, 10).replace(/^0+/, ''); r['Batch Number'] = bn2 || '01';
    var dtc2 = line.substring(10, 11).replace(/ +$/, ''); r['Data Type Code'] = dtc2 || '2';
    var bt2 = line.substring(11, Math.min(25, line.length)).replace(/^0+/, ''); r['Batch Total'] = bt2 || '0';
    trailerRows.push(r);
  }
});

function toCSV(headers, rows) {
  var csvLines = [headers.join(',')];
  rows.forEach(function(r) {
    var row = headers.map(function(h) {
      var v = r[h] != null ? r[h].toString() : '';
      if (/[",\n]/.test(v)) {
        return '"' + v.replace(/"/g, '""') + '"';
      }
      return v;
    });
    csvLines.push(row.join(','));
  });
  return csvLines.join('\n');
}

fs.writeFileSync('output/GL_FELA_20210504_Test_Headers_Mapped.csv', toCSV(headerHeaders, headerRows));
fs.writeFileSync('output/GL_FELA_20210504_Test_Details_Mapped.csv', toCSV(detailHeaders, detailRows));
fs.writeFileSync('output/GL_FELA_20210504_Test_Trailers_Mapped.csv', toCSV(trailerHeaders, trailerRows));

console.log('Headers: ' + headerRows.length + ' rows');
console.log('Details: ' + detailRows.length + ' rows');
console.log('Trailers: ' + trailerRows.length + ' rows');
console.log('Total: ' + lines.length + ' lines');

// Print first header row for verification
if (headerRows.length > 0) {
  console.log('\nHeader sample:');
  console.log(JSON.stringify(headerRows[0], null, 2));
}
// Print first detail row for verification
if (detailRows.length > 0) {
  console.log('\nDetail sample:');
  console.log(JSON.stringify(detailRows[0], null, 2));
}
// Print first trailer row for verification
if (trailerRows.length > 0) {
  console.log('\nTrailer sample:');
  console.log(JSON.stringify(trailerRows[0], null, 2));
}
