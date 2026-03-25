#!/usr/bin/env python3
"""
Process GL_FELA_20210504_Test.txt multi-record fixed-length file
and generate 3 mapped CSV output files.
"""

import csv
import io
import os

INPUT_FILE = os.path.join('input', 'GL_FELA_20210504_Test.txt')
OUTPUT_DIR = 'output'
BASE_NAME = 'GL_FELA_20210504_Test'

# Field definitions: (name, start, end, justify, pad, default, has_remove_leading_zeroes)
HEADER_FIELDS = [
    ('Transaction Code',      1,  2, 'Left',  ' ', 'BH', False),
    ('Company ID',            3,  6, 'Right', '0', '',   True),
    ('Application Area',      7,  8, 'Left',  ' ', '',   False),
    ('Batch Number',          9, 10, 'Right', '0', '01', False),
    ('Data Type Code',       11, 11, 'Left',  ' ', '2',  False),
    ('Batch Total',          12, 25, 'Right', '0', '0',  False),
    ('Closed For Adjustment',26, 26, 'Left',  ' ', '0',  False),
    ('Effective Date',       27, 34, 'Left',  '0', '',   False),
]

DETAIL_FIELDS = [
    ('Transaction Code', 1,   2, 'Left',  ' ', 'PT',   False),
    ('Item',             3,   6, 'Right', '0', '0000', True),
    ('Trans ID',         7,   7, 'Left',  ' ', '1',    False),
    ('DRCR Code',        8,   9, 'Right', '0', '',     True),
    ('Company ID',      10,  13, 'Right', '0', '',     True),
    ('Account',         26,  31, 'Right', '0', '',     True),
    ('Mgmt Center',     35,  39, 'Right', '0', '',     True),
    ('Cost Center',     40,  43, 'Right', '0', '0000', True),
    ('Source Code',     44,  47, 'Right', '0', '',     True),
    ('Source Date',     48,  53, 'Left',  '0', '',     False),
    ('Effective Date',  54,  61, 'Left',  '0', '',     False),
    ('Amount',          62,  74, 'Right', '0', '0',    False),
    ('Description',     75, 129, 'Left',  ' ', '',     False),
    ('Fund Serial',    130, 138, 'Right', '0', '',     True),
]

TRAILER_FIELDS = [
    ('Transaction Code', 1,  2, 'Left',  ' ', 'BT', False),
    ('Company ID',       3,  6, 'Right', '0', '',   True),
    ('Application Area', 7,  8, 'Left',  ' ', '',   False),
    ('Batch Number',     9, 10, 'Right', '0', '01', False),
    ('Data Type Code',  11, 11, 'Left',  ' ', '2',  False),
    ('Batch Total',     12, 25, 'Right', '0', '0',  False),
]


def extract_field(line, start, end, justify, pad, default, remove_leading_zeroes):
    """Extract a field from a fixed-length line using the mapping rules."""
    # 1-indexed to 0-indexed, handle short lines
    s = start - 1
    e = min(end, len(line))
    
    if s >= len(line):
        # Line is shorter than field start position
        raw = ''
    else:
        raw = line[s:e]
    
    # Apply justify/pad stripping
    if justify == 'Right' and pad == '0':
        # Right-justified, pad='0': strip LEADING zeros
        value = raw.lstrip('0')
    elif justify == 'Right' and pad == ' ':
        # Right-justified, pad=' ': strip LEADING spaces
        value = raw.lstrip(' ')
    elif justify == 'Left' and pad == '0':
        # Left-justified, pad='0': strip TRAILING zeros
        value = raw.rstrip('0')
    elif justify == 'Left' and pad == ' ':
        # Left-justified, pad=' ': strip TRAILING spaces
        value = raw.rstrip(' ')
    else:
        value = raw
    
    # RemoveLeadingZeroes: if stripping made it empty, return '0'
    if remove_leading_zeroes and value == '':
        value = '0'
    
    # If value is empty and default exists, use default
    if value == '' and default != '':
        value = default
    
    return value


def extract_record(line, field_defs):
    """Extract all fields from a line using field definitions."""
    record = {}
    for (name, start, end, justify, pad, default, rlz) in field_defs:
        record[name] = extract_field(line, start, end, justify, pad, default, rlz)
    return record


def detect_record_type(line):
    """Detect record type from line content."""
    if line.startswith('PT'):
        return 'Detail'
    elif line.startswith('BT'):
        return 'Trailer'
    elif len(line) > 0 and line[0] == 'B':
        # First-char fallback for Header (config says BH but data has B1)
        return 'Header'
    return None


def csv_value(val):
    """Format a value for CSV output, quoting if necessary."""
    if ',' in val or '"' in val or '\n' in val:
        return '"' + val.replace('"', '""') + '"'
    return val


def build_csv(headers, rows):
    """Build CSV string from headers and row dicts."""
    lines = []
    lines.append(','.join(headers))
    for row in rows:
        line_vals = []
        for h in headers:
            line_vals.append(csv_value(row.get(h, '')))
        lines.append(','.join(line_vals))
    return '\n'.join(lines) + '\n'


def main():
    # Read input file
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    input_lines = content.splitlines()
    
    headers_data = []
    details_data = []
    trailers_data = []
    
    for line in input_lines:
        if not line.strip():
            continue
        
        rtype = detect_record_type(line)
        if rtype == 'Header':
            record = extract_record(line, HEADER_FIELDS)
            headers_data.append(record)
        elif rtype == 'Detail':
            record = extract_record(line, DETAIL_FIELDS)
            details_data.append(record)
        elif rtype == 'Trailer':
            record = extract_record(line, TRAILER_FIELDS)
            trailers_data.append(record)
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Build CSVs
    header_cols = [f[0] for f in HEADER_FIELDS]
    detail_cols = [f[0] for f in DETAIL_FIELDS]
    trailer_cols = [f[0] for f in TRAILER_FIELDS]
    
    h_csv = build_csv(header_cols, headers_data)
    d_csv = build_csv(detail_cols, details_data)
    t_csv = build_csv(trailer_cols, trailers_data)
    
    h_path = os.path.join(OUTPUT_DIR, f'{BASE_NAME}_Headers_Mapped.csv')
    d_path = os.path.join(OUTPUT_DIR, f'{BASE_NAME}_Details_Mapped.csv')
    t_path = os.path.join(OUTPUT_DIR, f'{BASE_NAME}_Trailers_Mapped.csv')
    
    with open(h_path, 'w', encoding='utf-8', newline='') as f:
        f.write(h_csv)
    with open(d_path, 'w', encoding='utf-8', newline='') as f:
        f.write(d_csv)
    with open(t_path, 'w', encoding='utf-8', newline='') as f:
        f.write(t_csv)
    
    print(f'Headers: {len(headers_data)} records -> {h_path}')
    print(f'Details: {len(details_data)} records -> {d_path}')
    print(f'Trailers: {len(trailers_data)} records -> {t_path}')
    
    # Print first few detail records for verification
    print('\n--- Header Record ---')
    if headers_data:
        for k, v in headers_data[0].items():
            print(f'  {k}: [{v}]')
    
    print('\n--- First Detail Record ---')
    if details_data:
        for k, v in details_data[0].items():
            print(f'  {k}: [{v}]')
    
    print('\n--- Last Detail Record ---')
    if details_data:
        for k, v in details_data[-1].items():
            print(f'  {k}: [{v}]')
    
    print('\n--- Trailer Record ---')
    if trailers_data:
        for k, v in trailers_data[0].items():
            print(f'  {k}: [{v}]')


if __name__ == '__main__':
    main()
