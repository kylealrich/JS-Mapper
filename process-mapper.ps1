# PowerShell script to process Cerner GL data using mapper-core.js

# Read the mapper core
$mapperCore = Get-Content -Path "mapper-core.js" -Raw

# Read input files
$inputData = Get-Content -Path "input/CernerGLTrans_20251025.txt" -Raw
$mappingTable = Get-Content -Path "input/CernerGL_MappingTable.csv" -Raw

# Create a temporary JavaScript file
$jsScript = @"
$mapperCore

// Read from stdin
var inputText = ``$inputData``;
var mappingText = ``$mappingTable``;

// Transform data
var result = transformData(inputText, mappingText, ',', 0);

if (result.success) {
  console.log('SUCCESS');
  console.log('RECORDS:' + result.transformedData.length);
  console.log('CSV_START');
  console.log(result.csvOutput);
  console.log('CSV_END');
} else {
  console.log('ERROR:' + result.error);
}
"@

# Save temp script
$jsScript | Out-File -FilePath "temp_process.js" -Encoding UTF8

Write-Host "JavaScript processing not available. Creating manual processor..."
