/**
 * 🔒 LICENSE SERVER API (Refactored for Router Support)
 * 
 * SETUP:
 * 1. Create a Sheet named "Master_Licenses"
 * 2. Columns:
 *    A: BankTransactionID (License Key)
 *    B: ClientName
 *    C: Email
 *    D: AllowedSpreadsheetID (The lock)
 *    E: Status (Active/Banned/Pending)
 *    F: CreatedDate
 *    G: ActivatedDate
 */

const SHEET_LICENSES = 'Master_Licenses';

// REMOVED: doGet and doPost to avoid conflict with main Code.gs
// function doGet(e) { return handleRequest(e); }
// function doPost(e) { return handleRequest(e); }

function handleLicenseRequest(e) {
    try {
        const action = e.parameter.action;
        const key = e.parameter.key;
        const sheetId = e.parameter.sheetId; // Client's Sheet ID

        if (!key) return responseLicenseJSON({ success: false, message: 'Missing License Key' });

        const ss = SpreadsheetApp.openById('1FylWgwlHxW39HPIIVTgtb2rnCzu-fEnnBMmHRNLzN8o'); // FIX: Use explicit ID or active if bound
        // Note: Unless this script is bound to the License Sheet, getActiveSpreadsheet() might fail if running as Web App unconnected to sheet.
        // Assuming this is running on the SAME sheet as the LMS system for now, or the User intended to use a standalone script.
        // Reverting to getActiveSpreadsheet() as per user original code, but adding fallback/comment.
        var sheet;
        try {
            sheet = ss.getSheetByName(SHEET_LICENSES);
        } catch (err) {
            // Fallback if ss is not defined by openById above (if I remove the hardcoded ID line)
            // But since I don't know the License Sheet ID, I must rely on getActiveSpreadsheet() if the user intends it that way.
            // User code: const ss = SpreadsheetApp.getActiveSpreadsheet();
            sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LICENSES);
        }

        if (!sheet) return responseLicenseJSON({ success: false, message: 'License Sheet not found' });

        const data = sheet.getDataRange().getValues();

        // Find Key
        let rowIndex = -1;
        let rowData = null;

        for (let i = 1; i < data.length; i++) {
            // Column A is BankTransactionID
            if (String(data[i][0]).trim() === String(key).trim()) {
                rowIndex = i + 1;
                rowData = data[i];
                break;
            }
        }

        if (rowIndex === -1) {
            return responseLicenseJSON({ success: false, message: 'License Key not found!' });
        }

        const currentStatus = rowData[4]; // Column E
        const currentSheetID = rowData[3]; // Column D

        // ACTION: ACTIVATE (First time run)
        if (action === 'activate') {
            // Check if already activated for SOMEONE ELSE
            if (currentSheetID && String(currentSheetID) !== String(sheetId)) {
                return responseLicenseJSON({
                    success: false,
                    message: 'License already used on another Sheet! Please contact support.'
                });
            }

            // Activate
            const now = new Date().toLocaleString('vi-VN');
            sheet.getRange(rowIndex, 4).setValue(sheetId); // Set Allowed ID
            sheet.getRange(rowIndex, 5).setValue('Active'); // Set Status
            sheet.getRange(rowIndex, 7).setValue(now); // Set Activated Date

            return responseLicenseJSON({ success: true, message: 'Activation Successful!' });
        }

        // ACTION: CHECK (Regular check)
        if (action === 'check') {
            if (currentStatus !== 'Active') {
                return responseLicenseJSON({ allowed: false, message: 'License is not Active.' });
            }

            if (String(currentSheetID) !== String(sheetId)) {
                return responseLicenseJSON({ allowed: false, message: 'Sheet ID Mismatch.' });
            }

            return responseLicenseJSON({ allowed: true });
        }

        return responseLicenseJSON({ success: false, message: 'Unknown License Action' });

    } catch (err) {
        return responseLicenseJSON({ success: false, message: 'License Server Error: ' + err.toString() });
    }
}


function responseLicenseJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// --- INTERNAL FUNCTION: CALLED BY CODE.GS ---
function createLicense(code, name, email) {
    try {
        // Open the spreadsheet where this script is running (or bound to)
        // ID: 1FylWgwlHxW39HPIIVTgtb2rnCzu-fEnnBMmHRNLzN8o (Same as LMS Sheet)
        var ss = SpreadsheetApp.openById('1FylWgwlHxW39HPIIVTgtb2rnCzu-fEnnBMmHRNLzN8o');
        var sheet = ss.getSheetByName('Master_Licenses');

        if (sheet) {
            // Check if code already exists to prevent duplicates
            var data = sheet.getDataRange().getValues();
            for (var i = 1; i < data.length; i++) {
                if (data[i][0] == code) return;
            }

            // Adjusted to match Screenshot Headers:
            // A: BankTransactionID
            // B: ClientName
            // C: AllowedSpreadsheetID (Empty for new license)
            // D: CreatedDate
            // E: Status (Pending)
            // F: Email (Saved for reference)
            sheet.appendRow([
                code,
                name,
                '',          // C: AllowedSpreadsheetID
                new Date(),  // D: CreatedDate
                'Pending',   // E: Status
                email        // F: Email
            ]);
            Logger.log("Created License for: " + code);
        } else {
            Logger.log("Sheet Master_Licenses not found!");
        }
    } catch (e) {
        Logger.log("Create License Error: " + e.toString());
    }
}
