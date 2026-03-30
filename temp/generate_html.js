var fs = require('fs');

var dynamicJS = fs.readFileSync('output/CernerGLTrans_dynamic_mapper.js', 'utf8');
var staticJS = fs.readFileSync('output/CernerGLTrans_static_mapper.js', 'utf8');
var mappedCSV = fs.readFileSync('output/CernerGLTrans_Mapped.csv', 'utf8');

function htmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var csvLines = mappedCSV.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
var headers = csvLines[0].split(',');
var dataRows = csvLines.slice(1);

function parseCSVLine(line) {
  var cells = [];
  var current = '';
  var inQuotes = false;
  for (var j = 0; j < line.length; j++) {
    var ch = line[j];
    if (ch === '"') {
      if (inQuotes && line[j+1] === '"') { current += '"'; j++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current); current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

var tableRowsHtml = '';
for (var i = 0; i < dataRows.length; i++) {
  var cells = parseCSVLine(dataRows[i]);
  tableRowsHtml += '<tr>';
  for (var c = 0; c < cells.length; c++) {
    tableRowsHtml += '<td>' + htmlEscape(cells[c]) + '</td>';
  }
  tableRowsHtml += '</tr>\n';
}

var csvBase64 = Buffer.from(mappedCSV).toString('base64');
var genDate = new Date().toISOString().split('T')[0];

var thRow = '<tr>';
for (var h = 0; h < headers.length; h++) {
  thRow += '<th>' + htmlEscape(headers[h]) + '</th>';
}
thRow += '</tr>';

var css = [
  '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");',
  '*,*::before,*::after{box-sizing:border-box}',
  'body{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(rgba(248,250,252,0.9),rgba(248,250,252,0.9)),repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),radial-gradient(circle at 20px 20px,rgba(59,130,246,0.15) 2px,transparent 2px),#f8fafc;background-size:40px 40px;color:#1f2937;margin:0;padding:20px;min-height:100vh}',
  '.container{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.1);padding:32px;max-width:1400px;margin:auto;border:1px solid #e5e7eb}',
  'h1{font-size:28px;font-weight:700;text-align:center;margin:0 0 4px 0;display:flex;align-items:center;justify-content:center;gap:12px}',
  '.title-text{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
  '.subtitle{text-align:center;color:#6b7280;font-size:14px;margin-bottom:20px}',
  '.gradient-divider{height:4px;background:linear-gradient(90deg,#1e3a8a 0%,#3730a3 25%,#5b21b6 50%,#7c2d12 75%,#1e40af 100%);border-radius:2px;margin-bottom:24px}',
  '.tab-nav{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;border-bottom:2px solid #e5e7eb;padding-bottom:12px}',
  '.tab-btn{padding:10px 20px;border-radius:8px 8px 0 0;border:1px solid #d1d5db;border-bottom:none;background:#f9fafb;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;color:#4b5563;display:flex;align-items:center;gap:8px}',
  '.tab-btn:hover{background:#f3f4f6;border-color:#9ca3af}',
  '.tab-btn.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-color:transparent}',
  '.tab-content{display:none}.tab-content.active{display:block}',
  '.code-container{background:#1e293b;border-radius:10px;overflow:hidden;margin-bottom:16px}',
  '.code-header{background:#334155;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #475569}',
  '.code-title{color:#e2e8f0;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}',
  '.code-title .badge{background:#3b82f6;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}',
  '.copy-btn{background:#475569;border:none;color:#e2e8f0;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}',
  '.copy-btn:hover{background:#64748b}.copy-btn.copied{background:#10b981}',
  '.code-block{padding:16px;overflow-x:auto;max-height:600px;overflow-y:auto}',
  '.code-block pre{margin:0;font-family:"Fira Code","Cascadia Code","Consolas",monospace;font-size:13px;line-height:1.6;color:#e2e8f0;white-space:pre}',
  '.csv-container{overflow-x:auto;border:1px solid #e5e7eb;border-radius:10px}',
  '.csv-table{width:100%;border-collapse:collapse;font-size:12px}',
  '.csv-table th{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:10px 12px;text-align:left;font-weight:600;white-space:nowrap;position:sticky;top:0}',
  '.csv-table td{padding:8px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap}',
  '.csv-table tr:nth-child(even){background:#f9fafb}.csv-table tr:hover{background:#eff6ff}',
  '.stats-bar{display:flex;gap:20px;margin-bottom:16px;flex-wrap:wrap}',
  '.stat-item{background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:8px;padding:12px 20px;display:flex;align-items:center;gap:10px}',
  '.stat-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px}',
  '.stat-value{font-size:20px;font-weight:700;color:#3730a3}.stat-label{font-size:12px;color:#6b7280}',
  '.info-section{background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:10px;padding:20px;margin-top:24px}',
  '.info-section h3{margin:0 0 12px 0;font-size:16px;color:#3730a3;display:flex;align-items:center;gap:8px}',
  '.info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}',
  '.info-item{display:flex;gap:8px}.info-label{font-weight:600;color:#4b5563;font-size:13px}.info-value{color:#6b7280;font-size:13px}',
  '.download-btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;margin-top:12px}',
  '.download-btn:hover{opacity:0.9;transform:translateY(-1px)}'
].join('\n');

var jsCode = [
  'var csvData = "' + csvBase64 + '";',
  'function showTab(id, btn) {',
  '  var contents = document.querySelectorAll(".tab-content");',
  '  var buttons = document.querySelectorAll(".tab-btn");',
  '  for (var i = 0; i < contents.length; i++) contents[i].className = "tab-content";',
  '  for (var i = 0; i < buttons.length; i++) buttons[i].className = "tab-btn";',
  '  document.getElementById(id).className = "tab-content active";',
  '  btn.className = "tab-btn active";',
  '}',
  'function copyCode(id, btn) {',
  '  var text = document.getElementById(id).textContent;',
  '  navigator.clipboard.writeText(text).then(function() {',
  '    btn.innerHTML = "\\u2713 Copied";',
  '    btn.classList.add("copied");',
  '    setTimeout(function() { btn.innerHTML = "\\ud83d\\udccb Copy"; btn.classList.remove("copied"); }, 2000);',
  '  });',
  '}',
  'function downloadCSV() {',
  '  var raw = atob(csvData);',
  '  var blob = new Blob([raw], {type: "text/csv"});',
  '  var url = URL.createObjectURL(blob);',
  '  var a = document.createElement("a");',
  '  a.href = url;',
  '  a.download = "CernerGLTrans_Mapped.csv";',
  '  a.click();',
  '  URL.revokeObjectURL(url);',
  '}'
].join('\n');

var html = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '<meta charset="UTF-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<title>CernerGLTrans Mapper - Generated Output Viewer</title>',
  '<style>',
  css,
  '</style>',
  '</head>',
  '<body>',
  '<div class="container">',
  '<h1><span style="font-size:28px">&#128640;</span> <span class="title-text">CernerGLTrans Mapper Output</span></h1>',
  '<p class="subtitle">Generated JavaScript Mappers and Transformed CSV Output</p>',
  '<div class="gradient-divider"></div>',
  '<div class="stats-bar">',
  '<div class="stat-item"><div class="stat-icon">&#128196;</div><div><div class="stat-value">' + dataRows.length + '</div><div class="stat-label">Rows Processed</div></div></div>',
  '<div class="stat-item"><div class="stat-icon">&#128203;</div><div><div class="stat-value">' + headers.length + '</div><div class="stat-label">Output Fields</div></div></div>',
  '<div class="stat-item"><div class="stat-icon">&#9989;</div><div><div class="stat-value">2</div><div class="stat-label">Mapper Types</div></div></div>',
  '</div>',
  '<div class="tab-nav">',
  '<button class="tab-btn active" onclick="showTab(\'runtime\',this)"><span>&#9881;</span> Dynamic JS</button>',
  '<button class="tab-btn" onclick="showTab(\'selfcontained\',this)"><span>&#128230;</span> Static JS</button>',
  '<button class="tab-btn" onclick="showTab(\'csv\',this)"><span>&#128200;</span> Mapped CSV Output</button>',
  '</div>',
  '<div id="runtime" class="tab-content active">',
  '<div class="code-container"><div class="code-header">',
  '<div class="code-title"><span>CernerGLTrans_dynamic_mapper.js</span><span class="badge">ES5</span></div>',
  '<button class="copy-btn" onclick="copyCode(\'runtimeCode\',this)">&#128203; Copy</button>',
  '</div><div class="code-block"><pre id="runtimeCode">' + htmlEscape(dynamicJS) + '</pre></div></div></div>',
  '<div id="selfcontained" class="tab-content">',
  '<div class="code-container"><div class="code-header">',
  '<div class="code-title"><span>CernerGLTrans_static_mapper.js</span><span class="badge">ES5</span></div>',
  '<button class="copy-btn" onclick="copyCode(\'selfcontainedCode\',this)">&#128203; Copy</button>',
  '</div><div class="code-block"><pre id="selfcontainedCode">' + htmlEscape(staticJS) + '</pre></div></div></div>',
  '<div id="csv" class="tab-content">',
  '<button class="download-btn" onclick="downloadCSV()">&#128229; Download CSV</button>',
  '<div style="height:12px"></div>',
  '<div class="csv-container" style="max-height:600px;overflow-y:auto">',
  '<table class="csv-table"><thead>',
  thRow,
  '</thead><tbody>',
  tableRowsHtml,
  '</tbody></table>',
  '</div></div>',
  '<div class="info-section">',
  '<h3><span>&#9432;</span> Processing Details</h3>',
  '<div class="info-grid">',
  '<div class="info-item"><span class="info-label">Source File:</span><span class="info-value">CernerGLTrans.txt</span></div>',
  '<div class="info-item"><span class="info-label">Mapping File:</span><span class="info-value">CernerGL_MappingTable.csv</span></div>',
  '<div class="info-item"><span class="info-label">Delimiter:</span><span class="info-value">Comma (,)</span></div>',
  '<div class="info-item"><span class="info-label">Rows Skipped:</span><span class="info-value">0</span></div>',
  '<div class="info-item"><span class="info-label">Total Rows:</span><span class="info-value">' + dataRows.length + '</span></div>',
  '<div class="info-item"><span class="info-label">Generated:</span><span class="info-value">' + genDate + '</span></div>',
  '</div></div>',
  '</div>',
  '<script>',
  jsCode,
  '</script>',
  '</body>',
  '</html>'
].join('\n');

fs.writeFileSync('output/CernerGLTrans_Mapped.html', html, 'utf8');
console.log('HTML viewer generated: output/CernerGLTrans_Mapped.html (' + dataRows.length + ' rows)');
