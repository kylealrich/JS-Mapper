// This file contains the fixed-length support functions to be added to JavaScript_Mapper.html

// Update the preview button handler (replace existing one starting at line ~943)
document.getElementById('previewBtn').addEventListener('click', function() {
  var fileType = document.getElementById('fileType').value;
  var dataFile = document.getElementById('dataFile').files[0];
  
  if (fileType === 'fixed-length') {
    var isMultiMode = document.getElementById('multiRecordTypeMode').checked;
    if (isMultiMode) {
      // Multi-record-type mode
      var configFile = document.getElementById('recordTypeConfigFile').files[0];
      if (!configFile || !dataFile) return alert('Please select both a record type config file and a data file.');
      previewMultiRecordType(configFile, dataFile);
    } else {
      // Single mapping mode
      var flMappingFile = document.getElementById('fixedLengthMappingFile').files[0];
      if (!flMappingFile || !dataFile) return alert('Please select both a data file and a fixed-length mapping CSV.');
      previewFixedLength(flMappingFile, dataFile);
    }
  } else {
    // Delimited mode
    var mappingFile = document.getElementById('mappingFile').files[0];
    if (!mappingFile || !dataFile) return alert('Please select both files.');
    previewDelimited(mappingFile, dataFile);
  }
});

// Add previewDelimited function (extract from existing code)
function previewDelimited(mappingFile, dataFile) {
  var delimiter = document.getElementById('delimiter').value;

  // Mapping file
  var mappingReader = new FileReader();
  mappingReader.onload = function(e) {
    var content = e.target.result;
    if (content.indexOf(delimiter) === -1) {
      return alert('Selected delimiter "' + (delimiter === '\t' ? 'Tab' : delimiter) + '" not found in mapping file.');
    }
    var rows = parseCSV(content, delimiter);
    var headers = rows[0].map(normalizeKey);
    parsedMappings = [];
    for (var i = 1; i < rows.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = (rows[i][j] || '').trim();
      }
      
      // Validate InputColumnNumber and MappingLogic are not both populated
      var inputCol = obj['inputcolumnnumber'] || '';
      var mappingLogic = obj['mappinglogic'] || '';
      if (inputCol && mappingLogic) {
        return alert('Mapping table error on row ' + (i + 1) + ': InputColumnNumber and MappingLogic cannot both have values. Use either direct column mapping OR transformation logic, not both.');
      }
      
      parsedMappings.push(obj);
    }
    renderTable(rows[0], parsedMappings);
    filesLoaded.mapping = true;
    if (filesLoaded.mapping && filesLoaded.data) enableGenerate();
  };
  mappingReader.readAsText(mappingFile);

  // Data file
  var dataReader = new FileReader();
  dataReader.onload = function(ev) {
    var rawData = ev.target.result;
    if (rawData.indexOf(delimiter) === -1) {
      return alert('Selected delimiter "' + (delimiter === '\t' ? 'Tab' : delimiter) + '" not found in input file.');
    }
    var allData = parseCSV(rawData, delimiter);
    var skipRows = parseInt(document.getElementById('skipRows').value) || 0;
    inputData = allData.slice(skipRows);
    document.getElementById('inputPreview').value = rawData;
    filesLoaded.data = true;
    if (filesLoaded.mapping && filesLoaded.data) enableGenerate();
  };
  dataReader.readAsText(dataFile);
}

// Add previewFixedLength function
function previewFixedLength(flMappingFile, dataFile) {
  var flMappingReader = new FileReader();
  flMappingReader.onload = function(e) {
    var content = e.target.result;
    var rows = parseCSV(content, ',');
    var headers = rows[0].map(normalizeKey);
    
    // Parse fixed-length mapping columns
    var fields = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var fieldObj = {};
      for (var j = 0; j < headers.length; j++) {
        fieldObj[headers[j]] = (row[j] || '').trim();
      }
      
      var fieldName = fieldObj['fieldname'] || '';
      if (!fieldName) continue;
      
      var start = parseInt(fieldObj['start']) || 0;
      var end = parseInt(fieldObj['end']) || 0;
      var padChar = fieldObj['padcharacter'] || fieldObj['padchar'] || '';
      var justify = (fieldObj['justify'] || '').toLowerCase();
      var defaultValue = fieldObj['defaultvalue'] || '';
      
      fields.push({
        fieldName: fieldName,
        startPos: start,
        endPos: end,
        padChar: padChar,
        justify: justify,
        defaultValue: defaultValue
      });
    }
    
    window.fixedLengthFields = fields;
    
    // Display preview
    var html = '<table><thead><tr>';
    html += '<th>Field Name</th><th>Start</th><th>End</th><th>Length</th>';
    html += '</tr></thead><tbody>';
    fields.forEach(function(f) {
      html += '<tr>';
      html += '<td>' + f.fieldName + '</td>';
      html += '<td>' + f.startPos + '</td>';
      html += '<td>' + f.endPos + '</td>';
      html += '<td>' + (f.endPos - f.startPos + 1) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('tablePreview').innerHTML = html;
    
    filesLoaded.mapping = true;
    if (filesLoaded.mapping && filesLoaded.data) enableGenerate();
  };
  flMappingReader.readAsText(flMappingFile);
  
  // Data file
  var dataReader = new FileReader();
  dataReader.onload = function(ev) {
    var rawData = ev.target.result;
    var lines = rawData.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
    inputData = lines;
    document.getElementById('inputPreview').value = rawData.substring(0, 1000) + (rawData.length > 1000 ? '\n...(truncated)' : '');
    filesLoaded.data = true;
    if (filesLoaded.mapping && filesLoaded.data) enableGenerate();
  };
  dataReader.readAsText(dataFile);
}

// Add previewMultiRecordType function (already exists in current file)
// Add parseFixedLengthMapping, loadMultipleMappingFiles, processMultiRecordTypeData functions
// (These are already in the current file)
