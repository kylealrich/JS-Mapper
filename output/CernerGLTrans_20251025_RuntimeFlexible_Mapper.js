// Auto-generated Runtime Flexible Mapper
// Generated: 2026-03-21 23:19:32
// Type: Delimited

var fs = require('fs');

// CSV Parser
function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = []; var current = ''; var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === delimiter && !inQuotes) { result.push(current); current = ''; }
      else { current += ch; }
    }
    result.push(current); return result;
  });
}

function normalizeKey(k) { return k.replace(/\s+/g, '').trim().toLowerCase(); }

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
  if (/^Substring\(/i.test(logic)) { var m=logic.match(/Substring\(Column(\d+),\s*(\d+),\s*(\d+)\)/i); if(m) return (data[m[1]-1]||'').substring(parseInt(m[2])-1,parseInt(m[2])-1+parseInt(m[3])); }
  if (/^Concat\(/i.test(logic)) { var cs=logic.match(/Column(\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\d+/)[0];return data[n-1]||'';}).join(''); }
  if (/^Replace\(/i.test(logic)) { var m=logic.match(/Replace\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i); if(m) return (data[m[1]-1]||'').split(m[2]).join(m[3]); }
  if (/^PadLeft\(/i.test(logic)) { var m=logic.match(/PadLeft\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=m[3]+v;return v;} }
  if (/^PadRight\(/i.test(logic)) { var m=logic.match(/PadRight\(Column(\d+),\s*(\d+),\s*'([^']*)'\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=v+m[3];return v;} }
  if (/^Sum\(/i.test(logic)) { var cs=logic.match(/Column(\d+)/gi); if(cs){var t=0;cs.forEach(function(c){var n=c.match(/\d+/)[0];t+=parseFloat(data[n-1]||'0')||0;});return String(t);} }
  if (/^Multiply\(/i.test(logic)) { var m=logic.match(/Multiply\(Column(\d+),\s*Column(\d+)\)/i); if(m) return String((parseFloat(data[m[1]-1])||0)*(parseFloat(data[m[2]-1])||0)); }
  if (/^Divide\(/i.test(logic)) { var m=logic.match(/Divide\(Column(\d+),\s*Column(\d+)\)/i); if(m){var b=parseFloat(data[m[2]-1])||0;return b!==0?String((parseFloat(data[m[1]-1])||0)/b):'0';} }
  if (/^Round\(/i.test(logic)) { var m=logic.match(/Round\(Column(\d+),\s*(\d+)\)/i); if(m) return String(parseFloat((parseFloat(data[m[1]-1])||0).toFixed(parseInt(m[2])))); }
  if (/^Abs\(/i.test(logic)) { var c=logic.match(/Column(\d+)/i); if(c) return String(Math.abs(parseFloat(data[c[1]-1])||0)); }
  if (/^DateReformat\(/i.test(logic)) { var m=logic.match(/DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)/i); if(m){var d=(data[m[1]-1]||'').trim();var inf=m[2].toUpperCase();var outf=m[3].toUpperCase();if(inf==='MMDDYYYY'&&outf==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MMDDYYYY'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MM/DD/YYYY'&&d.length===8)return d.substring(4,6)+'/'+d.substring(6,8)+'/'+d.substring(0,4);return d;} }
  if (/^Today\(/i.test(logic)) { var d=new Date();function pad(n){return n<10?'0'+n:n;}var fm=logic.match(/Today\('([^']*)'\)/i);if(fm){var fmt=fm[1].toUpperCase();if(fmt==='YYYYMMDD')return d.getFullYear()+''+pad(d.getMonth()+1)+pad(d.getDate());if(fmt==='YYYY-MM-DD')return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());if(fmt==='MM/DD/YYYY')return pad(d.getMonth()+1)+'/'+pad(d.getDate())+'/'+d.getFullYear();}return d.toLocaleDateString('en-US'); }
  if (/^Now\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }
  if (/^If\s/i.test(logic)) { var sm=logic.match(/If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?(?:\s+Else\s+'?([^'\s]+)'?)?/i);if(sm){var cr=sm[1].trim();var colR=cr.match(/Column(\d+)/i);if(colR)cr=data[colR[1]-1]||'';var op=sm[2];var cv=sm[3];var tv=sm[4];var ev=sm[5]||'';var tr2=tv.match(/Column(\d+)/i);if(tr2)tv=data[tr2[1]-1]||'';var er2=ev.match(/Column(\d+)/i);if(er2)ev=data[er2[1]-1]||'';var cond=false;if(op==='=='||op==='=')cond=cr==cv;else if(op==='!=')cond=cr!=cv;else if(op==='>')cond=parseFloat(cr)>parseFloat(cv);else if(op==='<')cond=parseFloat(cr)<parseFloat(cv);else if(op==='>=' )cond=parseFloat(cr)>=parseFloat(cv);else if(op==='<=')cond=parseFloat(cr)<=parseFloat(cv);return cond?tv:ev;} }
  if (/\+/.test(logic)) { return logic.replace(/Right\(Column(\d+),\s*(\d+)\)/gi,function(m,c,l){return(data[c-1]||'').slice(-parseInt(l));}).replace(/Left\(Column(\d+),\s*(\d+)\)/gi,function(m,c,l){return(data[c-1]||'').substring(0,parseInt(l));}).replace(/Column(\d+)/gi,function(m,c){return data[c-1]||'';}).replace(/\s*\+\s*/g,''); }
  if (!/Column\d+/i.test(logic)) return logic;
  return null;
}

function transformData(inputText, mappingTable, delimiter, skipRows) {
  try {
    var mRows = parseCSV(mappingTable, ',');
    var mHeaders = mRows[0].map(normalizeKey);
    var mappings = [];
    for (var i=1; i<mRows.length; i++) {
      var obj = {};
      for (var j=0; j<mHeaders.length; j++) { obj[mHeaders[j]] = (mRows[i][j]||'').trim(); }
      mappings.push(obj);
    }
    var allData = parseCSV(inputText, delimiter);
    var inputData = allData.slice(skipRows || 0);
    incrementCounter = 0;
    var rules = []; var headers = [];
    mappings.forEach(function(m) {
      var field = m['targetfieldname'] || m['fieldname'] || '';
      if (!field) return;
      rules.push({field:field, logic:m['mappinglogic']||'', colNum:m['inputcolumnnumber']?parseInt(m['inputcolumnnumber'])-1:null});
      headers.push(field);
    });
    var csvLines = [headers.join(',')];
    inputData.forEach(function(row, idx) {
      var vals = headers.map(function(h, hi) {
        var r = rules[hi]; var v;
        if (r.logic && r.logic.trim()) v = applyLogic(r.logic, row, r.field, idx);
        else if (r.colNum !== null) v = row[r.colNum] || '';
        else v = '';
        v = v != null ? v.toString() : '';
        return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v;
      });
      csvLines.push(vals.join(','));
    });
    return { success:true, csvOutput:csvLines.join('\n'), recordCount:inputData.length };
  } catch(e) { return { success:false, error:e.message }; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseCSV:parseCSV, transformData:transformData, applyLogic:applyLogic };
}