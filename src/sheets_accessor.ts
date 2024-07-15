import { Grouping } from './group_generator';

export type SheetsAccessorConfig = {
    spreadsheetId: string;
    memberDataRange: string;
    historyDataSheetName: string;
};

export class SheetsAccessor {
    constructor(private readonly config: SheetsAccessorConfig) { }

    getMembers(): string[] {
        const spreadsheet = this.getSpreasheet();
        const range = spreadsheet.getRange(this.config.memberDataRange);

        // Read the range and flatten the data into a 1D array.
        const values = range.getValues();
        // Filter out empty values.
        const members = values.flat().filter(value => value);
        return members;
    }

    /** Records grouping as a row in the history sheet. */
    recordGrouping(grouping: Grouping, rowKey: string): void {
        const spreadsheet = this.getSpreasheet();
        let sheet = spreadsheet.getSheetByName(this.config.historyDataSheetName);
        if (!sheet) {
            sheet = spreadsheet.insertSheet(this.config.historyDataSheetName);
        }
        const row = grouping.groups.map(group => group.memberIndices.map(index => grouping.members[index]).join(', '));
        sheet.appendRow([rowKey, ...row]);
    }

    getHistory(members: string[]): Grouping[] {
        const spreadsheet = this.getSpreasheet();
        const sheet = spreadsheet.getSheetByName(this.config.historyDataSheetName);
        if (!sheet) {
            return [];
        }
        const range = sheet.getDataRange();
        const values = range.getValues();
        // TODO(ogurash): Handle the case where some members are removed.
        return values.map(row => {
            const [rowKey, ...groupStrings] = row;
            const groups = groupStrings.map(groupString => {
                const memberIndices = groupString.split(', ').map(member => members.indexOf(member));
                return { memberIndices, weight: 0 };
            });
            return { members: members, groups, totalWeight: 0 };
        });
    }

    private getSpreasheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
        return SpreadsheetApp.openById(this.config.spreadsheetId);
    }
}