# JavaScript Mapper - Function Reference

This document provides a comprehensive reference for all transformation functions available in the JavaScript Mapper.

## Table of Contents
- [Basic Commands](#basic-commands)
- [String Functions](#string-functions)
- [Math Functions](#math-functions)
- [Conditional Logic](#conditional-logic)
- [Validation Functions](#validation-functions)
- [Error Handling](#error-handling)

---

## Basic Commands

### Column1
**Description:** Direct column mapping  
**Syntax:** `Column1`  
**Example:** Value from column 1

### 'Static Value'
**Description:** Use literal text in quotes  
**Syntax:** `'Hello'`  
**Example:** Hello

### Hardcode 'value'
**Description:** Explicit static value  
**Syntax:** `Hardcode '1'`  
**Example:** 1

### Increment By 1
**Description:** Auto-increment counter  
**Syntax:** `Increment By 1`  
**Example:** 1, 2, 3...

### Today()
**Description:** Current date  
**Syntax:** `Today()`  
**Example:** 1/15/2025

### Now()
**Description:** Current timestamp  
**Syntax:** `Now()`  
**Example:** 1/15/2025, 2:30:45 PM

---

## String Functions

### RemoveLeadingZeroes(ColumnN)
**Description:** Remove leading zeros  
**Syntax:** `RemoveLeadingZeroes(Column1)`  
**Example:** 00123 → 123

### RemoveTrailingSpaces(ColumnN)
**Description:** Remove trailing spaces  
**Syntax:** `RemoveTrailingSpaces(Column1)`  
**Example:** Hello   → Hello

### Trim(ColumnN)
**Description:** Remove leading/trailing whitespace  
**Syntax:** `Trim(Column1)`  
**Example:**   Hello  → Hello

### Concat(Column1, Column2, ...)
**Description:** Concatenate columns  
**Syntax:** `Concat(Column1, Column2)`  
**Example:** John + Doe → JohnDoe

### Substring(ColumnN, start, length)
**Description:** Extract substring  
**Syntax:** `Substring(Column1, 1, 3)`  
**Example:** Hello → Hel

### Uppercase(ColumnN)
**Description:** Convert to uppercase  
**Syntax:** `Uppercase(Column1)`  
**Example:** hello → HELLO

### Lowercase(ColumnN)
**Description:** Convert to lowercase  
**Syntax:** `Lowercase(Column1)`  
**Example:** HELLO → hello

### Left(ColumnN, length)
**Description:** Extract leftmost characters  
**Syntax:** `Left(Column5,6)`  
**Example:** Hello123 → Hello1

### Right(ColumnN, length)
**Description:** Extract rightmost characters  
**Syntax:** `Right(Column4,5)`  
**Example:** Hello123 → o123

### Replace(ColumnN, 'old', 'new')
**Description:** Replace text patterns  
**Syntax:** `Replace(Column1, 'o', 'a')`  
**Example:** Hello → Hella

### PadLeft(ColumnN, length, 'char')
**Description:** Left pad with character  
**Syntax:** `PadLeft(Column1, 5, '0')`  
**Example:** 123 → 00123

### PadRight(ColumnN, length, 'char')
**Description:** Right pad with character  
**Syntax:** `PadRight(Column1, 5, '0')`  
**Example:** 123 → 12300

### AddLeft(ColumnN, 'char', count)
**Description:** Add character N times to start  
**Syntax:** `AddLeft(Column1, '0', 2)`  
**Example:** 123 → 00123

### AddRight(ColumnN, 'char', count)
**Description:** Add character N times to end  
**Syntax:** `AddRight(Column1, '0', 2)`  
**Example:** 123 → 12300

### DateReformat(ColumnN, 'input', 'output')
**Description:** Reformat date strings  
**Syntax:** `DateReformat(Column18,'MMDDYYYY','YYYYMMDD')`  
**Example:** 10252025 → 20251025

---

## Math Functions

### Sum(Column1, Column2, ...)
**Description:** Add multiple numeric fields  
**Syntax:** `Sum(Column1, Column2)`  
**Example:** 10 + 20 → 30

### Multiply(Column1, Column2)
**Description:** Multiply values  
**Syntax:** `Multiply(Column1, Column2)`  
**Example:** 10 * 3 → 30

### Divide(Column1, Column2)
**Description:** Divide values  
**Syntax:** `Divide(Column1, Column2)`  
**Example:** 20 / 4 → 5

### Round(ColumnN, decimals)
**Description:** Round to decimal places  
**Syntax:** `Round(Column1, 2)`  
**Example:** 3.14159 → 3.14

### Abs(ColumnN)
**Description:** Absolute value  
**Syntax:** `Abs(Column1)`  
**Example:** -5 → 5

### Max(Column1, Column2, ...)
**Description:** Maximum value  
**Syntax:** `Max(Column1, Column2)`  
**Example:** Max(10, 20) → 20

### Min(Column1, Column2, ...)
**Description:** Minimum value  
**Syntax:** `Min(Column1, Column2)`  
**Example:** Min(10, 20) → 10

---

## Conditional Logic

### If Column1 == 'value' Then 'result'
**Description:** Simple conditional  
**Syntax:** `If Column6 == '' Then 'TC' Else Column6`  
**Example:** Empty → TC, Value → Value

### If Column1 != 'value' Then Column2
**Description:** Not equal condition  
**Syntax:** `If Column15 == '' Then 'GL' Else Column15`  
**Example:** Empty → GL, Value → Value

### If Column1 > 5 Then 'result'
**Description:** Numeric comparison  
**Syntax:** `If Column1 > 5 Then 'High'`  
**Example:** 10 → High

### If...ElseIf...Else
**Description:** Multiple conditions  
**Syntax:** `If Column1 == 'A' Then 'Active' ElseIf Column1 == 'I' Then 'Inactive' Else 'Unknown'`  
**Example:** A → Active, I → Inactive

### If Function(...) != 'value' Then result
**Description:** Function in condition  
**Syntax:** `If Left(Column1, 1) == 'G' Then 'General'`  
**Example:** General → General

### IsEmpty(ColumnN)
**Description:** Check if empty  
**Syntax:** `IsEmpty(Column1)`  
**Example:** Empty → true, Value → false

### IsNumeric(ColumnN)
**Description:** Check if numeric  
**Syntax:** `IsNumeric(Column1)`  
**Example:** 123 → true, ABC → false

---

## Validation Functions

### ValidateLength(ColumnN, min, max)
**Description:** Validate string length  
**Syntax:** `ValidateLength(Column1, 5, 10)`  
**Example:** Checks if length is 5-10 chars

### ValidateRange(ColumnN, min, max)
**Description:** Validate numeric range  
**Syntax:** `ValidateRange(Column1, 1, 100)`  
**Example:** Checks if number is 1-100

### ValidateFormat(ColumnN, 'type')
**Description:** Validate format  
**Syntax:** `ValidateFormat(Column1, 'email')`  
**Example:** Checks email format

---

## Error Handling

### Required Field Validation
**Description:** Fields marked Y must have values  
**Syntax:** `Required=Y`  
**Example:** Validates non-empty values

### Numeric Validation
**Description:** Sum rejects non-numeric values  
**Syntax:** `Sum(Column1, Column2)`  
**Example:** Rejects "2s00", "abc"

### CSV Parsing Errors
**Description:** Handles quoted fields properly  
**Syntax:** Quoted fields  
**Example:** Processes "Smith, John" correctly

### Missing Logic
**Description:** Fields without logic default to null  
**Syntax:** Empty MappingLogic  
**Example:** Returns null value

### Length Validation
**Description:** ValidateLength checks min/max  
**Syntax:** ValidateLength errors  
**Example:** String too short/long

### Range Validation
**Description:** ValidateRange checks numeric limits  
**Syntax:** ValidateRange errors  
**Example:** Number out of range

### Format Validation
**Description:** ValidateFormat checks patterns  
**Syntax:** ValidateFormat errors  
**Example:** Invalid email/phone/date

### Column Reference Errors
**Description:** safeGet validates column exists  
**Syntax:** Missing columns  
**Example:** Column N missing for field

---

## Usage Notes

- All column references are 1-indexed (Column1, Column2, etc.)
- String values in conditions and hardcoded values should be enclosed in single quotes
- Functions can be nested: `Left(Trim(Column1), 5)`
- Date formats supported: MMDDYYYY, YYYYMMDD, YYYY-MM-DD, MM/DD/YYYY
- Numeric operations automatically validate input values
- Empty or null values are handled gracefully with default behaviors
