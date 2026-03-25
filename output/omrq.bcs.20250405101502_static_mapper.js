// Multi-Record Fixed-Length Self-Contained Static Mapper
// Generated: 2026-03-25
// Source: omrq.bcs.20250405101502.txt
// Mapping: OMRQ_MultiRecord_Mapping.csv
//
// This mapper has all record type detection and field extraction rules hardcoded.
// No external mapping file is needed at runtime.
// NOTE: Input file has no line breaks - records are concatenated at fixed 2330-char intervals.

var incrementCounter = 0;

// ============================================================================
// CSV Parser
// ============================================================================
function parseCSV(text, delimiter) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
  return lines.map(function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  });
}

// ============================================================================
// Escape Regex Helper
// ============================================================================
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Per-Record-Type Headers
// ============================================================================
var headerHeaders = ['Record Type', 'Company', 'Req Number', 'Line Number', 'Requester', 'Req Location', 'Req Del Date', 'Creation Date', 'From Company', 'From Location', 'Deliver To', 'Buyer Code', 'Vendor', 'Purchase From Loc', 'Vendor Name', 'Print Req Fl', 'Agreement Ref', 'PO User Fld 1', 'PO User Fld 3', 'PO User Fld 5', 'User Date 1', 'User Date 2', 'Allocate Priority', 'Quote Fl', 'Activity', 'Account Category', 'Billing Category', 'Account Unit', 'Account', 'Sub Account', 'Purchase Tax Code', 'Purchase Tax Fl', 'Operator Id', 'Dropship Fl', 'Dropsh Req Loc', 'Dropsh Req', 'Sh Name', 'Sh Addr 1', 'Sh Addr 2', 'Sh Addr 3', 'Sh Addr 4', 'Sh City-Addr5', 'Sh State-Prov', 'Sh Post Code', 'Sh Country', 'Sh County', 'Sh Phone Pref', 'Sh Phone', 'Sh Phone Ext', 'Sh Contact', 'Tran Curr Code', 'One Src One PO', 'Location Rule', 'Segment Block'];
var lineHeaders = ['Record Type', 'Company', 'Req Number', 'Line Number', 'Item', 'Item Type', 'Service Code', 'Description', 'Quantity', 'Entered UOM', 'Tran Unit Cost', 'Override Cst Fl', 'Create PO Fl', 'Agreement Ref', 'Vendor', 'Purch Fr Loc', 'Purch Class Major', 'Purch Class Minor', 'Buyer', 'From Company', 'From Location', 'Requesting Location', 'Req Delivery Date', 'Late Delivery Date', 'Creation Date', 'Distribution Code', 'PO Code', 'Purchase Tax Code', 'Purchase Tax Fl', 'Certification Req Fl', 'Inspection Req Fl', 'PO User Fld 2', 'PO User Fld 4', 'PO User Fld 6', 'User Date 3', 'User Date 4', 'Allocate Priority', 'Deliver To', 'Manufacturer Code', 'Manuf Division', 'Manuf Number', 'New Req', 'Fill or Kill Flag', 'Tran Curr Code'];
var commentHeaders = ['Record Type', 'Company', 'Req Number', 'Line Number', 'Name', 'Comment Type', 'Comment'];
var detailHeaders = ['Record Type', 'Company', 'Req Number', 'Line Number', 'Name', 'Comment Type', 'Comment'];

// ============================================================================
// Record Type Detection
// ============================================================================
function detectRecordType(line) {
  var ch = line.charAt(0);
  if (ch === 'H') return 'Header';
  if (ch === 'L') return 'Line';
  if (ch === 'C') return 'Comment';
  if (ch === 'D') return 'Detail';
  return null;
}

// ============================================================================
// Header Extraction (pos 1-738, 54 fields)
// ============================================================================
function mapHeader(line, rowIndex) {
  var record = {};

  // Record Type: pos 1-1, Left justify, pad=' ', default='H'
  var v = line.substring(0, 1).replace(/ +$/, '');
  if (v === '') v = 'H';
  record['Record Type'] = v;

  // Company: pos 2-5, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(1, 5).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company'] = v;

  // Req Number: pos 6-12, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(5, 12).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Req Number'] = v;

  // Line Number: pos 13-18, Right justify, pad='0'
  v = line.substring(12, 18).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Line Number'] = v;

  // Requester: pos 19-28, Left justify, pad=' '
  v = line.substring(18, 28).replace(/ +$/, '');
  record['Requester'] = v;

  // Req Location: pos 29-33, Left justify, pad=' '
  v = line.substring(28, 33).replace(/ +$/, '');
  record['Req Location'] = v;

  // Req Del Date: pos 34-41, Left justify, pad='0'
  v = line.substring(33, 41).replace(/0+$/, '');
  record['Req Del Date'] = v;

  // Creation Date: pos 42-49, Left justify, pad='0'
  v = line.substring(41, 49).replace(/0+$/, '');
  record['Creation Date'] = v;

  // From Company: pos 50-53, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(49, 53).replace(/^0+/, '');
  if (v === '') v = '0';
  record['From Company'] = v;

  // From Location: pos 54-58, Left justify, pad=' '
  v = line.substring(53, 58).replace(/ +$/, '');
  record['From Location'] = v;

  // Deliver To: pos 59-88, Left justify, pad=' '
  v = line.substring(58, 88).replace(/ +$/, '');
  record['Deliver To'] = v;

  // Buyer Code: pos 89-91, Left justify, pad=' '
  v = line.substring(88, 91).replace(/ +$/, '');
  record['Buyer Code'] = v;

  // Vendor: pos 92-100, Right justify, pad=' '
  v = line.substring(91, 100).replace(/^ +/, '');
  record['Vendor'] = v;

  // Purchase From Loc: pos 101-104, Left justify, pad=' '
  v = line.substring(100, 104).replace(/ +$/, '');
  record['Purchase From Loc'] = v;

  // Vendor Name: pos 105-134, Left justify, pad=' '
  v = line.substring(104, 134).replace(/ +$/, '');
  record['Vendor Name'] = v;

  // Print Req Fl: pos 135, Left justify, pad=' ', default='N'
  v = line.substring(134, 135).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Print Req Fl'] = v;

  // Agreement Ref: pos 136-165, Left justify, pad=' '
  v = line.substring(135, 165).replace(/ +$/, '');
  record['Agreement Ref'] = v;

  // PO User Fld 1: pos 166, Left justify, pad=' '
  v = line.substring(165, 166).replace(/ +$/, '');
  record['PO User Fld 1'] = v;

  // PO User Fld 3: pos 167-176, Left justify, pad=' '
  v = line.substring(166, 176).replace(/ +$/, '');
  record['PO User Fld 3'] = v;

  // PO User Fld 5: pos 177-206, Left justify, pad=' '
  v = line.substring(176, 206).replace(/ +$/, '');
  record['PO User Fld 5'] = v;

  // User Date 1: pos 207-214, Left justify, pad='0'
  v = line.substring(206, 214).replace(/0+$/, '');
  record['User Date 1'] = v;

  // User Date 2: pos 215-222, Left justify, pad='0'
  v = line.substring(214, 222).replace(/0+$/, '');
  record['User Date 2'] = v;

  // Allocate Priority: pos 223-224, Right justify, pad='0'
  v = line.substring(222, 224).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Allocate Priority'] = v;

  // Quote Fl: pos 225, Left justify, pad=' ', default='N'
  v = line.substring(224, 225).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Quote Fl'] = v;

  // Activity: pos 226-240, Left justify, pad=' '
  v = line.substring(225, 240).replace(/ +$/, '');
  record['Activity'] = v;

  // Account Category: pos 241-245, Left justify, pad=' '
  v = line.substring(240, 245).replace(/ +$/, '');
  record['Account Category'] = v;

  // Billing Category: pos 246-277, Left justify, pad=' '
  v = line.substring(245, 277).replace(/ +$/, '');
  record['Billing Category'] = v;

  // Account Unit: pos 278-292, Left justify, pad=' '
  v = line.substring(277, 292).replace(/ +$/, '');
  record['Account Unit'] = v;

  // Account: pos 293-298, Right justify, pad='0'
  v = line.substring(292, 298).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Account'] = v;

  // Sub Account: pos 299-302, Right justify, pad='0'
  v = line.substring(298, 302).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Sub Account'] = v;

  // Purchase Tax Code: pos 303-312, Left justify, pad=' '
  v = line.substring(302, 312).replace(/ +$/, '');
  record['Purchase Tax Code'] = v;

  // Purchase Tax Fl: pos 313, Left justify, pad=' ', default='N'
  v = line.substring(312, 313).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Purchase Tax Fl'] = v;

  // Operator Id: pos 314-323, Left justify, pad=' '
  v = line.substring(313, 323).replace(/ +$/, '');
  record['Operator Id'] = v;

  // Dropship Fl: pos 324, Left justify, pad=' ', default='N'
  v = line.substring(323, 324).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Dropship Fl'] = v;

  // Dropsh Req Loc: pos 325, Left justify, pad=' '
  v = line.substring(324, 325).replace(/ +$/, '');
  record['Dropsh Req Loc'] = v;

  // Dropsh Req: pos 326, Left justify, pad=' '
  v = line.substring(325, 326).replace(/ +$/, '');
  record['Dropsh Req'] = v;

  // Sh Name: pos 327-356, Left justify, pad=' '
  v = line.substring(326, 356).replace(/ +$/, '');
  record['Sh Name'] = v;

  // Sh Addr 1: pos 357-386, Left justify, pad=' '
  v = line.substring(356, 386).replace(/ +$/, '');
  record['Sh Addr 1'] = v;

  // Sh Addr 2: pos 387-416, Left justify, pad=' '
  v = line.substring(386, 416).replace(/ +$/, '');
  record['Sh Addr 2'] = v;

  // Sh Addr 3: pos 417-446, Left justify, pad=' '
  v = line.substring(416, 446).replace(/ +$/, '');
  record['Sh Addr 3'] = v;

  // Sh Addr 4: pos 447-476, Left justify, pad=' '
  v = line.substring(446, 476).replace(/ +$/, '');
  record['Sh Addr 4'] = v;

  // Sh City-Addr5: pos 477-494, Left justify, pad=' '
  v = line.substring(476, 494).replace(/ +$/, '');
  record['Sh City-Addr5'] = v;

  // Sh State-Prov: pos 495-496, Left justify, pad=' '
  v = line.substring(494, 496).replace(/ +$/, '');
  record['Sh State-Prov'] = v;

  // Sh Post Code: pos 497-506, Left justify, pad=' '
  v = line.substring(496, 506).replace(/ +$/, '');
  record['Sh Post Code'] = v;

  // Sh Country: pos 507-536, Left justify, pad=' '
  v = line.substring(506, 536).replace(/ +$/, '');
  record['Sh Country'] = v;

  // Sh County: pos 537-561, Left justify, pad=' '
  v = line.substring(536, 561).replace(/ +$/, '');
  record['Sh County'] = v;

  // Sh Phone Pref: pos 562-567, Left justify, pad=' '
  v = line.substring(561, 567).replace(/ +$/, '');
  record['Sh Phone Pref'] = v;

  // Sh Phone: pos 568-582, Left justify, pad=' '
  v = line.substring(567, 582).replace(/ +$/, '');
  record['Sh Phone'] = v;

  // Sh Phone Ext: pos 583-587, Left justify, pad=' '
  v = line.substring(582, 587).replace(/ +$/, '');
  record['Sh Phone Ext'] = v;

  // Sh Contact: pos 588-617, Left justify, pad=' '
  v = line.substring(587, 617).replace(/ +$/, '');
  record['Sh Contact'] = v;

  // Tran Curr Code: pos 618-622, Left justify, pad=' '
  v = line.substring(617, 622).replace(/ +$/, '');
  record['Tran Curr Code'] = v;

  // One Src One PO: pos 623, Left justify, pad=' ', default='1'
  v = line.substring(622, 623).replace(/ +$/, '');
  if (v === '') v = '1';
  record['One Src One PO'] = v;

  // Location Rule: pos 624-635, Left justify, pad=' '
  v = line.substring(623, 635).replace(/ +$/, '');
  record['Location Rule'] = v;

  // Segment Block: pos 636-738, Left justify, pad=' '
  v = line.substring(635, 738).replace(/ +$/, '');
  record['Segment Block'] = v;

  // Validate required fields
  var requiredFields = ['Record Type', 'Company', 'Req Number', 'Requester', 'Req Location', 'Req Del Date', 'Account Unit'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Header at record ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Line Extraction (pos 1-382, 44 fields)
// ============================================================================
function mapLine(line, rowIndex) {
  var record = {};

  // Record Type: pos 1-1, Left justify, pad=' ', default='L'
  var v = line.substring(0, 1).replace(/ +$/, '');
  if (v === '') v = 'L';
  record['Record Type'] = v;

  // Company: pos 2-5, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(1, 5).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company'] = v;

  // Req Number: pos 6-12, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(5, 12).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Req Number'] = v;

  // Line Number: pos 13-18, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(12, 18).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Line Number'] = v;

  // Item: pos 19-50, Left justify, pad=' ', logic=Trim
  v = line.substring(18, 50).replace(/ +$/, '').trim();
  record['Item'] = v;

  // Item Type: pos 51, Left justify, pad=' '
  v = line.substring(50, 51).replace(/ +$/, '');
  record['Item Type'] = v;

  // Service Code: pos 52, Left justify, pad=' '
  v = line.substring(51, 52).replace(/ +$/, '');
  record['Service Code'] = v;

  // Description: pos 53-82, Left justify, pad=' '
  v = line.substring(52, 82).replace(/ +$/, '');
  record['Description'] = v;

  // Quantity: pos 83-95, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(82, 95).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Quantity'] = v;

  // Entered UOM: pos 96-99, Left justify, pad=' ', logic=Trim
  v = line.substring(95, 99).replace(/ +$/, '').trim();
  record['Entered UOM'] = v;

  // Tran Unit Cost: pos 100-117, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(99, 117).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Tran Unit Cost'] = v;

  // Override Cst Fl: pos 118, Left justify, pad=' ', default='N'
  v = line.substring(117, 118).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Override Cst Fl'] = v;

  // Create PO Fl: pos 119, Left justify, pad=' ', default='Y'
  v = line.substring(118, 119).replace(/ +$/, '');
  if (v === '') v = 'Y';
  record['Create PO Fl'] = v;

  // Agreement Ref: pos 120-149, Left justify, pad=' '
  v = line.substring(119, 149).replace(/ +$/, '');
  record['Agreement Ref'] = v;

  // Vendor: pos 150-158, Right justify, pad=' '
  v = line.substring(149, 158).replace(/^ +/, '');
  record['Vendor'] = v;

  // Purch Fr Loc: pos 159-162, Left justify, pad=' '
  v = line.substring(158, 162).replace(/ +$/, '');
  record['Purch Fr Loc'] = v;

  // Purch Class Major: pos 163-166, Left justify, pad=' '
  v = line.substring(162, 166).replace(/ +$/, '');
  record['Purch Class Major'] = v;

  // Purch Class Minor: pos 167-170, Left justify, pad=' '
  v = line.substring(166, 170).replace(/ +$/, '');
  record['Purch Class Minor'] = v;

  // Buyer: pos 171-173, Left justify, pad=' '
  v = line.substring(170, 173).replace(/ +$/, '');
  record['Buyer'] = v;

  // From Company: pos 174-177, Right justify, pad='0'
  v = line.substring(173, 177).replace(/^0+/, '');
  if (v === '') v = '0';
  record['From Company'] = v;

  // From Location: pos 178-182, Left justify, pad=' '
  v = line.substring(177, 182).replace(/ +$/, '');
  record['From Location'] = v;

  // Requesting Location: pos 183-187, Left justify, pad=' '
  v = line.substring(182, 187).replace(/ +$/, '');
  record['Requesting Location'] = v;

  // Req Delivery Date: pos 188-195, Left justify, pad='0'
  v = line.substring(187, 195).replace(/0+$/, '');
  record['Req Delivery Date'] = v;

  // Late Delivery Date: pos 196-203, Left justify, pad='0'
  v = line.substring(195, 203).replace(/0+$/, '');
  record['Late Delivery Date'] = v;

  // Creation Date: pos 204-211, Left justify, pad='0'
  v = line.substring(203, 211).replace(/0+$/, '');
  record['Creation Date'] = v;

  // Distribution Code: pos 212-220, Left justify, pad=' '
  v = line.substring(211, 220).replace(/ +$/, '');
  record['Distribution Code'] = v;

  // PO Code: pos 221-224, Left justify, pad=' '
  v = line.substring(220, 224).replace(/ +$/, '');
  record['PO Code'] = v;

  // Purchase Tax Code: pos 225-234, Left justify, pad=' '
  v = line.substring(224, 234).replace(/ +$/, '');
  record['Purchase Tax Code'] = v;

  // Purchase Tax Fl: pos 235, Left justify, pad=' ', default='N'
  v = line.substring(234, 235).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Purchase Tax Fl'] = v;

  // Certification Req Fl: pos 236, Left justify, pad=' ', default='N'
  v = line.substring(235, 236).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Certification Req Fl'] = v;

  // Inspection Req Fl: pos 237, Left justify, pad=' ', default='N'
  v = line.substring(236, 237).replace(/ +$/, '');
  if (v === '') v = 'N';
  record['Inspection Req Fl'] = v;

  // PO User Fld 2: pos 238-239, Left justify, pad=' '
  v = line.substring(237, 239).replace(/ +$/, '');
  record['PO User Fld 2'] = v;

  // PO User Fld 4: pos 240-269, Left justify, pad=' '
  v = line.substring(239, 269).replace(/ +$/, '');
  record['PO User Fld 4'] = v;

  // PO User Fld 6: pos 270-284, Left justify, pad=' '
  v = line.substring(269, 284).replace(/ +$/, '');
  record['PO User Fld 6'] = v;

  // User Date 3: pos 285-292, Left justify, pad='0'
  v = line.substring(284, 292).replace(/0+$/, '');
  record['User Date 3'] = v;

  // User Date 4: pos 293-300, Left justify, pad='0'
  v = line.substring(292, 300).replace(/0+$/, '');
  record['User Date 4'] = v;

  // Allocate Priority: pos 301-302, Right justify, pad='0'
  v = line.substring(300, 302).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Allocate Priority'] = v;

  // Deliver To: pos 303-332, Left justify, pad=' '
  v = line.substring(302, 332).replace(/ +$/, '');
  record['Deliver To'] = v;

  // Manufacturer Code: pos 333-336, Left justify, pad=' '
  v = line.substring(332, 336).replace(/ +$/, '');
  record['Manufacturer Code'] = v;

  // Manuf Division: pos 337-340, Left justify, pad=' '
  v = line.substring(336, 340).replace(/ +$/, '');
  record['Manuf Division'] = v;

  // Manuf Number: pos 341-375, Left justify, pad=' '
  v = line.substring(340, 375).replace(/ +$/, '');
  record['Manuf Number'] = v;

  // New Req: pos 376, Left justify, pad=' '
  v = line.substring(375, 376).replace(/ +$/, '');
  record['New Req'] = v;

  // Fill or Kill Flag: pos 377, Left justify, pad=' ', default='K'
  v = line.substring(376, 377).replace(/ +$/, '');
  if (v === '') v = 'K';
  record['Fill or Kill Flag'] = v;

  // Tran Curr Code: pos 378-382, Left justify, pad=' '
  v = line.substring(377, 382).replace(/ +$/, '');
  record['Tran Curr Code'] = v;

  // Validate required fields
  var requiredFields = ['Record Type', 'Company', 'Req Number', 'Item', 'Quantity'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Line at record ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Comment Extraction (pos 1-133, 7 fields)
// ============================================================================
function mapComment(line, rowIndex) {
  var record = {};

  // Record Type: pos 1-1, Left justify, pad=' ', default='C'
  var v = line.substring(0, 1).replace(/ +$/, '');
  if (v === '') v = 'C';
  record['Record Type'] = v;

  // Company: pos 2-5, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(1, 5).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company'] = v;

  // Req Number: pos 6-12, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(5, 12).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Req Number'] = v;

  // Line Number: pos 13-18, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(12, 18).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Line Number'] = v;

  // Name: pos 19-68, Left justify, pad=' ', logic=Trim
  v = line.substring(18, 68).replace(/ +$/, '').trim();
  record['Name'] = v;

  // Comment Type: pos 69, Left justify, pad=' '
  v = line.substring(68, 69).replace(/ +$/, '');
  record['Comment Type'] = v;

  // Comment: pos 70-133, Left justify, pad=' ', logic=Trim
  var endPos = Math.min(133, line.length);
  v = line.substring(69, endPos).replace(/ +$/, '').trim();
  record['Comment'] = v;

  // Validate required fields
  var requiredFields = ['Record Type', 'Company', 'Req Number'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Comment at record ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Detail Extraction (pos 1-133, 7 fields)
// ============================================================================
function mapDetail(line, rowIndex) {
  var record = {};

  // Record Type: pos 1-1, Left justify, pad=' ', default='D'
  var v = line.substring(0, 1).replace(/ +$/, '');
  if (v === '') v = 'D';
  record['Record Type'] = v;

  // Company: pos 2-5, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(1, 5).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Company'] = v;

  // Req Number: pos 6-12, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(5, 12).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Req Number'] = v;

  // Line Number: pos 13-18, Right justify, pad='0', logic=RemoveLeadingZeroes
  v = line.substring(12, 18).replace(/^0+/, '');
  if (v === '') v = '0';
  record['Line Number'] = v;

  // Name: pos 19-68, Left justify, pad=' ', logic=Trim
  v = line.substring(18, 68).replace(/ +$/, '').trim();
  record['Name'] = v;

  // Comment Type: pos 69, Left justify, pad=' '
  v = line.substring(68, 69).replace(/ +$/, '');
  record['Comment Type'] = v;

  // Comment: pos 70-133, Left justify, pad=' ', logic=Trim
  v = line.substring(69, 133).replace(/ +$/, '').trim();
  record['Comment'] = v;

  // Validate required fields
  var requiredFields = ['Record Type', 'Company', 'Req Number'];
  for (var i = 0; i < requiredFields.length; i++) {
    if (!record[requiredFields[i]] || !record[requiredFields[i]].toString().trim()) {
      throw new Error('Required field "' + requiredFields[i] + '" is blank in Detail at record ' + (rowIndex + 1));
    }
  }

  return record;
}

// ============================================================================
// Process Line Dispatcher
// ============================================================================
function processLine(line, rowIndex) {
  var type = detectRecordType(line);
  if (!type) {
    throw new Error('Unknown record type at record ' + (rowIndex + 1));
  }
  var data;
  if (type === 'Header') {
    data = mapHeader(line, rowIndex);
  } else if (type === 'Line') {
    data = mapLine(line, rowIndex);
  } else if (type === 'Comment') {
    data = mapComment(line, rowIndex);
  } else if (type === 'Detail') {
    data = mapDetail(line, rowIndex);
  }
  return { type: type, data: data };
}

// ============================================================================
// Split No-Linebreak Input into Fixed-Width Records
// ============================================================================
function splitFixedWidthRecords(rawContent, recordWidth) {
  var records = [];
  var content = rawContent.replace(/\r?\n/g, '');
  var pos = 0;
  while (pos < content.length) {
    var len = Math.min(recordWidth, content.length - pos);
    records.push(content.substring(pos, pos + len));
    pos += recordWidth;
  }
  return records;
}

// ============================================================================
// Fallback applyLogic for complex cases
// ============================================================================
function applyLogic(logic, value) {
  if (!logic) return value;
  logic = logic.trim();

  if (/^RemoveLeadingZeroes$/i.test(logic)) {
    return value.replace(/^0+/, '') || '0';
  }
  if (/^Trim$/i.test(logic)) {
    return value.trim();
  }
  if (/^['"].*['"]$/.test(logic)) {
    return logic.slice(1, -1);
  }
  return value;
}

// ============================================================================
// IPA Usage Instructions
// ============================================================================
// Step 1: Split input data into records (no line breaks in this file)
// var lines = splitFixedWidthRecords(readFile_inputData, 2330);
//
// Step 2: Process each record
// var resultsByType = { Header: [], Line: [], Comment: [], Detail: [] };
// try {
//   lines.forEach(function(line, index) {
//     var result = processLine(line, index);
//     resultsByType[result.type].push(result.data);
//   });
// } catch (error) {
//   ErrorMessage = error.message;
// }
//
// Step 3: Convert to CSV per record type
// // Headers CSV
// var headerCSV = [headerHeaders.join(',')];
// resultsByType.Header.forEach(function(r) {
//   var row = headerHeaders.map(function(h) {
//     var v = r[h] != null ? r[h].toString() : '';
//     return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
//   });
//   headerCSV.push(row.join(','));
// });
// // Repeat for Line (lineHeaders), Comment (commentHeaders), Detail (detailHeaders)
