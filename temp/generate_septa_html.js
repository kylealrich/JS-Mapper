var fs = require('fs');

// Read all source files
var dynamicJS = fs.readFileSync('output/GL_FELA_20210504_Test_dynamic_mapper.js', 'utf8');
var staticJS = fs.readFileSync('output/GL_FELA_20210504_Test_static_mapper.js', 'utf8');
var headersCSV = fs.readFileSync('output/GL_FELA_20210504_Test_Headers_Mapped.csv', 'utf8');
var detailsCSV = fs.readFileSync('output/GL_FELA_20210504_Test_Details_Mapped.csv', 'utf8');
var trailersCSV = fs.readFileSync('output/GL_FELA_20210504_Test_Trailers_Mapped.csv', 'utf8');

// Base64 encode CSVs
var headersB64 = Buffer.from(headersCSV).toString('base64');
var detailsB64 = Buffer.from(detailsCSV).toString('base64');
var trailersB64 = Buffer.from(trailersCSV).toString('base64');

// HTML-escape JS code for embedding in <pre> tags
function htmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Parse CSV to build HTML table
function csvToTable(csvText) {
  var lines = csvText.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  var rows = [];
  lines.forEach(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(current); current = '';
      } else { current += ch; }
    }
    result.push(current);
    rows.push(result);
  });
  if (rows.length === 0) return '';
  var headers = rows[0];
  var html = '<table class="csv-table"><thead><tr>';
  headers.forEach(function(h) { html += '<th>' + htmlEscape(h) + '</th>'; });
  html += '</tr></thead><tbody>';
  for (var i = 1; i < rows.length; i++) {
    html += '<tr>';
    rows[i].forEach(function(cell) { html += '<td>' + htmlEscape(cell) + '</td>'; });
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

var headersTable = csvToTable(headersCSV);
var detailsTable = csvToTable(detailsCSV);
var trailersTable = csvToTable(trailersCSV);

var headerRowCount = headersCSV.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; }).length - 1;
var detailRowCount = detailsCSV.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; }).length - 1;
var trailerRowCount = trailersCSV.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; }).length - 1;
var totalLines = headerRowCount + detailRowCount + trailerRowCount;

var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>GL_FELA_20210504_Test Mapper - Generated Output Viewer</title>\n<style>\n';
html += '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");\n';
html += '*,*::before,*::after{box-sizing:border-box}\n';
html += 'body{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(rgba(248,250,252,0.9),rgba(248,250,252,0.9)),repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),radial-gradient(circle at 20px 20px,rgba(59,130,246,0.15) 2px,transparent 2px),#f8fafc;background-size:40px 40px;color:#1f2937;margin:0;padding:20px;min-height:100vh}\n';
html += '.container{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.1);padding:32px;max-width:1400px;margin:auto;border:1px solid #e5e7eb}\n';
html += 'h1{font-size:28px;font-weight:700;text-align:center;margin:0 0 4px 0;display:flex;align-items:center;justify-content:center;gap:12px}\n';
html += '.title-text{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}\n';
html += '.subtitle{text-align:center;color:#6b7280;font-size:14px;margin-bottom:20px}\n';
html += '.gradient-divider{height:4px;background:linear-gradient(90deg,#1e3a8a 0%,#3730a3 25%,#5b21b6 50%,#7c2d12 75%,#1e40af 100%);border-radius:2px;margin-bottom:24px}\n';
html += '.tab-nav{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;border-bottom:2px solid #e5e7eb;padding-bottom:12px}\n';
html += '.tab-btn{padding:10px 20px;border-radius:8px 8px 0 0;border:1px solid #d1d5db;border-bottom:none;background:#f9fafb;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;color:#4b5563;display:flex;align-items:center;gap:8px}\n';
html += '.tab-btn:hover{background:#f3f4f6;border-color:#9ca3af}\n';
html += '.tab-btn.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-color:transparent}\n';
html += '.tab-content{display:none}.tab-content.active{display:block}\n';
html += '.code-container{background:#1e293b;border-radius:10px;overflow:hidden;margin-bottom:16px}\n';
html += '.code-header{background:#334155;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #475569}\n';
html += '.code-title{color:#e2e8f0;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}\n';
html += '.code-title .badge{background:#3b82f6;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}\n';
html += '.copy-btn{background:#475569;border:none;color:#e2e8f0;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}\n';
html += '.copy-btn:hover{background:#64748b}.copy-btn.copied{background:#10b981}\n';
html += '.code-block{padding:16px;overflow-x:auto;max-height:600px;overflow-y:auto}\n';
html += '.code-block pre{margin:0;font-family:"Fira Code","Cascadia Code","Consolas",monospace;font-size:13px;line-height:1.6;color:#e2e8f0;white-space:pre}\n';
html += '.csv-container{overflow-x:auto;border:1px solid #e5e7eb;border-radius:10px}\n';
html += '.csv-table{width:100%;border-collapse:collapse;font-size:12px}\n';
html += '.csv-table th{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:10px 12px;text-align:left;font-weight:600;white-space:nowrap;position:sticky;top:0}\n';
html += '.csv-table td{padding:8px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap}\n';
html += '.csv-table tr:nth-child(even){background:#f9fafb}.csv-table tr:hover{background:#eff6ff}\n';
html += '.stats-bar{display:flex;gap:20px;margin-bottom:16px;flex-wrap:wrap}\n';
html += '.stat-item{background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:8px;padding:12px 20px;display:flex;align-items:center;gap:10px}\n';
html += '.stat-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px}\n';
html += '.stat-value{font-size:20px;font-weight:700;color:#3730a3}.stat-label{font-size:12px;color:#6b7280}\n';
html += '.download-btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;margin-top:12px}\n';
html += '.download-btn:hover{opacity:0.9;transform:translateY(-1px)}\n';
html += '.csv-type-nav{display:flex;gap:8px;margin-bottom:12px}\n';
html += '.csv-type-btn{padding:8px 16px;border-radius:6px;border:1px solid #d1d5db;background:#f9fafb;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;color:#4b5563}\n';
html += '.csv-type-btn:hover{background:#f3f4f6}\n';
html += '.csv-type-btn.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-color:transparent}\n';
html += '.csv-sub{display:none}.csv-sub.active{display:block}\n';
html += '</style>\n</head>\n<body>\n';

html += '<div class="container">\n';
html += '<h1><span style="font-size:28px">&#128640;</span> <span class="title-text">GL_FELA_20210504_Test Mapper Output</span></h1>\n';
html += '<p class="subtitle">Generated JavaScript Mappers and Transformed CSV Output (Multi-Record Fixed-Length)</p>\n';
html += '<div class="gradient-divider"></div>\n';
html += '<div class="stats-bar">\n';
html += '<div class="stat-item"><div class="stat-icon">&#128196;</div><div><div class="stat-value">' + totalLines + '</div><div class="stat-label">Lines Processed</div></div></div>\n';
html += '<div class="stat-item"><div class="stat-icon">&#128203;</div><div><div class="stat-value">3</div><div class="stat-label">Record Types</div></div></div>\n';
html += '<div class="stat-item"><div class="stat-icon">&#9989;</div><div><div class="stat-value">2</div><div class="stat-label">Mapper Types</div></div></div>\n';
html += '</div>\n';

// Tab navigation
html += '<div class="tab-nav">\n';
html += '<button class="tab-btn active" onclick="showTab(\'runtime\',this)"><span>&#9881;</span> Runtime Flexible JS</button>\n';
html += '<button class="tab-btn" onclick="showTab(\'selfcontained\',this)"><span>&#128230;</span> Self-Contained JS</button>\n';
html += '<button class="tab-btn" onclick="showTab(\'csv\',this)"><span>&#128200;</span> Mapped CSV Output</button>\n';
html += '</div>\n';

// Runtime Flexible tab
html += '<div id="runtime" class="tab-content active">\n';
html += '<div class="code-container"><div class="code-header">\n';
html += '<div class="code-title"><span>GL_FELA_20210504_Test_dynamic_mapper.js</span><span class="badge">ES5</span></div>\n';
html += '<button class="copy-btn" onclick="copyCode(\'runtimeCode\',this)">&#128203; Copy</button>\n';
html += '</div><div class="code-block"><pre id="runtimeCode">' + htmlEscape(dynamicJS) + '</pre></div></div></div>\n';

// Self-Contained tab
html += '<div id="selfcontained" class="tab-content">\n';
html += '<div class="code-container"><div class="code-header">\n';
html += '<div class="code-title"><span>GL_FELA_20210504_Test_static_mapper.js</span><span class="badge">ES5</span></div>\n';
html += '<button class="copy-btn" onclick="copyCode(\'selfcontainedCode\',this)">&#128203; Copy</button>\n';
html += '</div><div class="code-block"><pre id="selfcontainedCode">' + htmlEscape(staticJS) + '</pre></div></div></div>\n';

// CSV tab with sub-tabs
html += '<div id="csv" class="tab-content">\n';
html += '<div class="csv-type-nav">\n';
html += '<button class="csv-type-btn active" onclick="showCSVType(\'headers\',this)">Headers (' + headerRowCount + ' row)</button>\n';
html += '<button class="csv-type-btn" onclick="showCSVType(\'details\',this)">Details (' + detailRowCount + ' rows)</button>\n';
html += '<button class="csv-type-btn" onclick="showCSVType(\'trailers\',this)">Trailers (' + trailerRowCount + ' row)</button>\n';
html += '</div>\n';

// Headers sub-tab
html += '<div id="headers" class="csv-sub active">\n';
html += '<button class="download-btn" onclick="downloadCSV(\'headers\')">&#128229; Download Headers CSV</button>\n';
html += '<div style="height:12px"></div>\n';
html += '<div class="csv-container" style="max-height:600px;overflow-y:auto">' + headersTable + '</div></div>\n';

// Details sub-tab
html += '<div id="details" class="csv-sub">\n';
html += '<button class="download-btn" onclick="downloadCSV(\'details\')">&#128229; Download Details CSV</button>\n';
html += '<div style="height:12px"></div>\n';
html += '<div class="csv-container" style="max-height:600px;overflow-y:auto">' + detailsTable + '</div></div>\n';

// Trailers sub-tab
html += '<div id="trailers" class="csv-sub">\n';
html += '<button class="download-btn" onclick="downloadCSV(\'trailers\')">&#128229; Download Trailers CSV</button>\n';
html += '<div style="height:12px"></div>\n';
html += '<div class="csv-container" style="max-height:600px;overflow-y:auto">' + trailersTable + '</div></div>\n';

html += '</div>\n'; // close csv tab

// JavaScript functions
html += '<script>\n';
html += 'function showTab(id,btn){document.querySelectorAll(".tab-content").forEach(function(t){t.classList.remove("active")});document.querySelectorAll(".tab-btn").forEach(function(b){b.classList.remove("active")});document.getElementById(id).classList.add("active");btn.classList.add("active")}\n';
html += 'function showCSVType(id,btn){document.querySelectorAll(".csv-sub").forEach(function(t){t.classList.remove("active")});document.querySelectorAll(".csv-type-btn").forEach(function(b){b.classList.remove("active")});document.getElementById(id).classList.add("active");btn.classList.add("active")}\n';
html += 'function copyCode(id,btn){var text=document.getElementById(id).textContent;navigator.clipboard.writeText(text).then(function(){btn.innerHTML="&#10003; Copied";btn.classList.add("copied");setTimeout(function(){btn.innerHTML="&#128203; Copy";btn.classList.remove("copied")},2000)})}\n';
html += 'var csvData={headers:"' + headersB64 + '",details:"' + detailsB64 + '",trailers:"' + trailersB64 + '"};\n';
html += 'function downloadCSV(type){var b64=csvData[type];var raw=atob(b64);var blob=new Blob([raw],{type:"text/csv"});var url=URL.createObjectURL(blob);var a=document.createElement("a");var names={headers:"GL_FELA_20210504_Test_Headers_Mapped.csv",details:"GL_FELA_20210504_Test_Details_Mapped.csv",trailers:"GL_FELA_20210504_Test_Trailers_Mapped.csv"};a.href=url;a.download=names[type];document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}\n';
html += '</script>\n';
html += '</div>\n</body>\n</html>';

fs.writeFileSync('output/GL_FELA_20210504_Test_Mapped.html', html);
console.log('HTML viewer generated: output/GL_FELA_20210504_Test_Mapped.html');
console.log('Total lines: ' + totalLines + ' (Headers: ' + headerRowCount + ', Details: ' + detailRowCount + ', Trailers: ' + trailerRowCount + ')');
