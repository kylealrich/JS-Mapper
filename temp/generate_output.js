var fs = require('fs');
var inputText = fs.readFileSync('input/CernerGLTrans.txt', 'utf8');
var mappingText = fs.readFileSync('input/CernerGL_MappingTable.csv', 'utf8');

function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === delimiter && !inQuotes) { result.push(current); current = ''; }
      else { current += char; }
    }
    result.push(current);
    return result;
  });
}

var mappingRows = parseCSV(mappingText, ',');
var mappingHeaders = mappingRows[0].map(function(h) { return h.replace(/\s+/g, '').trim().toLowerCase(); });
var rules = [];
var headers = [];
for (var i = 1; i < mappingRows.length; i++) {
  var obj = {};
  for (var j = 0; j < mappingHeaders.length; j++) { obj[mappingHeaders[j]] = (mappingRows[i][j] || '').trim(); }
  var field = obj['targetfieldname'] || '';
  if (!field) continue;
  rules.push({ field: field, logic: obj['mappinglogic'] || '', colNum: obj['inputcolumnnumber'] ? parseInt(obj['inputcolumnnumber']) - 1 : null, required: (obj['required'] || '').toUpperCase() === 'Y' });
  headers.push(field);
}

var incrementCounter = 0;
function applyLogic(logic, data) {
  if (!logic) return null;
  logic = logic.trim();
  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return incrementCounter; }
  var hm = logic.match(/^Hardcode\s+['"](.*)['"]$/i);
  if (hm) { return hm[1]; }
  if (/^RemoveLeadingZeroes\(/i.test(logic)) { var col = logic.match(/Column(\d+)/i); if (col) return (data[col[1]-1] || '').replace(/^0+/, '') || '0'; }
  if (/^Trim\(/i.test(logic)) { var col = logic.match(/Column(\d+)/i); if (col) return (data[col[1]-1] || '').trim(); }
  if (/^Left\(/i.test(logic)) { var m = logic.match(/Left\(Column(\d+),\s*(\d+)\)/i); if (m) return (data[m[1]-1] || '').substring(0, parseInt(m[2])); }
  if (/^Right\(/i.test(logic)) { var m = logic.match(/Right\(Column(\d+),\s*(\d+)\)/i); if (m) return (data[m[1]-1] || '').slice(-parseInt(m[2])); }
  if (/^DateReformat\(/i.test(logic)) {
    var m = logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i);
    if (m) {
      var d = data[m[1]-1] || '';
      if (m[2].toUpperCase() === 'MMDDYYYY' && m[3].toUpperCase() === 'YYYYMMDD' && d.length === 8) {
        return d.substring(4, 8) + d.substring(0, 4);
      }
      return d;
    }
  }
  if (/^If\s/i.test(logic)) {
    var sm = logic.match(/If\s+([^!=<>]+)\s*(==?|!=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);
    if (sm) {
      var ref = sm[1].trim();
      if (/Column(\d+)/i.test(ref)) { var cn = ref.match(/Column(\d+)/i)[1]; ref = data[cn - 1] || ''; }
      var op = sm[2]; var cv = sm[3]; var tr = sm[4]; var er = sm[5] || '';
      if (/Column(\d+)/i.test(tr)) { tr = data[tr.match(/Column(\d+)/i)[1] - 1] || ''; }
      if (/Column(\d+)/i.test(er)) { er = data[er.match(/Column(\d+)/i)[1] - 1] || ''; }
      var cond = (op === '==' || op === '=') ? ref == cv : ref != cv;
      return cond ? tr : er;
    }
  }
  if (/^['"].*['"]$/.test(logic)) return logic.slice(1, -1);
  var cm = logic.match(/^Column(\d+)$/i);
  if (cm) return data[cm[1] - 1] || '';
  return null;
}

var inputData = parseCSV(inputText, ',');
var results = [];
for (var r = 0; r < inputData.length; r++) {
  var data = inputData[r];
  var record = {};
  for (var ri = 0; ri < rules.length; ri++) {
    var rule = rules[ri];
    var value;
    if (rule.logic && rule.logic.trim()) { value = applyLogic(rule.logic, data); }
    else if (rule.colNum !== null) { value = data[rule.colNum] || ''; }
    else { value = null; }
    record[rule.field] = value;
  }
  results.push(record);
}

var csvLines = [headers.join(',')];
results.forEach(function(rec) {
  var row = headers.map(function(h) {
    var v = rec[h] != null ? rec[h].toString() : '';
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  });
  csvLines.push(row.join(','));
});
var csvOutput = csvLines.join('\n');
fs.writeFileSync('output/CernerGLTrans_Mapped.csv', csvOutput);
console.log('Rows processed: ' + results.length);
console.log('First row:');
console.log(JSON.stringify(results[0], null, 2));
console.log('Last row:');
console.log(JSON.stringify(results[results.length - 1], null, 2));
