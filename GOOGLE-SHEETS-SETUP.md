# InfoNext UK Query Dashboard setup

The live website continues to send enquiries to `hello@infonextuk.co.uk` through FormSubmit.

To add the Google Sheets query dashboard without changing the customer's experience:

1. Create a Google Sheet named **InfoNext UK Query Dashboard**.
2. Copy the spreadsheet ID from its URL. It is the text between `/d/` and `/edit`.
3. In the Sheet choose **Extensions > Apps Script**.
4. Replace the default code with the contents of `google-sheets-webhook.gs`.
5. Replace `PASTE_SPREADSHEET_ID_HERE` with the spreadsheet ID.
6. Run `setupSheet()` once and approve Google's requested permissions.
7. Choose **Deploy > New deployment > Web app**.
8. Set **Execute as: Me** and **Who has access: Anyone**.
9. Deploy and copy the URL ending in `/exec`.
10. Put that URL into `script.js` as the value of `GOOGLE_SHEETS_WEBHOOK`.

After that, FormSubmit will continue sending the business email and will also POST each successful enquiry to the Google Apps Script web app. The script creates one row per INX reference and ignores duplicate deliveries.

The dashboard columns include contact details, category, deadline, goal, key facts, quote/payment fields, work priority, status, due date, assignee, last contact and internal notes.

Important: never put Stripe secret keys, passwords or other private credentials in this GitHub repository or in browser-side JavaScript.
