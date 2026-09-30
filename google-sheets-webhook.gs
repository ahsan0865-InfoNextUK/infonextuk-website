/**
 * InfoNext UK Query Dashboard webhook for Google Sheets.
 *
 * SETUP
 * 1. Create a Google Sheet named "InfoNext UK Query Dashboard".
 * 2. Extensions > Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Replace PASTE_SPREADSHEET_ID_HERE with the ID from the Sheet URL.
 * 5. Run setupSheet() once and approve permissions.
 * 6. Deploy > New deployment > Web app.
 * 7. Execute as: Me.
 * 8. Who has access: Anyone.
 * 9. Copy the /exec URL and give it to ChatGPT so it can be added to script.js
 *    as GOOGLE_SHEETS_WEBHOOK.
 */

const SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Queries';

const HEADERS = [
  'Received',
  'Query Reference',
  'Customer Name',
  'Email',
  'Phone',
  'Country',
  'Category',
  'Customer Deadline',
  'Goal',
  'Key Facts',
  'Service Level',
  'Quoted Price',
  'Payment Status',
  'Priority',
  'Due Date',
  'Status',
  'Assigned To',
  'Last Contact',
  'Internal Notes'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'No POST body received' });
    }

    const body = JSON.parse(e.postData.contents);
    const data = body.form_data || body;
    const reference = text_(data.Reference || data.reference);

    if (!reference || !reference.startsWith('INX-')) {
      return json_({ ok: false, error: 'Invalid or missing query reference' });
    }

    const sheet = getSheet_();
    ensureHeaders_(sheet);

    // Idempotency: FormSubmit or a browser retry should not create the same
    // enquiry twice.
    const duplicate = findReferenceRow_(sheet, reference);
    if (duplicate) {
      return json_({ ok: true, duplicate: true, reference: reference });
    }

    const deadline = text_(data.Deadline || data.deadline);
    const priority = initialPriority_(deadline);

    sheet.appendRow([
      new Date(),
      reference,
      text_(data.Name || data.name),
      text_(data.Email || data.email),
      text_(data.Phone || data.phone),
      text_(data.Country || data.country),
      text_(data.Category || data.category),
      deadline,
      text_(data.Goal || data.goal),
      text_(data['Key facts'] || data['key facts'] || data.details),
      '',
      '',
      'Not quoted',
      priority,
      '',
      'New',
      '',
      '',
      ''
    ]);

    sendNotificationEmail_(data, reference, deadline, priority);

    return json_({ ok: true, reference: reference });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function setupSheet() {
  const sheet = getSheet_();
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);

  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), HEADERS.length).createFilter();
  }

  const header = sheet.getRange(1, 1, 1, HEADERS.length);
  header.setFontWeight('bold');
  header.setWrap(true);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ['New', 'Reviewing', 'Awaiting payment', 'Paid - queued', 'Working', 'Waiting for customer', 'Completed', 'Cancelled', 'Refunded'],
      true
    )
    .setAllowInvalid(true)
    .build();

  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Not quoted', 'Awaiting payment', 'Paid', 'Partially refunded', 'Refunded', 'Not required'], true)
    .setAllowInvalid(true)
    .build();

  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Urgent', 'High', 'Normal', 'Low'], true)
    .setAllowInvalid(true)
    .build();

  sheet.getRange(2, 13, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(paymentRule);
  sheet.getRange(2, 14, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(priorityRule);
  sheet.getRange(2, 16, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(statusRule);
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function findReferenceRow_(sheet, reference) {
  if (sheet.getLastRow() < 2) return 0;
  const refs = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getDisplayValues().flat();
  const index = refs.indexOf(reference);
  return index === -1 ? 0 : index + 2;
}

function initialPriority_(deadline) {
  const d = String(deadline || '').toLowerCase();
  if (d.includes('24 hour')) return 'Urgent';
  if (d.includes('3 day')) return 'High';
  if (d.includes('7 day')) return 'Normal';
  if (d.includes('specific date')) return 'Normal';
  return 'Low';
}

function text_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


function sendNotificationEmail_(data, reference, deadline, priority) {
  const customerEmail = text_(data.Email || data.email);
  const lines = [
    'New InfoNext UK enquiry',
    '',
    'Reference: ' + reference,
    'Name: ' + text_(data.Name || data.name),
    'Email: ' + customerEmail,
    'Phone: ' + text_(data.Phone || data.phone),
    'Country: ' + text_(data.Country || data.country),
    'Category: ' + text_(data.Category || data.category),
    'Deadline: ' + deadline,
    'Priority: ' + priority,
    '',
    'Goal:',
    text_(data.Goal || data.goal),
    '',
    'Key facts:',
    text_(data['Key facts'] || data['key facts'] || data.details),
    '',
    'Form URL: ' + text_(data['Form URL'] || data.formUrl)
  ];

  const message = {
    to: 'hello@infonextuk.co.uk',
    subject: 'New InfoNext UK enquiry - ' + reference,
    body: lines.join('\n'),
    name: 'InfoNext UK Website'
  };

  if (customerEmail) {
    message.replyTo = customerEmail;
  }

  MailApp.sendEmail(message);
}
