// Fixed-Length File Processing Enhancements
// Add these functions to JavaScript_Mapper.html

// ============================================================================
// ENHANCEMENT 1: Implied Decimal Support
// ============================================================================

/**
 * Enhanced extractFixedLengthFields with implied decimal support
 * Replaces the existing function in JavaScript_Mapper.html
 */
function extractFixedLengthFieldsEnhanced(line, fields, options) {
  var record = {};
  var errors = [];
  options = options || {};
  
  fields.forEach(function(fd) {
    var raw = line.substring(fd.startPos - 1, fd.endPos);
    var value = raw;
    
    // Remove padding
    if (fd.padChar) {
      if (fd.justify === 'right') {
        value = value.replace(new RegExp('^' + fd.padChar + '+'), '');
      } else {
        value = value.replace(new RegExp(fd.padChar + '+$'), '');
      }
    } else {
      value = value.trim();
    }
    
    // Apply default value if empty
    if (!value && fd.defaultValue) {
      value = fd.defaultValue;
    }
    
    // NEW: Implied decimal support
    if (value && fd.decimalPlaces && !isNaN(value)) {
      var numValue = parseFloat(value);
      value = (numValue / Math.pow(10, parseInt(fd.decimalPlaces))).toFixed(fd.decimalPlaces);
    }
    
    // NEW: Data type validation
    if (options.validate && value) {
      var validationError = validateField(fd, value);
      if (validationError) {
        errors.push({
          field: fd.fieldName,
          value: value,
          error: validationError
        });
      }
    }
    
    record[fd.fieldName] = value;
  });
  
  if (options.validate && errors.length > 0) {
    record._validationErrors = errors;
  }
  
  return record;
}

// ============================================================================
// ENHANCEMENT 2: Field Validation Rules
// ============================================================================

/**
 * Validate field based on rules
 */
function validateField(fieldDef, value) {
  // Required field validation
  if (fieldDef.required && fieldDef.required.toUpperCase() === 'Y') {
    if (!value || !value.toString().trim()) {
      return 'Required field is empty';
    }
  }
  
  // Data type validation
  if (fieldDef.dataType) {
    var dataType = fieldDef.dataType.toLowerCase();
    
    if (dataType === 'numeric' || dataType === 'number') {
      if (!/^-?\d*\.?\d+$/.test(value.toString().trim())) {
        return 'Invalid numeric value: ' + value;
      }
    }
    
    if (dataType === 'alpha' || dataType === 'alphabetic') {
      if (!/^[A-Za-z\s]*$/.test(value)) {
        return 'Invalid alphabetic value: ' + value;
      }
    }
    
    if (dataType === 'alphanumeric') {
      if (!/^[A-Za-z0-9\s]*$/.test(value)) {
        return 'Invalid alphanumeric value: ' + value;
      }
    }
    
    if (dataType === 'date') {
      if (!/^\d{8}$/.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return 'Invalid date format: ' + value;
      }
    }
  }
  
  // Min/Max value validation (for numeric fields)
  if (fieldDef.minValue !== undefined && fieldDef.minValue !== '') {
    var numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue < parseFloat(fieldDef.minValue)) {
      return 'Value ' + value + ' is below minimum ' + fieldDef.minValue;
    }
  }
  
  if (fieldDef.maxValue !== undefined && fieldDef.maxValue !== '') {
    var numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > parseFloat(fieldDef.maxValue)) {
      return 'Value ' + value + ' exceeds maximum ' + fieldDef.maxValue;
    }
  }
  
  // Length validation
  if (fieldDef.minLength && value.length < parseInt(fieldDef.minLength)) {
    return 'Value length ' + value.length + ' is below minimum ' + fieldDef.minLength;
  }
  
  if (fieldDef.maxLength && value.length > parseInt(fieldDef.maxLength)) {
    return 'Value length ' + value.length + ' exceeds maximum ' + fieldDef.maxLength;
  }
  
  // Pattern validation (regex)
  if (fieldDef.pattern) {
    try {
      var regex = new RegExp(fieldDef.pattern);
      if (!regex.test(value)) {
        return 'Value does not match required pattern: ' + fieldDef.pattern;
      }
    } catch (e) {
      return 'Invalid pattern definition: ' + fieldDef.pattern;
    }
  }
  
  // Valid values list
  if (fieldDef.validValues) {
    var validList = fieldDef.validValues.split('|');
    if (validList.indexOf(value) === -1) {
      return 'Value "' + value + '" not in valid list: ' + fieldDef.validValues;
    }
  }
  
  return null; // No errors
}

// ============================================================================
// ENHANCEMENT 3: Enhanced Fixed-Length Mapping Parser
// ============================================================================

/**
 * Parse fixed-length mapping with enhanced columns
 */
function parseFixedLengthMappingEnhanced(content) {
  var rows = parseCSV(content, ',');
  var headers = rows[0].map(normalizeKey);
  var fields = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var fieldObj = {};
    for (var j = 0; j < headers.length; j++) {
      fieldObj[headers[j]] = (row[j] || '').trim();
    }
    
    var fieldName = fieldObj['fieldname'] || '';
    if (!fieldName) continue;
    
    fields.push({
      fieldName: fieldName,
      startPos: parseInt(fieldObj['start']) || 0,
      endPos: parseInt(fieldObj['end']) || 0,
      padChar: fieldObj['padcharacter'] || fieldObj['padchar'] || '',
      justify: (fieldObj['justify'] || '').toLowerCase(),
      defaultValue: fieldObj['defaultvalue'] || '',
      required: fieldObj['required'] || 'N',
      // NEW: Enhanced validation fields
      dataType: fieldObj['datatype'] || '',
      decimalPlaces: parseInt(fieldObj['decimalplaces']) || 0,
      minValue: fieldObj['minvalue'] || '',
      maxValue: fieldObj['maxvalue'] || '',
      minLength: fieldObj['minlength'] || '',
      maxLength: fieldObj['maxlength'] || '',
      pattern: fieldObj['pattern'] || '',
      validValues: fieldObj['validvalues'] || ''
    });
  }
  
  return { fields: fields };
}

// ============================================================================
// ENHANCEMENT 4: Error Recovery & Logging
// ============================================================================

/**
 * Process data with error recovery
 */
function processDataWithErrorRecovery(lines, fields, options) {
  options = options || { continueOnError: true, maxErrors: 100 };
  
  var results = [];
  var errors = [];
  var stats = {
    totalRecords: lines.length,
    successfulRecords: 0,
    failedRecords: 0,
    validationErrors: 0
  };
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || !line.trim()) continue;
    
    try {
      var record = extractFixedLengthFieldsEnhanced(line, fields, { validate: true });
      
      // Check for validation errors
      if (record._validationErrors && record._validationErrors.length > 0) {
        stats.validationErrors += record._validationErrors.length;
        
        if (!options.continueOnError) {
          throw new Error('Validation failed: ' + JSON.stringify(record._validationErrors));
        }
        
        errors.push({
          lineNumber: i + 1,
          line: line,
          type: 'validation',
          errors: record._validationErrors
        });
      }
      
      results.push(record);
      stats.successfulRecords++;
      
    } catch (error) {
      stats.failedRecords++;
      errors.push({
        lineNumber: i + 1,
        line: line,
        type: 'processing',
        error: error.message
      });
      
      if (!options.continueOnError || errors.length >= options.maxErrors) {
        break;
      }
    }
  }
  
  return {
    results: results,
    errors: errors,
    stats: stats
  };
}

/**
 * Generate error report
 */
function generateErrorReport(errors) {
  if (errors.length === 0) {
    return 'No errors found.';
  }
  
  var report = '=== ERROR REPORT ===\n\n';
  report += 'Total Errors: ' + errors.length + '\n\n';
  
  errors.forEach(function(err, index) {
    report += '--- Error ' + (index + 1) + ' ---\n';
    report += 'Line Number: ' + err.lineNumber + '\n';
    report += 'Type: ' + err.type + '\n';
    
    if (err.type === 'validation') {
      report += 'Validation Errors:\n';
      err.errors.forEach(function(ve) {
        report += '  - Field: ' + ve.field + '\n';
        report += '    Value: ' + ve.value + '\n';
        report += '    Error: ' + ve.error + '\n';
      });
    } else {
      report += 'Error: ' + err.error + '\n';
    }
    
    report += 'Line Content: ' + err.line.substring(0, 100) + '...\n\n';
  });
  
  return report;
}

// ============================================================================
// ENHANCEMENT 5: Record Statistics
// ============================================================================

/**
 * Generate statistics for multi-record-type files
 */
function generateRecordStatistics(recordsByType, config) {
  var stats = {
    totalRecords: 0,
    byType: {},
    parentChildRatios: {},
    anomalies: []
  };
  
  // Count by type
  Object.keys(recordsByType).forEach(function(typeName) {
    var count = recordsByType[typeName].length;
    stats.byType[typeName] = count;
    stats.totalRecords += count;
  });
  
  // Calculate parent-child ratios
  config.forEach(function(rt) {
    if (rt.parentType) {
      var parentCount = stats.byType[rt.parentType] || 0;
      var childCount = stats.byType[rt.name] || 0;
      
      if (parentCount > 0) {
        var ratio = (childCount / parentCount).toFixed(2);
        stats.parentChildRatios[rt.name + '/' + rt.parentType] = ratio;
        
        // Detect anomalies
        if (childCount === 0 && parentCount > 0) {
          stats.anomalies.push('No ' + rt.name + ' records found for ' + parentCount + ' ' + rt.parentType + ' records');
        }
      }
    }
  });
  
  return stats;
}

/**
 * Display statistics in UI
 */
function displayStatistics(stats) {
  var html = '<div style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 6px;">';
  html += '<h4 style="margin: 0 0 12px 0; color: #0c4a6e;"><i class="fas fa-chart-bar"></i> Record Statistics</h4>';
  
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">';
  
  // Total records
  html += '<div style="padding: 8px; background: #ffffff; border-radius: 4px;">';
  html += '<div style="font-size: 11px; color: #6b7280;">Total Records</div>';
  html += '<div style="font-size: 20px; font-weight: 600; color: #0c4a6e;">' + stats.totalRecords + '</div>';
  html += '</div>';
  
  // By type
  Object.keys(stats.byType).forEach(function(typeName) {
    html += '<div style="padding: 8px; background: #ffffff; border-radius: 4px;">';
    html += '<div style="font-size: 11px; color: #6b7280;">' + typeName + '</div>';
    html += '<div style="font-size: 20px; font-weight: 600; color: #059669;">' + stats.byType[typeName] + '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  
  // Parent-child ratios
  if (Object.keys(stats.parentChildRatios).length > 0) {
    html += '<div style="margin-top: 12px; padding: 8px; background: #ffffff; border-radius: 4px;">';
    html += '<div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Parent-Child Ratios</div>';
    Object.keys(stats.parentChildRatios).forEach(function(key) {
      html += '<div style="font-size: 12px; color: #374151;">' + key + ': ' + stats.parentChildRatios[key] + '</div>';
    });
    html += '</div>';
  }
  
  // Anomalies
  if (stats.anomalies.length > 0) {
    html += '<div style="margin-top: 12px; padding: 8px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px;">';
    html += '<div style="font-size: 11px; color: #92400e; font-weight: 600; margin-bottom: 4px;"><i class="fas fa-exclamation-triangle"></i> Anomalies</div>';
    stats.anomalies.forEach(function(anomaly) {
      html += '<div style="font-size: 12px; color: #92400e;">• ' + anomaly + '</div>';
    });
    html += '</div>';
  }
  
  html += '</div>';
  
  return html;
}

// ============================================================================
// ENHANCEMENT 6: Drag-and-Drop File Upload
// ============================================================================

/**
 * Enable drag-and-drop for file inputs
 */
function enableDragAndDrop(fileInputId, dropZoneId) {
  var fileInput = document.getElementById(fileInputId);
  var dropZone = dropZoneId ? document.getElementById(dropZoneId) : fileInput.parentElement;
  
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Highlight drop zone when item is dragged over it
  ['dragenter', 'dragover'].forEach(function(eventName) {
    dropZone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(function(eventName) {
    dropZone.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight(e) {
    dropZone.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
    dropZone.style.border = '2px dashed #3b82f6';
  }
  
  function unhighlight(e) {
    dropZone.style.background = '';
    dropZone.style.border = '';
  }
  
  // Handle dropped files
  dropZone.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;
    
    if (files.length > 0) {
      fileInput.files = files;
      
      // Trigger change event
      var event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }
  }
}

// ============================================================================
// ENHANCEMENT 7: Batch File Processing
// ============================================================================

/**
 * Process multiple files with same mapping
 */
function processBatchFiles(files, mappingConfig, options) {
  options = options || { combineOutput: false };
  
  var batchResults = {
    files: [],
    totalRecords: 0,
    totalErrors: 0,
    combinedOutput: []
  };
  
  var filesProcessed = 0;
  
  Array.from(files).forEach(function(file) {
    var reader = new FileReader();
    
    reader.onload = function(e) {
      var content = e.target.result;
      var lines = content.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
      
      var result = processDataWithErrorRecovery(lines, mappingConfig.fields, options);
      
      batchResults.files.push({
        fileName: file.name,
        stats: result.stats,
        errors: result.errors,
        results: result.results
      });
      
      batchResults.totalRecords += result.stats.successfulRecords;
      batchResults.totalErrors += result.errors.length;
      
      if (options.combineOutput) {
        batchResults.combinedOutput = batchResults.combinedOutput.concat(result.results);
      }
      
      filesProcessed++;
      
      if (filesProcessed === files.length) {
        displayBatchResults(batchResults);
      }
    };
    
    reader.readAsText(file);
  });
}

/**
 * Display batch processing results
 */
function displayBatchResults(batchResults) {
  var html = '<div style="margin: 16px 0; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">';
  html += '<h4 style="margin: 0 0 12px 0;"><i class="fas fa-layer-group"></i> Batch Processing Results</h4>';
  
  html += '<div style="margin-bottom: 12px;">';
  html += '<div><strong>Files Processed:</strong> ' + batchResults.files.length + '</div>';
  html += '<div><strong>Total Records:</strong> ' + batchResults.totalRecords + '</div>';
  html += '<div><strong>Total Errors:</strong> ' + batchResults.totalErrors + '</div>';
  html += '</div>';
  
  html += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
  html += '<thead><tr>';
  html += '<th style="padding: 8px; border: 1px solid #e5e7eb; background: #f3f4f6;">File Name</th>';
  html += '<th style="padding: 8px; border: 1px solid #e5e7eb; background: #f3f4f6;">Records</th>';
  html += '<th style="padding: 8px; border: 1px solid #e5e7eb; background: #f3f4f6;">Errors</th>';
  html += '<th style="padding: 8px; border: 1px solid #e5e7eb; background: #f3f4f6;">Status</th>';
  html += '</tr></thead><tbody>';
  
  batchResults.files.forEach(function(fileResult) {
    var status = fileResult.errors.length === 0 ? 
      '<span style="color: #059669;">✓ Success</span>' : 
      '<span style="color: #dc2626;">⚠ Errors</span>';
    
    html += '<tr>';
    html += '<td style="padding: 8px; border: 1px solid #e5e7eb;">' + fileResult.fileName + '</td>';
    html += '<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">' + fileResult.stats.successfulRecords + '</td>';
    html += '<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">' + fileResult.errors.length + '</td>';
    html += '<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">' + status + '</td>';
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  // Display in preview section
  var previewDiv = document.getElementById('tablePreview');
  if (previewDiv) {
    previewDiv.innerHTML = html;
  }
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
To integrate these enhancements into JavaScript_Mapper.html:

1. REPLACE the existing extractFixedLengthFields function with extractFixedLengthFieldsEnhanced

2. UPDATE parseFixedLengthMapping to use parseFixedLengthMappingEnhanced

3. ADD validation columns to your mapping CSV:
   - Data Type (Numeric, Alpha, Alphanumeric, Date)
   - Decimal Places (for implied decimals)
   - Min Value, Max Value (for numeric validation)
   - Min Length, Max Length (for string validation)
   - Pattern (regex pattern)
   - Valid Values (pipe-separated list)

4. ENABLE drag-and-drop on page load:
   window.onload = function() {
     enableDragAndDrop('dataFile');
     enableDragAndDrop('mappingFile');
     enableDragAndDrop('fixedLengthMappingFile');
   };

5. ADD batch processing button to UI:
   <input type="file" id="batchFiles" multiple accept=".txt" />
   <button onclick="handleBatchProcessing()">Process Batch</button>

6. DISPLAY statistics after processing:
   var stats = generateRecordStatistics(recordsByType, multiRecordTypeConfig);
   var statsHtml = displayStatistics(stats);
   // Append statsHtml to preview section

7. ENABLE error recovery:
   var result = processDataWithErrorRecovery(lines, fields, {
     continueOnError: true,
     maxErrors: 100
   });
   
   if (result.errors.length > 0) {
     var errorReport = generateErrorReport(result.errors);
     // Display or download error report
   }
*/
