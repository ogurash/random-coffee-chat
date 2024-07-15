// Testing the sheets accessor.

// Import the sheets accessor.
import { SheetsAccessor } from '../src/sheets_accessor';

/** Entry point for the debug. */
function run() {
    // Set up config.
    const config = {
        spreadsheetId: '<Your spreadsheet ID here>',
        memberDataRange: 'Members!A2:A',
        historyDataSheetName: 'History',
    };

    // Create a sheets accessor.
    const accessor = new SheetsAccessor(config);
    const members = accessor.getMembers();
    console.log('Members: ' + members.join(', '));
}

// This is necessary to keep the main function after bundling.
run();