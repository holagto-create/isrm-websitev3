/**
 * PASTE THIS INTO YOUR GOOGLE APPS SCRIPT (Code.gs)
 * 
 * STEP 1: Add this block INSIDE doPost function (before the line that says "Unknown action: " + action)
 */
if (action === 'updateClientStatus') {
  const { recordId, status, notes } = postData;
  return ContentService.createTextOutput(JSON.stringify(updateClientStatusByURS(recordId, status, notes)))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * STEP 2: Add this function AT THE END of Code.gs (after all other functions)
 */
function updateClientStatusByURS(recordId, status, notes) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET.CLIENTS);
    const data = sheet.getDataRange().getValues();
    const C = CONFIG.COL;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][C.RECORD_ID - 1] === recordId) {
        const rowNum = i + 1;
        
        if (status) {
          sheet.getRange(rowNum, C.STATUS).setValue(status);
        }
        
        if (notes) {
          const existingRemarks = data[i][C.REMARKS - 1] || '';
          const timestamp = Utilities.formatDate(new Date(), 'Asia/Manila', 'MM/dd/yyyy HH:mm');
          const newRemarks = existingRemarks 
            ? existingRemarks + '\n[' + timestamp + '] ' + notes 
            : '[' + timestamp + '] ' + notes;
          sheet.getRange(rowNum, C.REMARKS).setValue(newRemarks);
        }
        
        return { success: true, message: 'Client status updated successfully' };
      }
    }
    return { success: false, message: 'Client not found: ' + recordId };
  } catch (e) {
    return { success: false, message: e.message };
  }
}