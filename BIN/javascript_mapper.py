#!/usr/bin/env python3
"""
JavaScript Mapper - Generate Mapper JS v2.0 (.exe)
Interactive CLI that replicates the 'Generate Mapper JS v2.0' hook workflow.
Processes delimited or fixed-length input files using CSV mapping tables,
generates both Runtime Flexible and Self Contained .js mapper files and
mapped .csv output, archives processed files, and optionally creates a
tabbed HTML viewer showing both JS files and downloadable CSV output.

Supports:
  - Delimited files (CSV, pipe, tab, custom)
  - Fixed-length single-record files
  - Fixed-length multi-record files (with auto-detection of concatenated records)
  - Always generates both Runtime Flexible and Self Contained JS
"""

import os
import sys
import re
import shutil
import subprocess
from datetime import datetime

# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def cls():
    os.system('cls' if os.name == 'nt' else 'clear')

def banner():
    print('=' * 60)
    print('   JavaScript Mapper - Generate Mapper JS v2.0')
    print('   Interactive Data Transformation Tool')
    print('=' * 60)
    print()

def resolve(path):
    """Resolve path relative to the exe/script location."""
    base = os.path.dirname(os.path.abspath(sys.argv[0]))
    if os.path.basename(base).upper() == 'BIN':
        base = os.path.dirname(base)
    return os.path.join(base, path)

def ensure_dir(path):
    d = resolve(path)
    if not os.path.isdir(d):
        os.makedirs(d, exist_ok=True)
    return d

def list_files(directory, extensions=None):
    """List files in a directory, optionally filtered by extension."""
    d = resolve(directory)
    if not os.path.isdir(d):
        return []
    files = []
    for f in sorted(os.listdir(d)):
        fp = os.path.join(d, f)
        if os.path.isfile(fp):
            if extensions is None or any(f.lower().endswith(e) for e in extensions):
                files.append(f)
    return files

def pick_file(prompt_text, directory, extensions=None):
    """Let user pick a file from a numbered list."""
    files = list_files(directory, extensions)
    if not files:
        print(f'  No matching files found in /{directory}/')
        sys.exit(1)
    print(prompt_text)
    for i, f in enumerate(files, 1):
        print(f'  [{i}] {f}')
    print()
    while True:
        choice = input('  Enter number: ').strip()
        if choice.isdigit() and 1 <= int(choice) <= len(files):
            return files[int(choice) - 1]
        print('  Invalid choice, try again.')

def ask_choice(prompt_text, options):
    """Let user pick from a list of options."""
    print(prompt_text)
    for i, (label, _) in enumerate(options, 1):
        print(f'  [{i}] {label}')
    print()
    while True:
        choice = input('  Enter number: ').strip()
        if choice.isdigit() and 1 <= int(choice) <= len(options):
            return options[int(choice) - 1][1]
        print('  Invalid choice, try again.')

def ask_yes_no(prompt_text):
    while True:
        ans = input(f'{prompt_text} (y/n): ').strip().lower()
        if ans in ('y', 'yes'):
            return True
        if ans in ('n', 'no'):
            return False
        print('  Please enter y or n.')

def read_file(path):
    with open(resolve(path), 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def write_file(path, content):
    with open(resolve(path), 'w', encoding='utf-8', newline='') as f:
        f.write(content)


# ---------------------------------------------------------------------------
# CSV Parser (mirrors mapper-core.js parseCSV)
# ---------------------------------------------------------------------------

def parse_csv(text, delimiter):
    lines = [l for l in text.replace('\r\n', '\n').split('\n') if l.strip()]
    result = []
    for line in lines:
        row = []
        current = ''
        in_quotes = False
        i = 0
        while i < len(line):
            ch = line[i]
            if ch == '"':
                if in_quotes and i + 1 < len(line) and line[i + 1] == '"':
                    current += '"'
                    i += 1
                else:
                    in_quotes = not in_quotes
            elif ch == delimiter and not in_quotes:
                row.append(current)
                current = ''
            else:
                current += ch
            i += 1
        row.append(current)
        result.append(row)
    return result

def normalize_key(key):
    return re.sub(r'\s+', '', key).strip().lower()


# ---------------------------------------------------------------------------
# Fixed-length line parser
# ---------------------------------------------------------------------------

def parse_fixed_line(line, mapping_rules):
    """Extract fields from a fixed-length line using start/end positions."""
    fields = []
    for rule in mapping_rules:
        start = rule.get('start', 0)
        end = rule.get('end', 0)
        if start > 0 and end > 0 and end <= len(line):
            fields.append(line[start - 1:end])
        elif start > 0 and start <= len(line):
            fields.append(line[start - 1:])
        else:
            fields.append('')
    return fields

# ---------------------------------------------------------------------------
# Transformation engine (mirrors mapper-core.js applyLogic)
# ---------------------------------------------------------------------------

increment_counter = 0

def apply_logic(logic, data, field, row_index):
    global increment_counter
    if not logic:
        return None
    logic = logic.strip()

    # Increment By 1
    if re.match(r'^Increment By 1$', logic, re.I):
        increment_counter += 1
        return str(increment_counter)

    # Hardcode
    m = re.match(r'^Hardcode\s+[\'"](.*)[\'"]\s*$', logic, re.I)
    if m:
        return m.group(1)

    # Static quoted value
    if re.match(r'^[\'"].*[\'"]$', logic):
        return logic[1:-1]

    # RemoveLeadingZeroes
    if re.match(r'^RemoveLeadingZeroes\(', logic, re.I):
        cm = re.search(r'Column(\d+)', logic, re.I)
        if cm:
            idx = int(cm.group(1)) - 1
            val = data[idx] if idx < len(data) else ''
            return re.sub(r'^0+', '', val or '') or '0'

    # RemoveTrailingSpaces
    if re.match(r'^RemoveTrailingSpaces\(', logic, re.I):
        cm = re.search(r'Column(\d+)', logic, re.I)
        if cm:
            idx = int(cm.group(1)) - 1
            return (data[idx] if idx < len(data) else '').rstrip()

    # Trim
    if re.match(r'^Trim\(', logic, re.I):
        cm = re.search(r'Column(\d+)', logic, re.I)
        if cm:
            idx = int(cm.group(1)) - 1
            return (data[idx] if idx < len(data) else '').strip()

    # Uppercase
    if re.match(r'^Uppercase\(', logic, re.I):
        cm = re.search(r'Column(\d+)', logic, re.I)
        if cm:
            idx = int(cm.group(1)) - 1
            return (data[idx] if idx < len(data) else '').upper()

    # Lowercase
    if re.match(r'^Lowercase\(', logic, re.I):
        cm = re.search(r'Column(\d+)', logic, re.I)
        if cm:
            idx = int(cm.group(1)) - 1
            return (data[idx] if idx < len(data) else '').lower()

    # Left
    m = re.match(r'Left\(Column(\d+),\s*(\d+)\)', logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        length = int(m.group(2))
        return (data[idx] if idx < len(data) else '')[:length]

    # Right
    m = re.match(r'Right\(Column(\d+),\s*(\d+)\)', logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        length = int(m.group(2))
        val = data[idx] if idx < len(data) else ''
        return val[-length:] if val else ''

    # Substring
    m = re.match(r'Substring\(Column(\d+),\s*(\d+),\s*(\d+)\)', logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        start = int(m.group(2))
        length = int(m.group(3))
        val = data[idx] if idx < len(data) else ''
        return val[start - 1:start - 1 + length] if val else ''

    # Concat
    if re.match(r'^Concat\(', logic, re.I):
        cols = re.findall(r'Column(\d+)', logic, re.I)
        if cols:
            return ''.join(data[int(c) - 1] if int(c) - 1 < len(data) else '' for c in cols)

    # Replace
    m = re.match(r"Replace\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)", logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        val = data[idx] if idx < len(data) else ''
        return val.replace(m.group(2), m.group(3))

    # PadLeft
    m = re.match(r"PadLeft\(Column(\d+),\s*(\d+),\s*'([^']*)'\)", logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        val = data[idx] if idx < len(data) else ''
        return val.rjust(int(m.group(2)), m.group(3))

    # PadRight
    m = re.match(r"PadRight\(Column(\d+),\s*(\d+),\s*'([^']*)'\)", logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        val = data[idx] if idx < len(data) else ''
        return val.ljust(int(m.group(2)), m.group(3))

    # AddLeft
    m = re.match(r"AddLeft\(Column(\d+),\s*'([^']*)',\s*(\d+)\)", logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        val = data[idx] if idx < len(data) else ''
        return m.group(2) * int(m.group(3)) + val

    # AddRight
    m = re.match(r"AddRight\(Column(\d+),\s*'([^']*)',\s*(\d+)\)", logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        val = data[idx] if idx < len(data) else ''
        return val + m.group(2) * int(m.group(3))

    # Sum
    if re.match(r'^Sum\(', logic, re.I):
        cols = re.findall(r'Column(\d+)', logic, re.I)
        if cols:
            total = 0.0
            for c in cols:
                val = (data[int(c) - 1] if int(c) - 1 < len(data) else '0').strip()
                if not re.match(r'^-?\d*\.?\d+$', val):
                    raise ValueError(f'Non-numeric value in Sum: {val}')
                total += float(val)
            return str(total)

    # Multiply
    m = re.match(r'Multiply\(Column(\d+),\s*Column(\d+)\)', logic, re.I)
    if m:
        a = float((data[int(m.group(1)) - 1] if int(m.group(1)) - 1 < len(data) else '0').strip() or '0')
        b = float((data[int(m.group(2)) - 1] if int(m.group(2)) - 1 < len(data) else '0').strip() or '0')
        return str(a * b)

    # Divide
    m = re.match(r'Divide\(Column(\d+),\s*Column(\d+)\)', logic, re.I)
    if m:
        a = float((data[int(m.group(1)) - 1] if int(m.group(1)) - 1 < len(data) else '0').strip() or '0')
        b = float((data[int(m.group(2)) - 1] if int(m.group(2)) - 1 < len(data) else '0').strip() or '0')
        return str(a / b) if b != 0 else '0'

    # Round
    m = re.match(r'Round\(Column(\d+),\s*(\d+)\)', logic, re.I)
    if m:
        val = float((data[int(m.group(1)) - 1] if int(m.group(1)) - 1 < len(data) else '0').strip() or '0')
        return str(round(val, int(m.group(2))))

    # Abs
    if re.match(r'^Abs\(', logic, re.I):
        cm = re.search(r'Column(\d+)', logic, re.I)
        if cm:
            val = float((data[int(cm.group(1)) - 1] if int(cm.group(1)) - 1 < len(data) else '0').strip() or '0')
            return str(abs(val))

    # DateReformat
    m = re.match(r"DateReformat\(Column(\d+),\s*'([^']*)',\s*'([^']*)'\)", logic, re.I)
    if m:
        idx = int(m.group(1)) - 1
        date_str = (data[idx] if idx < len(data) else '').strip()
        inf = m.group(2).upper()
        outf = m.group(3).upper()
        if inf == 'MMDDYYYY' and outf == 'YYYYMMDD' and len(date_str) == 8:
            return date_str[4:8] + date_str[0:4]
        if inf == 'YYYYMMDD' and outf == 'MMDDYYYY' and len(date_str) == 8:
            return date_str[4:8] + date_str[0:4]
        if inf == 'YYYYMMDD' and outf == 'MM/DD/YYYY' and len(date_str) == 8:
            return date_str[4:6] + '/' + date_str[6:8] + '/' + date_str[0:4]
        return date_str

    # Today
    if re.match(r'^Today\(', logic, re.I):
        now = datetime.now()
        fm = re.match(r"Today\('([^']*)'\)", logic, re.I)
        if fm:
            fmt = fm.group(1).upper()
            if fmt == 'YYYYMMDD':
                return now.strftime('%Y%m%d')
            if fmt == 'YYYY-MM-DD':
                return now.strftime('%Y-%m-%d')
            if fmt == 'MM/DD/YYYY':
                return now.strftime('%m/%d/%Y')
        return now.strftime('%m/%d/%Y')

    # Now
    if re.match(r'^Now\(', logic, re.I):
        return datetime.now().strftime('%m/%d/%Y, %I:%M:%S %p')

    # If conditional
    if re.match(r'^If\s', logic, re.I):
        m = re.match(
            r"If\s+([^!=<>]+)\s*(==?|!=|>|<|>=|<=)\s*'?([^'\s]*)'?\s+Then\s+'?([^'\s]+)'?"
            r"(?:\s+Else\s+'?([^'\s]+)'?)?",
            logic, re.I
        )
        if m:
            cond_ref = m.group(1).strip()
            cm2 = re.search(r'Column(\d+)', cond_ref, re.I)
            if cm2:
                idx = int(cm2.group(1)) - 1
                cond_ref = data[idx] if idx < len(data) else ''
            op = m.group(2)
            cmp_val = m.group(3)
            then_val = m.group(4)
            else_val = m.group(5) or ''
            cm2 = re.search(r'Column(\d+)', then_val, re.I)
            if cm2:
                idx = int(cm2.group(1)) - 1
                then_val = data[idx] if idx < len(data) else ''
            cm2 = re.search(r'Column(\d+)', else_val, re.I)
            if cm2:
                idx = int(cm2.group(1)) - 1
                else_val = data[idx] if idx < len(data) else ''
            result = False
            if op in ('==', '='):
                result = cond_ref == cmp_val
            elif op == '!=':
                result = cond_ref != cmp_val
            elif op == '>':
                try: result = float(cond_ref) > float(cmp_val)
                except: pass
            elif op == '<':
                try: result = float(cond_ref) < float(cmp_val)
                except: pass
            elif op == '>=':
                try: result = float(cond_ref) >= float(cmp_val)
                except: pass
            elif op == '<=':
                try: result = float(cond_ref) <= float(cmp_val)
                except: pass
            return then_val if result else else_val

    # String concat with +
    if '+' in logic:
        def repl_right(m):
            idx = int(m.group(1)) - 1
            length = int(m.group(2))
            val = data[idx] if idx < len(data) else ''
            return val[-length:] if val else ''
        def repl_left(m):
            idx = int(m.group(1)) - 1
            length = int(m.group(2))
            return (data[idx] if idx < len(data) else '')[:length]
        def repl_col(m):
            idx = int(m.group(1)) - 1
            return data[idx] if idx < len(data) else ''
        s = re.sub(r'Right\(Column(\d+),\s*(\d+)\)', repl_right, logic, flags=re.I)
        s = re.sub(r'Left\(Column(\d+),\s*(\d+)\)', repl_left, s, flags=re.I)
        s = re.sub(r'Column(\d+)', repl_col, s, flags=re.I)
        return re.sub(r'\s*\+\s*', '', s)

    # Plain column reference
    cm = re.match(r'^Column(\d+)$', logic, re.I)
    if cm:
        idx = int(cm.group(1)) - 1
        return data[idx] if idx < len(data) else ''

    # Fallback: treat as static text
    if not re.search(r'Column\d+', logic, re.I):
        return logic

    return None


# ---------------------------------------------------------------------------
# Delimited transform
# ---------------------------------------------------------------------------

def transform_delimited(input_text, mapping_text, delimiter, skip_rows):
    global increment_counter
    increment_counter = 0

    mapping_rows = parse_csv(mapping_text, ',')
    mapping_headers = [normalize_key(h) for h in mapping_rows[0]]
    mappings = []
    for i in range(1, len(mapping_rows)):
        obj = {}
        for j, hdr in enumerate(mapping_headers):
            obj[hdr] = mapping_rows[i][j].strip() if j < len(mapping_rows[i]) else ''
        mappings.append(obj)

    all_data = parse_csv(input_text, delimiter)
    input_data = all_data[skip_rows:]

    rules = []
    headers = []
    for m in mappings:
        field = m.get('targetfieldname', '') or m.get('fieldname', '')
        if not field:
            continue
        logic = m.get('mappinglogic', '')
        col_num = m.get('inputcolumnnumber', '')
        required = m.get('required', '').upper() == 'Y'
        rules.append({'field': field, 'logic': logic,
                       'colNum': int(col_num) - 1 if col_num else None,
                       'required': required})
        headers.append(field)

    results = []
    errors = []
    for ri, row in enumerate(input_data):
        record = {}
        for rule in rules:
            try:
                if rule['logic'] and rule['logic'].strip():
                    value = apply_logic(rule['logic'], row, rule['field'], ri)
                elif rule['colNum'] is not None and rule['colNum'] < len(row):
                    value = row[rule['colNum']] or ''
                else:
                    value = None
                record[rule['field']] = value if value is not None else ''
            except Exception as e:
                record[rule['field']] = ''
                errors.append(f'Row {ri + 1}, Field "{rule["field"]}": {e}')
        results.append(record)

    csv_lines = [','.join(headers)]
    for rec in results:
        vals = []
        for h in headers:
            v = str(rec.get(h, '') or '')
            if ',' in v or '"' in v or '\n' in v:
                v = '"' + v.replace('"', '""') + '"'
            vals.append(v)
        csv_lines.append(','.join(vals))

    return {
        'success': True,
        'headers': headers,
        'results': results,
        'csvOutput': '\n'.join(csv_lines),
        'recordCount': len(results),
        'errors': errors,
        'rules': rules
    }

# ---------------------------------------------------------------------------
# Fixed-length transform
# ---------------------------------------------------------------------------

def parse_fixed_mapping(mapping_text):
    rows = parse_csv(mapping_text, ',')
    hdrs = [normalize_key(h) for h in rows[0]]
    rules = []
    for i in range(1, len(rows)):
        obj = {}
        for j, h in enumerate(hdrs):
            obj[h] = rows[i][j].strip() if j < len(rows[i]) else ''
        field = obj.get('fieldname', '') or obj.get('targetfieldname', '')
        start = int(obj.get('start', '0') or '0')
        end = int(obj.get('end', '0') or '0')
        logic = obj.get('mappinglogic', '') or obj.get('defaultvalue', '')
        required = obj.get('required', '').upper() == 'Y'
        rules.append({'field': field, 'start': start, 'end': end,
                       'logic': logic, 'required': required})
    return rules

def detect_record_length(raw_text, valid_indicators):
    """Auto-detect fixed record length for concatenated records (no newlines)."""
    total = len(raw_text)
    for rl in range(100, 10001):
        if total % rl != 0:
            continue
        all_valid = True
        for p in range(0, total, rl):
            if raw_text[p] not in valid_indicators:
                all_valid = False
                break
        if all_valid and total // rl > 1:
            return rl
    return 0

def split_concatenated_records(raw_text, valid_indicators):
    """Split a single concatenated line into individual records."""
    rec_len = detect_record_length(raw_text, valid_indicators)
    if rec_len > 0:
        lines = [raw_text[p:p + rec_len] for p in range(0, len(raw_text), rec_len)]
        print(f'  Auto-detected record length: {rec_len} ({len(lines)} records)')
        return lines
    return [raw_text]

def transform_fixed(input_text, mapping_rules, target_headers):
    global increment_counter
    increment_counter = 0

    lines = [l for l in input_text.replace('\r\n', '\n').split('\n') if l.strip()]
    results = []
    errors = []
    for li, line in enumerate(lines):
        data = []
        for rule in mapping_rules:
            s = rule['start']
            e = rule['end']
            if s > 0 and e > 0:
                data.append(line[s - 1:e] if e <= len(line) else line[s - 1:])
            else:
                data.append('')
        record = {}
        for ri, rule in enumerate(mapping_rules):
            try:
                if rule['logic'] and rule['logic'].strip():
                    value = apply_logic(rule['logic'], data, rule['field'], li)
                else:
                    value = data[ri] if ri < len(data) else ''
                record[rule['field']] = (value if value is not None else '').strip()
            except Exception as e:
                record[rule['field']] = ''
                errors.append(f'Line {li + 1}, Field "{rule["field"]}": {e}')
        results.append(record)

    headers = target_headers or [r['field'] for r in mapping_rules if r['field']]
    csv_lines = [','.join(headers)]
    for rec in results:
        vals = []
        for h in headers:
            v = str(rec.get(h, '') or '')
            if ',' in v or '"' in v or '\n' in v:
                v = '"' + v.replace('"', '""') + '"'
            vals.append(v)
        csv_lines.append(','.join(vals))

    return {
        'success': True,
        'headers': headers,
        'results': results,
        'csvOutput': '\n'.join(csv_lines),
        'recordCount': len(results),
        'errors': errors,
        'rules': mapping_rules
    }


# ---------------------------------------------------------------------------
# JS code generator - Runtime Flexible
# ---------------------------------------------------------------------------

def generate_js_runtime_flexible(rules, file_type, delimiter=','):
    """Generate Runtime Flexible ES5 JavaScript mapper code."""
    lines = []
    lines.append('// Auto-generated Runtime Flexible Mapper')
    lines.append('// Generated: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    lines.append('// Type: ' + file_type)
    lines.append('')
    lines.append("var fs = require('fs');")
    lines.append('')
    lines.append('// CSV Parser')
    lines.append('function parseCSV(text, delimiter) {')
    lines.append("  var lines = text.split(/\\r?\\n/).filter(function(l) { return l.trim() !== ''; });")
    lines.append('  return lines.map(function(line) {')
    lines.append("    var result = []; var current = ''; var inQuotes = false;")
    lines.append('    for (var i = 0; i < line.length; i++) {')
    lines.append('      var ch = line[i];')
    lines.append("      if (ch === '\"') {")
    lines.append("        if (inQuotes && line[i+1] === '\"') { current += '\"'; i++; }")
    lines.append('        else { inQuotes = !inQuotes; }')
    lines.append("      } else if (ch === delimiter && !inQuotes) { result.push(current); current = ''; }")
    lines.append('      else { current += ch; }')
    lines.append('    }')
    lines.append('    result.push(current); return result;')
    lines.append('  });')
    lines.append('}')
    lines.append('')
    lines.append("function normalizeKey(k) { return k.replace(/\\s+/g, '').trim().toLowerCase(); }")
    lines.append('')
    lines.append('var incrementCounter = 0;')
    lines.append('')
    lines.append('function applyLogic(logic, data, field, rowIndex) {')
    lines.append('  if (!logic) return null;')
    lines.append('  logic = logic.trim();')
    lines.append('  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return String(incrementCounter); }')
    lines.append("  if (/^Hardcode\\s+['\"](.*)['\"]/i.test(logic)) { return logic.match(/^Hardcode\\s+['\"](.*)['\"]/i)[1]; }")
    lines.append("  if (/^['\"].*['\"]$/.test(logic)) { return logic.slice(1, -1); }")
    lines.append('  var col = logic.match(/^Column(\\d+)$/i);')
    lines.append("  if (col) return (data[col[1]-1] || '');")
    lines.append("  if (/^RemoveLeadingZeroes\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').replace(/^0+/,'')||'0'; }")
    lines.append("  if (/^RemoveTrailingSpaces\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').replace(/\\s+$/,''); }")
    lines.append("  if (/^Trim\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').trim(); }")
    lines.append("  if (/^Uppercase\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').toUpperCase(); }")
    lines.append("  if (/^Lowercase\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').toLowerCase(); }")
    lines.append("  if (/^Left\\(/i.test(logic)) { var m=logic.match(/Left\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').substring(0,parseInt(m[2])); }")
    lines.append("  if (/^Right\\(/i.test(logic)) { var m=logic.match(/Right\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').slice(-parseInt(m[2])); }")
    lines.append("  if (/^Substring\\(/i.test(logic)) { var m=logic.match(/Substring\\(Column(\\d+),\\s*(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').substring(parseInt(m[2])-1,parseInt(m[2])-1+parseInt(m[3])); }")
    lines.append("  if (/^Concat\\(/i.test(logic)) { var cs=logic.match(/Column(\\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\\d+/)[0];return data[n-1]||'';}).join(''); }")
    lines.append("  if (/^Replace\\(/i.test(logic)) { var m=logic.match(/Replace\\(Column(\\d+),\\s*'([^']*)',\\s*'([^']*)'\\)/i); if(m) return (data[m[1]-1]||'').split(m[2]).join(m[3]); }")
    lines.append("  if (/^PadLeft\\(/i.test(logic)) { var m=logic.match(/PadLeft\\(Column(\\d+),\\s*(\\d+),\\s*'([^']*)'\\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=m[3]+v;return v;} }")
    lines.append("  if (/^PadRight\\(/i.test(logic)) { var m=logic.match(/PadRight\\(Column(\\d+),\\s*(\\d+),\\s*'([^']*)'\\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=v+m[3];return v;} }")
    lines.append("  if (/^Sum\\(/i.test(logic)) { var cs=logic.match(/Column(\\d+)/gi); if(cs){var t=0;cs.forEach(function(c){var n=c.match(/\\d+/)[0];t+=parseFloat(data[n-1]||'0')||0;});return String(t);} }")
    lines.append("  if (/^Multiply\\(/i.test(logic)) { var m=logic.match(/Multiply\\(Column(\\d+),\\s*Column(\\d+)\\)/i); if(m) return String((parseFloat(data[m[1]-1])||0)*(parseFloat(data[m[2]-1])||0)); }")
    lines.append("  if (/^Divide\\(/i.test(logic)) { var m=logic.match(/Divide\\(Column(\\d+),\\s*Column(\\d+)\\)/i); if(m){var b=parseFloat(data[m[2]-1])||0;return b!==0?String((parseFloat(data[m[1]-1])||0)/b):'0';} }")
    lines.append("  if (/^Round\\(/i.test(logic)) { var m=logic.match(/Round\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return String(parseFloat((parseFloat(data[m[1]-1])||0).toFixed(parseInt(m[2])))); }")
    lines.append("  if (/^Abs\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return String(Math.abs(parseFloat(data[c[1]-1])||0)); }")
    lines.append("  if (/^DateReformat\\(/i.test(logic)) { var m=logic.match(/DateReformat\\(Column(\\d+),\\s*'([^']*)',\\s*'([^']*)'\\)/i); if(m){var d=(data[m[1]-1]||'').trim();var inf=m[2].toUpperCase();var outf=m[3].toUpperCase();if(inf==='MMDDYYYY'&&outf==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MMDDYYYY'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MM/DD/YYYY'&&d.length===8)return d.substring(4,6)+'/'+d.substring(6,8)+'/'+d.substring(0,4);return d;} }")
    lines.append("  if (/^Today\\(/i.test(logic)) { var d=new Date();function pad(n){return n<10?'0'+n:n;}var fm=logic.match(/Today\\('([^']*)'\\)/i);if(fm){var fmt=fm[1].toUpperCase();if(fmt==='YYYYMMDD')return d.getFullYear()+''+pad(d.getMonth()+1)+pad(d.getDate());if(fmt==='YYYY-MM-DD')return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());if(fmt==='MM/DD/YYYY')return pad(d.getMonth()+1)+'/'+pad(d.getDate())+'/'+d.getFullYear();}return d.toLocaleDateString('en-US'); }")
    lines.append("  if (/^Now\\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }")
    lines.append("  if (/^If\\s/i.test(logic)) { var sm=logic.match(/If\\s+([^!=<>]+)\\s*(==?|!=|>|<|>=|<=)\\s*'?([^'\\s]*)'?\\s+Then\\s+'?([^'\\s]+)'?(?:\\s+Else\\s+'?([^'\\s]+)'?)?/i);if(sm){var cr=sm[1].trim();var colR=cr.match(/Column(\\d+)/i);if(colR)cr=data[colR[1]-1]||'';var op=sm[2];var cv=sm[3];var tv=sm[4];var ev=sm[5]||'';var tr2=tv.match(/Column(\\d+)/i);if(tr2)tv=data[tr2[1]-1]||'';var er2=ev.match(/Column(\\d+)/i);if(er2)ev=data[er2[1]-1]||'';var cond=false;if(op==='=='||op==='=')cond=cr==cv;else if(op==='!=')cond=cr!=cv;else if(op==='>')cond=parseFloat(cr)>parseFloat(cv);else if(op==='<')cond=parseFloat(cr)<parseFloat(cv);else if(op==='>=' )cond=parseFloat(cr)>=parseFloat(cv);else if(op==='<=')cond=parseFloat(cr)<=parseFloat(cv);return cond?tv:ev;} }")
    lines.append("  if (/\\+/.test(logic)) { return logic.replace(/Right\\(Column(\\d+),\\s*(\\d+)\\)/gi,function(m,c,l){return(data[c-1]||'').slice(-parseInt(l));}).replace(/Left\\(Column(\\d+),\\s*(\\d+)\\)/gi,function(m,c,l){return(data[c-1]||'').substring(0,parseInt(l));}).replace(/Column(\\d+)/gi,function(m,c){return data[c-1]||'';}).replace(/\\s*\\+\\s*/g,''); }")
    lines.append("  if (!/Column\\d+/i.test(logic)) return logic;")
    lines.append('  return null;')
    lines.append('}')
    lines.append('')
    lines.append('function transformData(inputText, mappingTable, delimiter, skipRows) {')
    lines.append('  try {')
    lines.append("    var mRows = parseCSV(mappingTable, ',');")
    lines.append('    var mHeaders = mRows[0].map(normalizeKey);')
    lines.append('    var mappings = [];')
    lines.append('    for (var i=1; i<mRows.length; i++) {')
    lines.append("      var obj = {};")
    lines.append("      for (var j=0; j<mHeaders.length; j++) { obj[mHeaders[j]] = (mRows[i][j]||'').trim(); }")
    lines.append('      mappings.push(obj);')
    lines.append('    }')
    lines.append('    var allData = parseCSV(inputText, delimiter);')
    lines.append('    var inputData = allData.slice(skipRows || 0);')
    lines.append('    incrementCounter = 0;')
    lines.append('    var rules = []; var headers = [];')
    lines.append('    mappings.forEach(function(m) {')
    lines.append("      var field = m['targetfieldname'] || m['fieldname'] || '';")
    lines.append('      if (!field) return;')
    lines.append("      rules.push({field:field, logic:m['mappinglogic']||'', colNum:m['inputcolumnnumber']?parseInt(m['inputcolumnnumber'])-1:null});")
    lines.append('      headers.push(field);')
    lines.append('    });')
    lines.append("    var csvLines = [headers.join(',')];")
    lines.append('    inputData.forEach(function(row, idx) {')
    lines.append('      var vals = headers.map(function(h, hi) {')
    lines.append('        var r = rules[hi]; var v;')
    lines.append('        if (r.logic && r.logic.trim()) v = applyLogic(r.logic, row, r.field, idx);')
    lines.append("        else if (r.colNum !== null) v = row[r.colNum] || '';")
    lines.append("        else v = '';")
    lines.append("        v = v != null ? v.toString() : '';")
    lines.append("        return /[\",\\n]/.test(v) ? '\"'+v.replace(/\"/g,'\"\"')+'\"' : v;")
    lines.append('      });')
    lines.append("      csvLines.push(vals.join(','));")
    lines.append('    });')
    lines.append("    return { success:true, csvOutput:csvLines.join('\\n'), recordCount:inputData.length };")
    lines.append('  } catch(e) { return { success:false, error:e.message }; }')
    lines.append('}')
    lines.append('')
    lines.append("if (typeof module !== 'undefined' && module.exports) {")
    lines.append('  module.exports = { parseCSV:parseCSV, transformData:transformData, applyLogic:applyLogic };')
    lines.append('}')
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# JS code generator - Runtime Flexible Multi-Record
# ---------------------------------------------------------------------------

def generate_js_runtime_flexible_multirecord(record_types_info, input_file, config_file):
    """Generate Runtime Flexible ES5 JS mapper for multi-record fixed-length files."""
    lines = []
    lines.append('// Auto-generated Runtime Flexible Multi-Record Fixed-Length Mapper')
    lines.append('// Generated: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    lines.append('// Type: Fixed-Length Multi-Record')
    lines.append('// Input: ' + input_file)
    lines.append('// Config: ' + config_file)
    lines.append('')
    lines.append("var fs = require('fs');")
    lines.append('')
    lines.append('function parseCSV(text, delimiter) {')
    lines.append("  var lines = text.split(/\\r?\\n/).filter(function(l) { return l.trim() !== ''; });")
    lines.append('  return lines.map(function(line) {')
    lines.append("    var result = []; var current = ''; var inQuotes = false;")
    lines.append('    for (var i = 0; i < line.length; i++) {')
    lines.append('      var ch = line[i];')
    lines.append("      if (ch === '\"') {")
    lines.append("        if (inQuotes && line[i+1] === '\"') { current += '\"'; i++; }")
    lines.append('        else { inQuotes = !inQuotes; }')
    lines.append("      } else if (ch === delimiter && !inQuotes) { result.push(current); current = ''; }")
    lines.append('      else { current += ch; }')
    lines.append('    }')
    lines.append('    result.push(current); return result;')
    lines.append('  });')
    lines.append('}')
    lines.append('')
    lines.append("function normalizeKey(k) { return k.replace(/\\s+/g, '').trim().toLowerCase(); }")
    lines.append('var incrementCounter = 0;')
    lines.append('')
    # Full applyLogic function
    lines.append('function applyLogic(logic, data, field, rowIndex) {')
    lines.append('  if (!logic) return null;')
    lines.append('  logic = logic.trim();')
    lines.append('  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return String(incrementCounter); }')
    lines.append("  if (/^Hardcode\\s+['\"](.*)['\"]/i.test(logic)) { return logic.match(/^Hardcode\\s+['\"](.*)['\"]/i)[1]; }")
    lines.append("  if (/^['\"].*['\"]$/.test(logic)) { return logic.slice(1, -1); }")
    lines.append("  if (/^RemoveLeadingZeroes\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').replace(/^0+/,'')||'0'; }")
    lines.append("  if (/^RemoveTrailingSpaces\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').replace(/\\s+$/,''); }")
    lines.append("  if (/^Trim\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').trim(); }")
    lines.append("  if (/^Uppercase\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').toUpperCase(); }")
    lines.append("  if (/^Lowercase\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').toLowerCase(); }")
    lines.append("  if (/^Left\\(/i.test(logic)) { var m=logic.match(/Left\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').substring(0,parseInt(m[2])); }")
    lines.append("  if (/^Right\\(/i.test(logic)) { var m=logic.match(/Right\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').slice(-parseInt(m[2])); }")
    lines.append("  if (/^Substring\\(/i.test(logic)) { var m=logic.match(/Substring\\(Column(\\d+),\\s*(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').substring(parseInt(m[2])-1,parseInt(m[2])-1+parseInt(m[3])); }")
    lines.append("  if (/^Concat\\(/i.test(logic)) { var cs=logic.match(/Column(\\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\\d+/)[0];return data[n-1]||'';}).join(''); }")
    lines.append("  if (/^Replace\\(/i.test(logic)) { var m=logic.match(/Replace\\(Column(\\d+),\\s*'([^']*)',\\s*'([^']*)'\\)/i); if(m) return (data[m[1]-1]||'').split(m[2]).join(m[3]); }")
    lines.append("  if (/^PadLeft\\(/i.test(logic)) { var m=logic.match(/PadLeft\\(Column(\\d+),\\s*(\\d+),\\s*'([^']*)'\\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=m[3]+v;return v;} }")
    lines.append("  if (/^PadRight\\(/i.test(logic)) { var m=logic.match(/PadRight\\(Column(\\d+),\\s*(\\d+),\\s*'([^']*)'\\)/i); if(m){var v=data[m[1]-1]||'';while(v.length<parseInt(m[2]))v=v+m[3];return v;} }")
    lines.append("  if (/^Sum\\(/i.test(logic)) { var cs=logic.match(/Column(\\d+)/gi); if(cs){var t=0;cs.forEach(function(c){var n=c.match(/\\d+/)[0];t+=parseFloat(data[n-1]||'0')||0;});return String(t);} }")
    lines.append("  if (/^Multiply\\(/i.test(logic)) { var m=logic.match(/Multiply\\(Column(\\d+),\\s*Column(\\d+)\\)/i); if(m) return String((parseFloat(data[m[1]-1])||0)*(parseFloat(data[m[2]-1])||0)); }")
    lines.append("  if (/^Divide\\(/i.test(logic)) { var m=logic.match(/Divide\\(Column(\\d+),\\s*Column(\\d+)\\)/i); if(m){var b=parseFloat(data[m[2]-1])||0;return b!==0?String((parseFloat(data[m[1]-1])||0)/b):'0';} }")
    lines.append("  if (/^Round\\(/i.test(logic)) { var m=logic.match(/Round\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return String(parseFloat((parseFloat(data[m[1]-1])||0).toFixed(parseInt(m[2])))); }")
    lines.append("  if (/^Abs\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return String(Math.abs(parseFloat(data[c[1]-1])||0)); }")
    lines.append("  if (/^DateReformat\\(/i.test(logic)) { var m=logic.match(/DateReformat\\(Column(\\d+),\\s*'([^']*)',\\s*'([^']*)'\\)/i); if(m){var d=(data[m[1]-1]||'').trim();var inf=m[2].toUpperCase();var outf=m[3].toUpperCase();if(inf==='MMDDYYYY'&&outf==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MMDDYYYY'&&d.length===8)return d.substring(4,8)+d.substring(0,4);if(inf==='YYYYMMDD'&&outf==='MM/DD/YYYY'&&d.length===8)return d.substring(4,6)+'/'+d.substring(6,8)+'/'+d.substring(0,4);return d;} }")
    lines.append("  if (/^Today\\(/i.test(logic)) { var d=new Date();function pad(n){return n<10?'0'+n:n;}var fm=logic.match(/Today\\('([^']*)'\\)/i);if(fm){var fmt=fm[1].toUpperCase();if(fmt==='YYYYMMDD')return d.getFullYear()+''+pad(d.getMonth()+1)+pad(d.getDate());if(fmt==='YYYY-MM-DD')return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());if(fmt==='MM/DD/YYYY')return pad(d.getMonth()+1)+'/'+pad(d.getDate())+'/'+d.getFullYear();}return d.toLocaleDateString('en-US'); }")
    lines.append("  if (/^Now\\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }")
    lines.append("  if (/^If\\s/i.test(logic)) { var sm=logic.match(/If\\s+([^!=<>]+)\\s*(==?|!=|>|<|>=|<=)\\s*'?([^'\\s]*)'?\\s+Then\\s+'?([^'\\s]+)'?(?:\\s+Else\\s+'?([^'\\s]+)'?)?/i);if(sm){var cr=sm[1].trim();var colR=cr.match(/Column(\\d+)/i);if(colR)cr=data[colR[1]-1]||'';var op=sm[2];var cv=sm[3];var tv=sm[4];var ev=sm[5]||'';var tr2=tv.match(/Column(\\d+)/i);if(tr2)tv=data[tr2[1]-1]||'';var er2=ev.match(/Column(\\d+)/i);if(er2)ev=data[er2[1]-1]||'';var cond=false;if(op==='=='||op==='=')cond=cr==cv;else if(op==='!=')cond=cr!=cv;else if(op==='>')cond=parseFloat(cr)>parseFloat(cv);else if(op==='<')cond=parseFloat(cr)<parseFloat(cv);else if(op==='>=')cond=parseFloat(cr)>=parseFloat(cv);else if(op==='<=')cond=parseFloat(cr)<=parseFloat(cv);return cond?tv:ev;} }")
    lines.append("  if (/\\+/.test(logic)) { return logic.replace(/Right\\(Column(\\d+),\\s*(\\d+)\\)/gi,function(m,c,l){return(data[c-1]||'').slice(-parseInt(l));}).replace(/Left\\(Column(\\d+),\\s*(\\d+)\\)/gi,function(m,c,l){return(data[c-1]||'').substring(0,parseInt(l));}).replace(/Column(\\d+)/gi,function(m,c){return data[c-1]||'';}).replace(/\\s*\\+\\s*/g,''); }")
    lines.append('  var colMatch = logic.match(/^Column(\\d+)$/i);')
    lines.append("  if (colMatch) return data[colMatch[1]-1] || '';")
    lines.append("  if (!/Column\\d+/i.test(logic)) return logic;")
    lines.append('  return null;')
    lines.append('}')
    lines.append('')
    # Fixed-length extraction
    lines.append('function extractFixedFields(line, rules) {')
    lines.append('  var data = [];')
    lines.append('  for (var i = 0; i < rules.length; i++) {')
    lines.append('    var s = rules[i].start; var e = rules[i].end;')
    lines.append('    if (s > 0 && e > 0 && e <= line.length) data.push(line.substring(s-1, e));')
    lines.append('    else if (s > 0 && s <= line.length) data.push(line.substring(s-1));')
    lines.append("    else data.push('');")
    lines.append('  }')
    lines.append('  return data;')
    lines.append('}')
    lines.append('')
    # Mapping file parser
    lines.append("function parseMappingFile(mappingText) {")
    lines.append("  var rows = parseCSV(mappingText, ',');")
    lines.append('  var hdrs = rows[0].map(normalizeKey);')
    lines.append('  var rules = [];')
    lines.append('  for (var i = 1; i < rows.length; i++) {')
    lines.append("    var obj = {};")
    lines.append("    for (var j = 0; j < hdrs.length; j++) { obj[hdrs[j]] = (rows[i][j] || '').trim(); }")
    lines.append("    var field = obj['fieldname'] || obj['targetfieldname'] || '';")
    lines.append("    var start = parseInt(obj['start'] || '0') || 0;")
    lines.append("    var end = parseInt(obj['end'] || '0') || 0;")
    lines.append("    var logic = obj['mappinglogic'] || obj['defaultvalue'] || '';")
    lines.append("    var required = (obj['required'] || '').toUpperCase() === 'Y';")
    lines.append('    rules.push({ field: field, start: start, end: end, logic: logic, required: required });')
    lines.append('  }')
    lines.append('  return rules;')
    lines.append('}')
    lines.append('')
    # Config parser
    lines.append("function parseRecordTypeConfig(configText) {")
    lines.append("  var rows = parseCSV(configText, ',');")
    lines.append('  var hdrs = rows[0].map(normalizeKey);')
    lines.append('  var types = [];')
    lines.append('  for (var i = 1; i < rows.length; i++) {')
    lines.append("    var obj = {};")
    lines.append("    for (var j = 0; j < hdrs.length; j++) { obj[hdrs[j]] = (rows[i][j] || '').trim(); }")
    lines.append("    types.push({ recordType: obj['recordtype']||'', indicatorPos: parseInt(obj['typeindicatorposition']||'1'), indicatorValue: obj['typeindicatorvalue']||'', mappingFile: obj['mappingfile']||'', parentRecordType: obj['parentrecordtype']||'', outputName: obj['outputname']||'' });")
    lines.append('  }')
    lines.append('  return types;')
    lines.append('}')
    lines.append('')
    # Multi-record transform with auto-detection
    lines.append('function transformMultiRecord(inputText, configText, mappingFiles) {')
    lines.append('  try {')
    lines.append('    var recordTypes = parseRecordTypeConfig(configText);')
    lines.append('    var mappingRulesMap = {}; var headersMap = {};')
    lines.append('    for (var rt = 0; rt < recordTypes.length; rt++) {')
    lines.append("      var mappingText = mappingFiles[recordTypes[rt].mappingFile];")
    lines.append('      if (!mappingText) continue;')
    lines.append('      var rules = parseMappingFile(mappingText);')
    lines.append('      mappingRulesMap[recordTypes[rt].indicatorValue] = rules;')
    lines.append("      headersMap[recordTypes[rt].indicatorValue] = rules.map(function(r){return r.field;}).filter(function(f){return f;});")
    lines.append('    }')
    lines.append("    var lines = inputText.split(/\\r?\\n/).filter(function(l){return l.trim()!=='';});")
    lines.append('    if (lines.length === 1 && lines[0].length > 0) {')
    lines.append('      var raw = lines[0]; var detectedLen = 0;')
    lines.append('      var validIndicators = {};')
    lines.append('      for (var rt2=0;rt2<recordTypes.length;rt2++) validIndicators[recordTypes[rt2].indicatorValue]=true;')
    lines.append('      for (var rl=100;rl<=10000;rl++) {')
    lines.append('        if (raw.length%rl!==0) continue;')
    lines.append('        var allValid=true;')
    lines.append('        for (var p=0;p<raw.length;p+=rl) { if(!validIndicators[raw.charAt(p)]){allValid=false;break;} }')
    lines.append('        if (allValid&&raw.length/rl>1) { detectedLen=rl; break; }')
    lines.append('      }')
    lines.append('      if (detectedLen>0) {')
    lines.append('        lines=[];')
    lines.append('        for (var p=0;p<raw.length;p+=detectedLen) lines.push(raw.substring(p,p+detectedLen));')
    lines.append('      }')
    lines.append('    }')
    lines.append('    var resultsByType={}; var errors=[]; incrementCounter=0;')
    lines.append('    for (var li=0;li<lines.length;li++) {')
    lines.append("      var line=lines[li]; var typeIndicator='';")
    lines.append('      for (var rt=0;rt<recordTypes.length;rt++) {')
    lines.append('        var pos=recordTypes[rt].indicatorPos; var expected=recordTypes[rt].indicatorValue;')
    lines.append('        if (line.length>=pos&&line.substring(pos-1,pos)===expected) { typeIndicator=expected; break; }')
    lines.append('      }')
    lines.append('      if (!typeIndicator||!mappingRulesMap[typeIndicator]) continue;')
    lines.append('      var rules=mappingRulesMap[typeIndicator]; var headers=headersMap[typeIndicator];')
    lines.append('      var data=extractFixedFields(line,rules);')
    lines.append('      var record={};')
    lines.append('      for (var ri=0;ri<rules.length;ri++) {')
    lines.append('        var rule=rules[ri]; if(!rule.field) continue;')
    lines.append("        try { var value; if(rule.logic&&rule.logic.trim()) value=applyLogic(rule.logic,data,rule.field,li); else value=(data[ri]||'').trim(); record[rule.field]=value!=null?value.toString():''; }")
    lines.append("        catch(e) { record[rule.field]=''; errors.push('Line '+(li+1)+', Field \"'+rule.field+'\": '+e.message); }")
    lines.append('      }')
    lines.append('      if (!resultsByType[typeIndicator]) resultsByType[typeIndicator]=[];')
    lines.append('      resultsByType[typeIndicator].push(record);')
    lines.append('    }')
    lines.append('    var csvOutputs={}; var totalRecords=0;')
    lines.append('    for (var ti in headersMap) {')
    lines.append('      if (!headersMap.hasOwnProperty(ti)) continue;')
    lines.append('      var h=headersMap[ti]; var recs=resultsByType[ti]||[]; totalRecords+=recs.length;')
    lines.append("      var csvLines=[h.join(',')];")
    lines.append('      for (var r=0;r<recs.length;r++) {')
    lines.append('        var vals=[];')
    lines.append("        for (var hi=0;hi<h.length;hi++) { var v=recs[r][h[hi]]!=null?recs[r][h[hi]].toString():''; if(/[\",\\n]/.test(v))v='\"'+v.replace(/\"/g,'\"\"')+'\"'; vals.push(v); }")
    lines.append("        csvLines.push(vals.join(','));")
    lines.append('      }')
    lines.append("      csvOutputs[ti]=csvLines.join('\\n');")
    lines.append('    }')
    lines.append('    return { success:true, resultsByType:resultsByType, csvOutputs:csvOutputs, headersMap:headersMap, recordTypes:recordTypes, totalRecords:totalRecords, errors:errors };')
    lines.append('  } catch(e) { return { success:false, error:e.message }; }')
    lines.append('}')
    lines.append('')
    lines.append("if (typeof module !== 'undefined' && module.exports) {")
    lines.append('  module.exports = { parseCSV:parseCSV, normalizeKey:normalizeKey, applyLogic:applyLogic, extractFixedFields:extractFixedFields, parseMappingFile:parseMappingFile, parseRecordTypeConfig:parseRecordTypeConfig, transformMultiRecord:transformMultiRecord };')
    lines.append('}')
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# JS code generator - Self Contained
# ---------------------------------------------------------------------------

def generate_js_self_contained(rules, results, headers, file_type):
    """Generate Self Contained ES5 JavaScript mapper with hardcoded rules."""
    lines = []
    lines.append('// Auto-generated Self Contained Mapper')
    lines.append('// Generated: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    lines.append('// Type: ' + file_type)
    lines.append('// Records: ' + str(len(results)))
    lines.append('')
    lines.append('function mapRecord(data, rowIndex) {')
    lines.append('  var record = {};')
    for r in rules:
        field = r.get('field', '')
        logic = r.get('logic', '')
        col_num = r.get('colNum')
        start = r.get('start')
        end = r.get('end')
        if not field:
            continue
        safe_field = field.replace("'", "\\'")
        if logic and logic.strip():
            safe_logic = logic.replace('\\', '\\\\').replace("'", "\\'")
            lines.append(f"  record['{safe_field}'] = applyLogic('{safe_logic}', data, '{safe_field}', rowIndex);")
        elif col_num is not None:
            lines.append(f"  record['{safe_field}'] = data[{col_num}] || '';")
        elif start is not None and start > 0:
            idx = rules.index(r)
            lines.append(f"  record['{safe_field}'] = (data[{idx}] || '').trim();")
        else:
            lines.append(f"  record['{safe_field}'] = '';")
    lines.append('  return record;')
    lines.append('}')
    lines.append('')
    lines.append('var incrementCounter = 0;')
    lines.append('')
    lines.append('function applyLogic(logic, data, field, rowIndex) {')
    lines.append('  if (!logic) return null;')
    lines.append('  logic = logic.trim();')
    lines.append('  if (/^Increment By 1$/i.test(logic)) { incrementCounter++; return String(incrementCounter); }')
    lines.append("  if (/^Hardcode\\s+['\"](.*)['\"]/i.test(logic)) { return logic.match(/^Hardcode\\s+['\"](.*)['\"]/i)[1]; }")
    lines.append("  if (/^['\"].*['\"]$/.test(logic)) { return logic.slice(1, -1); }")
    lines.append('  var col = logic.match(/^Column(\\d+)$/i);')
    lines.append("  if (col) return (data[col[1]-1] || '');")
    lines.append("  if (/^RemoveLeadingZeroes\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').replace(/^0+/,'')||'0'; }")
    lines.append("  if (/^RemoveTrailingSpaces\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').replace(/\\s+$/,''); }")
    lines.append("  if (/^Trim\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').trim(); }")
    lines.append("  if (/^Uppercase\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').toUpperCase(); }")
    lines.append("  if (/^Lowercase\\(/i.test(logic)) { var c=logic.match(/Column(\\d+)/i); if(c) return (data[c[1]-1]||'').toLowerCase(); }")
    lines.append("  if (/^Left\\(/i.test(logic)) { var m=logic.match(/Left\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').substring(0,parseInt(m[2])); }")
    lines.append("  if (/^Right\\(/i.test(logic)) { var m=logic.match(/Right\\(Column(\\d+),\\s*(\\d+)\\)/i); if(m) return (data[m[1]-1]||'').slice(-parseInt(m[2])); }")
    lines.append("  if (/^Concat\\(/i.test(logic)) { var cs=logic.match(/Column(\\d+)/gi); if(cs) return cs.map(function(c){var n=c.match(/\\d+/)[0];return data[n-1]||'';}).join(''); }")
    lines.append("  if (/^DateReformat\\(/i.test(logic)) { var m=logic.match(/DateReformat\\(Column(\\d+),\\s*'([^']*)',\\s*'([^']*)'\\)/i); if(m){var d=data[m[1]-1]||'';if(m[2].toUpperCase()==='MMDDYYYY'&&m[3].toUpperCase()==='YYYYMMDD'&&d.length===8)return d.substring(4,8)+d.substring(0,4);return d;} }")
    lines.append("  if (/^Today\\(/i.test(logic)) { var d=new Date(); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); }")
    lines.append("  if (/^Now\\(/i.test(logic)) { return new Date().toLocaleString('en-US'); }")
    lines.append("  if (!/Column\\d+/i.test(logic)) return logic;")
    lines.append('  return null;')
    lines.append('}')
    lines.append('')
    lines.append('var MAPPING_RULES = ' + str([{'field': r.get('field',''), 'logic': r.get('logic',''), 'colNum': r.get('colNum'), 'start': r.get('start'), 'end': r.get('end')} for r in rules if r.get('field')]).replace("None", "null") + ';')
    lines.append('')
    lines.append("var HEADERS = " + str(headers) + ";")
    lines.append('')
    lines.append("if (typeof module !== 'undefined' && module.exports) {")
    lines.append('  module.exports = { mapRecord:mapRecord, applyLogic:applyLogic, MAPPING_RULES:MAPPING_RULES, HEADERS:HEADERS };')
    lines.append('}')
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# HTML output generator (Function_Reference.html theme)
# ---------------------------------------------------------------------------

def _escape_html(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def generate_html_viewer(csv_output, output_name):
    """Generate an HTML file showing the mapped CSV output with the Function_Reference theme."""
    rows = parse_csv(csv_output, ',')
    if not rows:
        return '<html><body>No data</body></html>'
    headers = rows[0]
    data_rows = rows[1:]

    header_cells = ''.join(f'<th>{_escape_html(h)}</th>' for h in headers)
    body_rows = ''
    for i, row in enumerate(data_rows):
        cls = 'even' if i % 2 == 0 else 'odd'
        cells = ''.join(f'<td title="{_escape_html(row[j] if j < len(row) else "")}">{_escape_html(row[j] if j < len(row) else "")}</td>' for j in range(len(headers)))
        body_rows += f'<tr class="{cls}">{cells}</tr>\n'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapped Output - {_escape_html(output_name)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(rgba(248,250,252,0.9), rgba(248,250,252,0.9)),
        repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(148,163,184,0.1) 20px),
        repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(148,163,184,0.1) 20px),
        radial-gradient(circle at 20px 20px, rgba(59,130,246,0.15) 2px, transparent 2px), #f8fafc;
      background-size: 40px 40px; color: #1f2937; margin: 0; padding: 20px; min-height: 100vh;
    }}
    .container {{
      background: #fff; border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1);
      padding: 32px; max-width: 95%; margin: auto; border: 1px solid #e5e7eb;
    }}
    h1 {{ font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 4px 0; }}
    .title-text {{
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }}
    .subtitle {{ text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px; }}
    .gradient-divider {{
      height: 4px;
      background: linear-gradient(90deg, #1e3a8a 0%, #3730a3 25%, #5b21b6 50%, #7c2d12 75%, #1e40af 100%);
      border-radius: 2px; margin-bottom: 24px;
    }}
    .stats {{ display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }}
    .stat-card {{
      background: linear-gradient(135deg, #667eea22, #764ba222);
      border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 20px; font-size: 14px;
    }}
    .stat-card strong {{ color: #4f46e5; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }}
    th {{
      background: linear-gradient(135deg, #667eea, #764ba2); color: #fff;
      padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px;
      position: sticky; top: 0; white-space: nowrap;
    }}
    td {{ padding: 8px 12px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }}
    tr.even {{ background: #fff; }}
    tr.odd {{ background: #f8fafc; }}
    tr:hover {{ background: #eef2ff; }}
    .table-wrap {{ overflow-x: auto; max-height: 75vh; overflow-y: auto; border-radius: 8px; border: 1px solid #e5e7eb; }}
    .footer {{ text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <h1><span class="title-text">Mapped Output Viewer</span></h1>
    <div class="subtitle">{_escape_html(output_name)}</div>
    <div class="gradient-divider"></div>
    <div class="stats">
      <div class="stat-card"><strong>{len(data_rows)}</strong> Records</div>
      <div class="stat-card"><strong>{len(headers)}</strong> Columns</div>
      <div class="stat-card">Generated: <strong>{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</strong></div>
    </div>
    <div class="table-wrap">
      <table><thead><tr>{header_cells}</tr></thead><tbody>{body_rows}</tbody></table>
    </div>
    <div class="footer">JavaScript Mapper - Generated Output</div>
  </div>
</body>
</html>'''


def generate_html_viewer_multirecord(csv_outputs_by_name, output_name):
    """Generate a tabbed HTML viewer for multi-record type output."""
    # Build tab data
    tab_data = {}
    for name, csv_text in csv_outputs_by_name.items():
        rows = parse_csv(csv_text, ',')
        headers = rows[0] if rows else []
        data_rows = rows[1:] if len(rows) > 1 else []
        tab_data[name] = {'headers': headers, 'rows': data_rows}

    first_tab = list(tab_data.keys())[0] if tab_data else ''
    total_records = sum(len(t['rows']) for t in tab_data.values())

    # Build summary cards
    summary_html = ''
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
    for i, (name, td) in enumerate(tab_data.items()):
        c = colors[i % len(colors)]
        summary_html += f'<div class="summary-card"><div class="icon" style="color:{c};font-size:20px;">&#9632;</div><div class="count">{len(td["rows"])}</div><div class="label">{_escape_html(name)}</div></div>'

    # Build tab buttons
    tab_btns = ''
    for i, name in enumerate(tab_data.keys()):
        active = ' active' if i == 0 else ''
        sel = 'true' if i == 0 else 'false'
        cnt = len(tab_data[name]['rows'])
        tab_btns += f'<button class="tab-btn{active}" data-tab="{name}" role="tab" aria-selected="{sel}">{_escape_html(name)} <span class="badge">{cnt}</span></button>'

    # Build tab content
    tab_contents = ''
    for i, (name, td) in enumerate(tab_data.items()):
        active = ' active' if i == 0 else ''
        header_cells = ''.join(f'<th>{_escape_html(h)}</th>' for h in td['headers'])
        body_rows = ''
        for ri, row in enumerate(td['rows']):
            cls = 'even' if ri % 2 == 0 else 'odd'
            cells = ''.join(f'<td title="{_escape_html(row[j] if j < len(row) else "")}">{_escape_html(row[j] if j < len(row) else "")}</td>' for j in range(len(td['headers'])))
            body_rows += f'<tr class="{cls}">{cells}</tr>\n'
        tab_contents += f'''<div class="tab-content{active}" id="tab-{name}">
  <div class="data-table-wrapper"><table><thead><tr>{header_cells}</tr></thead><tbody>{body_rows}</tbody></table></div>
</div>'''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapped Output - {_escape_html(output_name)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *,*::before,*::after {{ box-sizing: border-box; }}
    body {{
      font-family: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      background: linear-gradient(rgba(248,250,252,0.9),rgba(248,250,252,0.9)),
        repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),
        repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),
        radial-gradient(circle at 20px 20px,rgba(59,130,246,0.15) 2px,transparent 2px),#f8fafc;
      background-size:40px 40px; color:#1f2937; margin:0; padding:20px; min-height:100vh;
    }}
    .container {{
      background:#fff; border-radius:12px;
      box-shadow:0 4px 20px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.1);
      padding:32px; max-width:1400px; margin:auto; border:1px solid #e5e7eb;
    }}
    h1 {{ font-size:32px; font-weight:700; text-align:center; margin:0 0 4px 0; }}
    .title-text {{
      background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }}
    .subtitle {{ text-align:center; color:#6b7280; font-size:14px; margin-bottom:20px; }}
    .gradient-divider {{
      height:4px;
      background:linear-gradient(90deg,#1e3a8a 0%,#3730a3 25%,#5b21b6 50%,#7c2d12 75%,#1e40af 100%);
      border-radius:2px; margin-bottom:24px;
    }}
    .info-bar {{
      background:linear-gradient(135deg,#eff6ff,#f5f3ff); border:1px solid #c7d2fe;
      border-radius:10px; padding:16px 24px; margin-bottom:24px;
      display:flex; gap:24px; flex-wrap:wrap; font-size:13px; color:#4b5563;
    }}
    .info-item {{ display:flex; align-items:center; gap:6px; }}
    .info-label {{ font-weight:600; color:#374151; }}
    .summary-bar {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; margin-bottom:24px; }}
    .summary-card {{
      background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px;
      padding:16px 20px; text-align:center; transition:all 0.2s;
    }}
    .summary-card:hover {{ border-color:#93c5fd; box-shadow:0 4px 12px rgba(59,130,246,0.1); transform:translateY(-1px); }}
    .summary-card .count {{
      font-size:28px; font-weight:700;
      background:linear-gradient(135deg,#667eea,#764ba2);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }}
    .summary-card .label {{ font-size:13px; color:#6b7280; margin-top:4px; }}
    .tab-nav {{ display:flex; gap:4px; border-bottom:2px solid #e5e7eb; flex-wrap:wrap; }}
    .tab-btn {{
      padding:10px 20px; border:none; background:none; font-family:inherit;
      font-size:14px; font-weight:500; color:#6b7280; cursor:pointer;
      border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s;
    }}
    .tab-btn:hover {{ color:#374151; background:#f9fafb; }}
    .tab-btn.active {{ color:#667eea; border-bottom-color:#667eea; font-weight:600; }}
    .tab-btn .badge {{
      font-size:11px; background:#e5e7eb; color:#6b7280;
      padding:1px 7px; border-radius:10px; font-weight:600;
    }}
    .tab-btn.active .badge {{ background:#ede9fe; color:#667eea; }}
    .tab-content {{ display:none; padding-top:20px; }}
    .tab-content.active {{ display:block; }}
    .data-table-wrapper {{ overflow-x:auto; border:1px solid #e5e7eb; border-radius:10px; }}
    table {{ width:100%; border-collapse:collapse; font-size:13px; }}
    thead th {{
      background:linear-gradient(135deg,#f8fafc,#f1f5f9); padding:10px 14px;
      text-align:left; font-weight:600; color:#374151; border-bottom:2px solid #e5e7eb;
      white-space:nowrap; position:sticky; top:0;
    }}
    tbody td {{
      padding:8px 14px; border-bottom:1px solid #f3f4f6; color:#4b5563;
      max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    }}
    tbody tr:hover {{ background:#f9fafb; }}
    tbody tr.even {{ background:#fff; }}
    tbody tr.odd {{ background:#fafbfc; }}
    .footer {{ text-align:center; color:#9ca3af; font-size:12px; margin-top:16px; }}
  </style>
</head>
<body>
  <div class="container">
    <h1><span class="title-text">Multi-Record Mapped Output</span></h1>
    <div class="subtitle">{_escape_html(output_name)}</div>
    <div class="gradient-divider"></div>
    <div class="info-bar">
      <div class="info-item"><span class="info-label">Type:</span> Fixed-Length Multi-Record</div>
      <div class="info-item"><span class="info-label">Total Records:</span> {total_records}</div>
      <div class="info-item"><span class="info-label">Generated:</span> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
    </div>
    <div class="summary-bar">{summary_html}</div>
    <div class="tab-nav" role="tablist">{tab_btns}</div>
    {tab_contents}
    <div class="footer">JavaScript Mapper - Generated Output</div>
  </div>
<script>
var tabBtns = document.querySelectorAll('.tab-btn');
for (var i = 0; i < tabBtns.length; i++) {{
  tabBtns[i].addEventListener('click', function() {{
    for (var j = 0; j < tabBtns.length; j++) {{
      tabBtns[j].classList.remove('active');
      tabBtns[j].setAttribute('aria-selected', 'false');
    }}
    this.classList.add('active');
    this.setAttribute('aria-selected', 'true');
    var tabs = document.querySelectorAll('.tab-content');
    for (var k = 0; k < tabs.length; k++) {{ tabs[k].classList.remove('active'); }}
    document.getElementById('tab-' + this.getAttribute('data-tab')).classList.add('active');
  }});
}}
</script>
</body>
</html>'''


# ---------------------------------------------------------------------------
# HTML output generator v2.0 (CernerGLTrans_20251025_Mapped.html theme)
# Tabbed viewer: Runtime Flexible JS, Self-Contained JS, Mapped CSV with download
# ---------------------------------------------------------------------------

def generate_html_viewer_v2(runtime_js, selfcontained_js, runtime_filename, selfcontained_filename,
                            csv_output, output_name, record_count, field_count, csv_outputs_by_name=None):
    """Generate a tabbed HTML viewer showing both JS files and downloadable CSV output."""
    # Parse CSV for table display
    rows = parse_csv(csv_output, ',')
    headers = rows[0] if rows else []
    data_rows = rows[1:] if len(rows) > 1 else []

    # Build CSV table
    header_cells = ''.join(f'<th>{_escape_html(h)}</th>' for h in headers)
    body_rows_html = ''
    for i, row in enumerate(data_rows):
        cells = ''.join(
            f'<td>{_escape_html(row[j] if j < len(row) else "")}</td>'
            for j in range(len(headers))
        )
        body_rows_html += f'<tr>{cells}</tr>\n'

    # Escape JS code for HTML embedding
    runtime_escaped = _escape_html(runtime_js)
    selfcontained_escaped = _escape_html(selfcontained_js)

    # Escape CSV for JS download blob
    csv_js_escaped = csv_output.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

    # Build multi-record CSV tabs if applicable
    extra_csv_tabs_btns = ''
    extra_csv_tabs_content = ''
    if csv_outputs_by_name and len(csv_outputs_by_name) > 1:
        for name, csv_text in csv_outputs_by_name.items():
            safe_id = re.sub(r'[^a-zA-Z0-9]', '_', name)
            extra_csv_tabs_btns += f'<button class="tab-btn" onclick="showTab(\'csv_{safe_id}\',this)"><span>&#128200;</span> {_escape_html(name)}</button>\n'
            mr_rows = parse_csv(csv_text, ',')
            mr_headers = mr_rows[0] if mr_rows else []
            mr_data = mr_rows[1:] if len(mr_rows) > 1 else []
            mr_hcells = ''.join(f'<th>{_escape_html(h)}</th>' for h in mr_headers)
            mr_body = ''
            for ri, mr_row in enumerate(mr_data):
                mr_cells = ''.join(
                    f'<td>{_escape_html(mr_row[j] if j < len(mr_row) else "")}</td>'
                    for j in range(len(mr_headers))
                )
                mr_body += f'<tr>{mr_cells}</tr>\n'
            mr_csv_esc = csv_text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
            extra_csv_tabs_content += f'''<div id="csv_{safe_id}" class="tab-content">
<button class="download-btn" onclick="downloadBlob(`{mr_csv_esc}`,'{_escape_html(name)}_Mapped.csv')">&#128229; Download {_escape_html(name)} CSV</button>
<div style="height:12px"></div>
<div class="csv-container" style="max-height:600px;overflow-y:auto">
<table class="csv-table"><thead><tr>{mr_hcells}</tr></thead><tbody>{mr_body}</tbody></table>
</div></div>\n'''

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{_escape_html(output_name)} Mapper - Generated Output Viewer</title>
<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
*,*::before,*::after{{box-sizing:border-box}}
body{{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(rgba(248,250,252,0.9),rgba(248,250,252,0.9)),repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(148,163,184,0.1) 20px),radial-gradient(circle at 20px 20px,rgba(59,130,246,0.15) 2px,transparent 2px),#f8fafc;background-size:40px 40px;color:#1f2937;margin:0;padding:20px;min-height:100vh}}
.container{{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.1);padding:32px;max-width:1400px;margin:auto;border:1px solid #e5e7eb}}
h1{{font-size:28px;font-weight:700;text-align:center;margin:0 0 4px 0;display:flex;align-items:center;justify-content:center;gap:12px}}
.title-text{{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}}
.subtitle{{text-align:center;color:#6b7280;font-size:14px;margin-bottom:20px}}
.gradient-divider{{height:4px;background:linear-gradient(90deg,#1e3a8a 0%,#3730a3 25%,#5b21b6 50%,#7c2d12 75%,#1e40af 100%);border-radius:2px;margin-bottom:24px}}
.tab-nav{{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;border-bottom:2px solid #e5e7eb;padding-bottom:12px}}
.tab-btn{{padding:10px 20px;border-radius:8px 8px 0 0;border:1px solid #d1d5db;border-bottom:none;background:#f9fafb;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;color:#4b5563;display:flex;align-items:center;gap:8px}}
.tab-btn:hover{{background:#f3f4f6;border-color:#9ca3af}}
.tab-btn.active{{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-color:transparent}}
.tab-content{{display:none}}.tab-content.active{{display:block}}
.code-container{{background:#1e293b;border-radius:10px;overflow:hidden;margin-bottom:16px}}
.code-header{{background:#334155;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #475569}}
.code-title{{color:#e2e8f0;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}}
.code-title .badge{{background:#3b82f6;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px}}
.copy-btn{{background:#475569;border:none;color:#e2e8f0;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}}
.copy-btn:hover{{background:#64748b}}.copy-btn.copied{{background:#10b981}}
.code-block{{padding:16px;overflow-x:auto;max-height:600px;overflow-y:auto}}
.code-block pre{{margin:0;font-family:"Fira Code","Cascadia Code","Consolas",monospace;font-size:13px;line-height:1.6;color:#e2e8f0;white-space:pre}}
.csv-container{{overflow-x:auto;border:1px solid #e5e7eb;border-radius:10px}}
.csv-table{{width:100%;border-collapse:collapse;font-size:12px}}
.csv-table th{{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:10px 12px;text-align:left;font-weight:600;white-space:nowrap;position:sticky;top:0}}
.csv-table td{{padding:8px 12px;border-bottom:1px solid #e5e7eb;white-space:nowrap}}
.csv-table tr:nth-child(even){{background:#f9fafb}}.csv-table tr:hover{{background:#eff6ff}}
.stats-bar{{display:flex;gap:20px;margin-bottom:16px;flex-wrap:wrap}}
.stat-item{{background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:8px;padding:12px 20px;display:flex;align-items:center;gap:10px}}
.stat-icon{{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px}}
.stat-value{{font-size:20px;font-weight:700;color:#3730a3}}.stat-label{{font-size:12px;color:#6b7280}}
.info-section{{background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:10px;padding:20px;margin-top:24px}}
.info-section h3{{margin:0 0 12px 0;font-size:16px;color:#3730a3;display:flex;align-items:center;gap:8px}}
.info-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}}
.info-item{{display:flex;gap:8px}}.info-label{{font-weight:600;color:#4b5563;font-size:13px}}.info-value{{color:#6b7280;font-size:13px}}
.download-btn{{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;margin-top:12px}}
.download-btn:hover{{opacity:0.9;transform:translateY(-1px)}}
</style>
</head>
<body>
<div class="container">
<h1><span style="font-size:28px">&#128640;</span> <span class="title-text">{_escape_html(output_name)} Mapper Output</span></h1>
<p class="subtitle">Generated JavaScript Mappers and Transformed CSV Output</p>
<div class="gradient-divider"></div>
<div class="stats-bar">
<div class="stat-item"><div class="stat-icon">&#128196;</div><div><div class="stat-value">{record_count}</div><div class="stat-label">Rows Processed</div></div></div>
<div class="stat-item"><div class="stat-icon">&#128203;</div><div><div class="stat-value">{field_count}</div><div class="stat-label">Output Fields</div></div></div>
<div class="stat-item"><div class="stat-icon">&#9989;</div><div><div class="stat-value">2</div><div class="stat-label">Mapper Types</div></div></div>
</div>
<div class="tab-nav">
<button class="tab-btn active" onclick="showTab('runtime',this)"><span>&#9881;</span> Runtime Flexible JS</button>
<button class="tab-btn" onclick="showTab('selfcontained',this)"><span>&#128230;</span> Self-Contained JS</button>
<button class="tab-btn" onclick="showTab('csv',this)"><span>&#128200;</span> Mapped CSV Output</button>
{extra_csv_tabs_btns}
</div>
<div id="runtime" class="tab-content active">
<div class="code-container"><div class="code-header">
<div class="code-title"><span>{_escape_html(runtime_filename)}</span><span class="badge">ES5</span></div>
<button class="copy-btn" onclick="copyCode('runtimeCode',this)">&#128203; Copy</button>
</div><div class="code-block"><pre id="runtimeCode">{runtime_escaped}</pre></div></div></div>
<div id="selfcontained" class="tab-content">
<div class="code-container"><div class="code-header">
<div class="code-title"><span>{_escape_html(selfcontained_filename)}</span><span class="badge">ES5</span></div>
<button class="copy-btn" onclick="copyCode('selfcontainedCode',this)">&#128203; Copy</button>
</div><div class="code-block"><pre id="selfcontainedCode">{selfcontained_escaped}</pre></div></div></div>
<div id="csv" class="tab-content">
<button class="download-btn" onclick="downloadCSV()">&#128229; Download CSV</button>
<div style="height:12px"></div>
<div class="csv-container" style="max-height:600px;overflow-y:auto">
<table class="csv-table"><thead><tr>{header_cells}</tr></thead><tbody>{body_rows_html}</tbody></table>
</div></div>
{extra_csv_tabs_content}
<div class="info-section">
<h3>&#128712; Generation Info</h3>
<div class="info-grid">
<div class="info-item"><span class="info-label">Generated:</span><span class="info-value">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</span></div>
<div class="info-item"><span class="info-label">Records:</span><span class="info-value">{record_count}</span></div>
<div class="info-item"><span class="info-label">Fields:</span><span class="info-value">{field_count}</span></div>
</div>
</div>
</div>
<script>
function showTab(id, btn) {{
  var contents = document.querySelectorAll('.tab-content');
  for (var i = 0; i < contents.length; i++) contents[i].classList.remove('active');
  var btns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}}
function copyCode(id, btn) {{
  var text = document.getElementById(id).textContent;
  if (navigator.clipboard) {{
    navigator.clipboard.writeText(text).then(function() {{
      btn.innerHTML = '&#9989; Copied';
      btn.classList.add('copied');
      setTimeout(function() {{ btn.innerHTML = '&#128203; Copy'; btn.classList.remove('copied'); }}, 2000);
    }});
  }}
}}
function downloadBlob(content, filename) {{
  var blob = new Blob([content], {{ type: 'text/csv;charset=utf-8;' }});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}}
function downloadCSV() {{
  var csvContent = `{csv_js_escaped}`;
  downloadBlob(csvContent, '{_escape_html(output_name)}.csv');
}}
</script>
</body>
</html>'''
    return html


# ---------------------------------------------------------------------------
# Archive helper
# ---------------------------------------------------------------------------

def archive_file(filename, source_dir='input'):
    """Move a file from source_dir to archive/."""
    src = resolve(os.path.join(source_dir, filename))
    dst_dir = ensure_dir('archive')
    dst = os.path.join(dst_dir, filename)
    if os.path.exists(src):
        if os.path.exists(dst):
            name, ext = os.path.splitext(filename)
            ts = datetime.now().strftime('%Y%m%d%H%M%S')
            dst = os.path.join(dst_dir, f'{name}_{ts}{ext}')
        shutil.move(src, dst)
        print(f'  Archived: {filename} -> /archive/')


# ---------------------------------------------------------------------------
# Main interactive workflow
# ---------------------------------------------------------------------------

def main():
    cls()
    banner()

    input_dir = 'input'
    output_dir = 'output'
    ensure_dir(input_dir)
    ensure_dir(output_dir)
    ensure_dir('archive')

    # Step 1: File type
    print('[Step 1] Input File Type')
    print('-' * 40)
    file_type = ask_choice('  What type is your input file?', [
        ('Delimited (CSV, pipe, tab, etc.)', 'delimited'),
        ('Fixed-Length', 'fixed')
    ])
    print()

    files_to_archive = []
    result = None
    js_runtime_code = ''
    js_selfcontained_code = ''
    js_runtime_filename = ''
    js_selfcontained_filename = ''
    output_base = ''
    is_multirecord = False
    csv_outputs_by_name = {}

    if file_type == 'delimited':
        # --- DELIMITED WORKFLOW ---
        print('[Step 1A] Select Input Data File')
        print('-' * 40)
        input_file = pick_file('  Choose the input data file:', input_dir,
                               ['.csv', '.txt', '.dat', '.tsv'])
        files_to_archive.append(input_file)
        print(f'  Selected: {input_file}')
        print()

        print('[Step 1B] Select Mapping File')
        print('-' * 40)
        mapping_file = pick_file('  Choose the mapping CSV file:', input_dir, ['.csv'])
        files_to_archive.append(mapping_file)
        print(f'  Selected: {mapping_file}')
        print()

        print('[Step 1C] Delimiter')
        print('-' * 40)
        delim = ask_choice('  What delimiter is used in the input data file?', [
            ('Comma (,)', ','),
            ('Pipe (|)', '|'),
            ('Tab', '\t'),
            ('Semicolon (;)', ';'),
            ('Other (enter custom)', 'custom')
        ])
        if delim == 'custom':
            delim = input('  Enter custom delimiter character: ').strip()
            if not delim:
                delim = ','
        print()

        print('[Step 1D] Skip Rows')
        print('-' * 40)
        skip_input = input('  How many rows to skip from top of input file? (0): ').strip()
        skip_rows = int(skip_input) if skip_input.isdigit() else 0
        print()

        # Step 2: Process (v2.0 - generate both Runtime Flexible and Self Contained)
        print('[Step 2] Processing...')
        print('-' * 40)
        input_text = read_file(os.path.join(input_dir, input_file))
        mapping_text = read_file(os.path.join(input_dir, mapping_file))

        result = transform_delimited(input_text, mapping_text, delim, skip_rows)

        if not result['success']:
            print('  ERROR: Processing failed.')
            input('\nPress Enter to exit...')
            sys.exit(1)

        output_base = os.path.splitext(input_file)[0]

        # Generate both JS types (v2.0)
        js_runtime_code = generate_js_runtime_flexible(result['rules'], 'Delimited', delim)
        js_runtime_filename = f'{output_base}_RuntimeFlexible_Mapper.js'
        js_selfcontained_code = generate_js_self_contained(result['rules'], result['results'],
                                                            result['headers'], 'Delimited')
        js_selfcontained_filename = f'{output_base}_SelfContained_Mapper.js'

    else:
        # --- FIXED-LENGTH WORKFLOW ---
        print('[Step 1A] Multi-Record File?')
        print('-' * 40)
        is_multirecord = ask_yes_no('  Is the input data file a multi-record file?')
        print()

        if not is_multirecord:
            # Single record type
            print('[Step 1A.1] Select Input Data File')
            print('-' * 40)
            input_file = pick_file('  Choose the input data file:', input_dir,
                                   ['.txt', '.dat', '.csv'])
            files_to_archive.append(input_file)
            print(f'  Selected: {input_file}')
            print()

            print('[Step 1A.2] Select Mapping File')
            print('-' * 40)
            mapping_file = pick_file('  Choose the mapping CSV file:', input_dir, ['.csv'])
            files_to_archive.append(mapping_file)
            print(f'  Selected: {mapping_file}')
            print()

            # Process (v2.0 - generate both JS types)
            print('[Step 2] Processing...')
            print('-' * 40)
            input_text = read_file(os.path.join(input_dir, input_file))
            mapping_text = read_file(os.path.join(input_dir, mapping_file))

            mapping_rules = parse_fixed_mapping(mapping_text)
            headers = [r['field'] for r in mapping_rules if r['field']]
            result = transform_fixed(input_text, mapping_rules, headers)

            output_base = os.path.splitext(input_file)[0]

            # Generate both JS types (v2.0)
            js_runtime_code = generate_js_runtime_flexible(result['rules'], 'Fixed-Length')
            js_runtime_filename = f'{output_base}_RuntimeFlexible_Mapper.js'
            js_selfcontained_code = generate_js_self_contained(result['rules'], result['results'],
                                                                result['headers'], 'Fixed-Length')
            js_selfcontained_filename = f'{output_base}_SelfContained_Mapper.js'

        else:
            # Multi-record type
            print('[Step 1B.1] Select Input Data File')
            print('-' * 40)
            input_file = pick_file('  Choose the input data file:', input_dir,
                                   ['.txt', '.dat', '.csv'])
            files_to_archive.append(input_file)
            print(f'  Selected: {input_file}')
            print()

            print('[Step 1B.2] Select Record Type Config File')
            print('-' * 40)
            config_file = pick_file('  Choose the record type config CSV file:', input_dir, ['.csv'])
            files_to_archive.append(config_file)
            print(f'  Selected: {config_file}')
            print()

            # Parse config to find mapping files
            config_text = read_file(os.path.join(input_dir, config_file))
            config_rows = parse_csv(config_text, ',')
            config_headers = [normalize_key(h) for h in config_rows[0]]
            record_types = []
            for i in range(1, len(config_rows)):
                obj = {}
                for j, h in enumerate(config_headers):
                    obj[h] = config_rows[i][j].strip() if j < len(config_rows[i]) else ''
                record_types.append(obj)

            # Ask user to identify each mapping file
            print('[Step 1B.3] Identify Mapping Files')
            print('-' * 40)
            mapping_files_map = {}
            for rt in record_types:
                rt_name = rt.get('recordtype', 'Unknown')
                indicated_file = rt.get('mappingfile', '')
                print(f'\n  Record Type: {rt_name}')
                if indicated_file:
                    print(f'  Config indicates: {indicated_file}')
                mf = pick_file(f'  Select the mapping file for "{rt_name}":', input_dir, ['.csv'])
                mapping_files_map[rt_name] = mf
                files_to_archive.append(mf)
                print(f'  Selected: {mf}')
            print()

            # Process multi-record (v2.0 - generate both JS types)
            print('[Step 2] Processing Multi-Record...')
            print('-' * 40)
            input_text = read_file(os.path.join(input_dir, input_file))
            output_base = os.path.splitext(input_file)[0]

            # Build valid indicators for auto-detection
            valid_indicators = set()
            for rt in record_types:
                ind = rt.get('typeindicatorvalue', '')
                if ind:
                    valid_indicators.add(ind)

            # Split lines (handle concatenated records)
            all_lines = [l for l in input_text.replace('\r\n', '\n').split('\n') if l.strip()]
            if len(all_lines) == 1 and len(all_lines[0]) > 0:
                all_lines = split_concatenated_records(all_lines[0], valid_indicators)

            # Process each record type
            all_csv_outputs = {}
            total_records = 0
            all_errors = []

            for rt in record_types:
                rt_name = rt.get('recordtype', 'Unknown')
                indicator_pos = int(rt.get('typeindicatorposition', '1') or '1')
                indicator_val = rt.get('typeindicatorvalue', '')
                output_name = rt.get('outputname', rt_name)

                mf_name = mapping_files_map.get(rt_name, '')
                if not mf_name:
                    continue

                mapping_text = read_file(os.path.join(input_dir, mf_name))
                mapping_rules = parse_fixed_mapping(mapping_text)
                headers = [r['field'] for r in mapping_rules if r['field']]

                # Filter lines for this record type
                filtered_lines = []
                for line in all_lines:
                    if indicator_pos > 0 and indicator_val:
                        pos = indicator_pos - 1
                        val_len = len(indicator_val)
                        if pos < len(line) and line[pos:pos + val_len] == indicator_val:
                            filtered_lines.append(line)

                filtered_text = '\n'.join(filtered_lines)
                rt_result = transform_fixed(filtered_text, mapping_rules, headers)

                print(f'  {rt_name}: {rt_result["recordCount"]} records processed')
                all_csv_outputs[output_name] = rt_result['csvOutput']
                csv_outputs_by_name[output_name] = rt_result['csvOutput']
                total_records += rt_result['recordCount']
                all_errors.extend(rt_result.get('errors', []))

            # Generate both JS types (v2.0)
            js_runtime_code = generate_js_runtime_flexible_multirecord(record_types, input_file, config_file)
            js_runtime_filename = f'{output_base}_RuntimeFlexible_Mapper.js'
            # For self-contained multi-record, combine all rules
            all_rules = []
            all_results = []
            all_headers = []
            for rt in record_types:
                rt_name = rt.get('recordtype', 'Unknown')
                mf_name = mapping_files_map.get(rt_name, '')
                if mf_name:
                    mapping_text = read_file(os.path.join(input_dir, mf_name))
                    mapping_rules = parse_fixed_mapping(mapping_text)
                    all_rules.extend(mapping_rules)
                    all_headers.extend([r['field'] for r in mapping_rules if r['field']])
            js_selfcontained_code = generate_js_self_contained(all_rules, all_results, all_headers, 'Fixed-Length Multi-Record')
            js_selfcontained_filename = f'{output_base}_SelfContained_Mapper.js'

            # Write individual CSV outputs
            for out_name, csv_out in all_csv_outputs.items():
                csv_path = os.path.join(output_dir, f'{output_base}_{out_name}_Mapped.csv')
                write_file(csv_path, csv_out)
                print(f'  Output: /output/{output_base}_{out_name}_Mapped.csv')

            # Combine all CSVs for the main result
            combined_csv = '\n'.join(all_csv_outputs.values())
            result = {
                'success': True,
                'csvOutput': combined_csv,
                'recordCount': total_records,
                'headers': [],
                'results': [],
                'errors': all_errors
            }

    if not result or not result['success']:
        print('\n  ERROR: Processing failed.')
        input('\nPress Enter to exit...')
        sys.exit(1)

    # Write outputs (v2.0 - write both JS files)
    csv_out_path = os.path.join(output_dir, f'{output_base}_Mapped.csv')
    js_runtime_path = os.path.join(output_dir, js_runtime_filename)
    js_selfcontained_path = os.path.join(output_dir, js_selfcontained_filename)

    write_file(csv_out_path, result['csvOutput'])
    write_file(js_runtime_path, js_runtime_code)
    write_file(js_selfcontained_path, js_selfcontained_code)

    print(f'\n  SUCCESS: {result["recordCount"]} records processed.')
    print(f'  Output CSV:          /output/{output_base}_Mapped.csv')
    print(f'  Runtime Flexible JS: /output/{js_runtime_filename}')
    print(f'  Self Contained JS:   /output/{js_selfcontained_filename}')

    if result.get('errors'):
        print(f'\n  Warnings ({len(result["errors"])}):')
        for err in result['errors'][:10]:
            print(f'    - {err}')
        if len(result['errors']) > 10:
            print(f'    ... and {len(result["errors"]) - 10} more')

    # Step 3: Archive processed files
    print()
    print('[Step 3] Archiving processed files...')
    print('-' * 40)
    seen = set()
    for f in files_to_archive:
        if f not in seen:
            archive_file(f)
            seen.add(f)

    # Step 4: HTML viewer (v2.0 - tabbed viewer with JS code + CSV)
    print()
    print('[Step 4] HTML Output Viewer')
    print('-' * 40)
    create_html = ask_yes_no('  Create an HTML file showing the mapped CSV output?')

    if create_html:
        if is_multirecord and csv_outputs_by_name:
            html_content = generate_html_viewer_v2(js_runtime_code, js_selfcontained_code,
                                                    js_runtime_filename, js_selfcontained_filename,
                                                    result['csvOutput'], f'{output_base}_Mapped',
                                                    result['recordCount'],
                                                    len(result.get('headers', []) or []),
                                                    csv_outputs_by_name)
        else:
            html_content = generate_html_viewer_v2(js_runtime_code, js_selfcontained_code,
                                                    js_runtime_filename, js_selfcontained_filename,
                                                    result['csvOutput'], f'{output_base}_Mapped',
                                                    result['recordCount'],
                                                    len(result.get('headers', []) or []))
        html_path = os.path.join(output_dir, f'{output_base}_Mapped.html')
        write_file(html_path, html_content)
        print(f'  Created: /output/{output_base}_Mapped.html')

        # Open in browser
        full_html_path = resolve(html_path)
        try:
            if os.name == 'nt':
                subprocess.Popen(['explorer.exe', full_html_path])
            else:
                subprocess.Popen(['xdg-open', full_html_path])
            print('  Opened in browser.')
        except Exception as e:
            print(f'  Could not auto-open: {e}')
            print(f'  Open manually: {full_html_path}')

    print()
    print('=' * 60)
    print('  Processing complete.')
    print('=' * 60)
    input('\nPress Enter to exit...')


if __name__ == '__main__':
    main()
