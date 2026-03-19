#!/usr/bin/env python3
"""
Cerner GL Transaction Mapper
Processes input data using mapping table configuration
"""

import csv
import re
from datetime import datetime

# Global counter for increment functionality
increment_counter = 0

def parse_csv(text, delimiter):
    """Parse CSV text with proper quote handling"""
    lines = [line for line in text.strip().split('\n') if line.strip()]
    result = []
    for line in lines:
        row = []
        current = ''
        in_quotes = False
        i = 0
        while i < len(line):
            char = line[i]
            if char == '"':
                if in_quotes and i + 1 < len(line) and line[i + 1] == '"':
                    current += '"'
                    i += 1
                else:
                    in_quotes = not in_quotes
            elif char == delimiter and not in_quotes:
                row.append(current)
                current = ''
            else:
                current += char
            i += 1
        row.append(current)
        result.append(row)
    return result

def apply_logic(logic, data, field, row_index):
    """Apply transformation logic to data"""
    global increment_counter
    
    if not logic:
        return None
    
    logic = logic.strip()
    
    # Increment By 1
    if re.match(r'^Increment By 1$', logic, re.I):
        increment_counter += 1
        return str(increment_counter)
    
    # Hardcode
    match = re.match(r'^Hardcode\s+[\'"](.*)[\'"]\s*$', logic, re.I)
    if match:
        return match.group(1)
    
    # RemoveLeadingZeroes
    if re.match(r'^RemoveLeadingZeroes\(', logic, re.I):
        col_match = re.search(r'Column(\d+)', logic, re.I)
        if col_match:
            col_idx = int(col_match.group(1)) - 1
            if col_idx < len(data):
                value = data[col_idx] or ''
                result = re.sub(r'^0+', '', value)
                return result if result else '0'
    
    # Trim
    if re.match(r'^Trim\(', logic, re.I):
        col_match = re.search(r'Column(\d+)', logic, re.I)
        if col_match:
            col_idx = int(col_match.group(1)) - 1
            if col_idx < len(data):
                return (data[col_idx] or '').strip()
    
    # Left
    match = re.match(r'Left\(Column(\d+),\s*(\d+)\)', logic, re.I)
    if match:
        col_idx = int(match.group(1)) - 1
        length = int(match.group(2))
        if col_idx < len(data):
            return (data[col_idx] or '')[:length]
    
    # Right
    match = re.match(r'Right\(Column(\d+),\s*(\d+)\)', logic, re.I)
    if match:
        col_idx = int(match.group(1)) - 1
        length = int(match.group(2))
        if col_idx < len(data):
            return (data[col_idx] or '')[-length:]
    
    # If conditional
    if re.match(r'^If\s', logic, re.I):
        match = re.match(r'If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*\'?([^\'\s]*)\'?\s+Then\s+\'?([^\'\s]+)\'?(?:\s+Else\s+\'?([^\'\s]+)\'?)?', logic, re.I)
        if match:
            condition_ref = match.group(1).strip()
            col_match = re.search(r'Column(\d+)', condition_ref, re.I)
            if col_match:
                col_idx = int(col_match.group(1)) - 1
                condition_ref = data[col_idx] if col_idx < len(data) else ''
            
            operator = match.group(2)
            compare_value = match.group(3)
            then_result = match.group(4)
            else_result = match.group(5) or ''
            
            # Replace Column references in results
            col_match = re.search(r'Column(\d+)', then_result, re.I)
            if col_match:
                col_idx = int(col_match.group(1)) - 1
                then_result = data[col_idx] if col_idx < len(data) else ''
            
            col_match = re.search(r'Column(\d+)', else_result, re.I)
            if col_match:
                col_idx = int(col_match.group(1)) - 1
                else_result = data[col_idx] if col_idx < len(data) else ''
            
            condition = False
            if operator in ['==', '=']:
                condition = condition_ref == compare_value
            elif operator == '!=':
                condition = condition_ref != compare_value
            
            return then_result if condition else else_result
    
    # DateReformat
    match = re.match(r'DateReformat\(Column(\d+),\s*\'([^\']*)\',\s*\'([^\']*)\'\)', logic, re.I)
    if match:
        col_idx = int(match.group(1)) - 1
        input_format = match.group(2).upper()
        output_format = match.group(3).upper()
        if col_idx < len(data):
            date_str = data[col_idx] or ''
            if input_format == 'MMDDYYYY' and output_format == 'YYYYMMDD' and len(date_str) == 8:
                return date_str[4:8] + date_str[0:4]
            return date_str
    
    # Column reference
    col_match = re.match(r'^Column(\d+)$', logic, re.I)
    if col_match:
        col_idx = int(col_match.group(1)) - 1
        if col_idx < len(data):
            return data[col_idx] or ''
    
    return None

def transform_data(input_text, mapping_text, delimiter, skip_rows):
    """Transform input data using mapping table"""
    global increment_counter
    increment_counter = 0
    
    # Parse mapping table
    mapping_rows = parse_csv(mapping_text, ',')
    mapping_headers = [h.replace(' ', '').strip().lower() for h in mapping_rows[0]]
    
    mappings = []
    for i in range(1, len(mapping_rows)):
        obj = {}
        for j, header in enumerate(mapping_headers):
            if j < len(mapping_rows[i]):
                obj[header] = mapping_rows[i][j].strip()
        mappings.append(obj)
    
    # Parse input data
    all_data = parse_csv(input_text, delimiter)
    input_data = all_data[skip_rows:]
    
    # Build mapping rules
    mapping_rules = []
    headers = []
    for m in mappings:
        field = m.get('targetfieldname', '')
        if not field:
            continue
        logic = m.get('mappinglogic', '')
        col_num = m.get('inputcolumnnumber', '')
        required = m.get('required', '').upper() == 'Y'
        
        mapping_rules.append({
            'field': field,
            'logic': logic,
            'colNum': int(col_num) - 1 if col_num else None,
            'required': required
        })
        headers.append(field)
    
    # Transform data
    results = []
    for row_idx, row in enumerate(input_data):
        record = {}
        for rule in mapping_rules:
            value = None
            if rule['logic'] and rule['logic'].strip():
                value = apply_logic(rule['logic'], row, rule['field'], row_idx)
            elif rule['colNum'] is not None:
                if rule['colNum'] < len(row):
                    value = row[rule['colNum']] or ''
            
            record[rule['field']] = value if value is not None else ''
        results.append(record)
    
    # Generate CSV output
    csv_lines = [','.join(headers)]
    for record in results:
        row_values = []
        for header in headers:
            value = str(record.get(header, ''))
            if ',' in value or '"' in value or '\n' in value:
                value = '"' + value.replace('"', '""') + '"'
            row_values.append(value)
        csv_lines.append(','.join(row_values))
    
    return {
        'success': True,
        'transformedData': results,
        'csvOutput': '\n'.join(csv_lines),
        'recordCount': len(results)
    }

# Main execution
if __name__ == '__main__':
    # Read input files
    with open('input/CernerGLTrans_20251025.txt', 'r', encoding='utf-8') as f:
        input_text = f.read()
    
    with open('input/CernerGL_MappingTable.csv', 'r', encoding='utf-8') as f:
        mapping_text = f.read()
    
    # Transform data
    result = transform_data(input_text, mapping_text, ',', 0)
    
    if result['success']:
        # Write CSV output
        with open('output/CernerGLTrans_20251025_mapped.csv', 'w', encoding='utf-8', newline='') as f:
            f.write(result['csvOutput'])
        
        print(f"SUCCESS: Processed {result['recordCount']} records")
        print("Output file: output/CernerGLTrans_20251025_mapped.csv")
        print("Mapper file: output/CernerGLTrans_mapper.js")
    else:
        print("ERROR: Processing failed")
