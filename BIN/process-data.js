// Data Processing Script using Runtime Flexible Mapper
var fs = require('fs');
var mapper = require('./output/CernerGL_RuntimeFlexible_Mapper.js');

// Read input files
var inputData = fs.readFileSync('./input/CernerGLTrans_20251025.txt', 'utf8');
var mappingTable = fs.readFileSync('./input/CernerGL_MappingTable.csv', 'utf8');

// Process data
console.log('Processing Cerner GL Transaction data...');
var result = mapper.transformData(inputData, mappingTable, ',', 0);

if (result.success) {
  // Write output CSV
  fs.writeFileSync('./output/CernerGLTrans_20251025_Mapped.csv', result.csvOutput);
  console.log('Success! Processed ' + result.transformedData.length + ' records.');
  console.log('Output file: ./output/CernerGLTrans_20251025_Mapped.csv');
  console.log('Columns: ' + result.headers.length);
} else {
  console.error('Error processing data: ' + result.error);
  process.exit(1);
}
