// Main entry point for the application.

import { GroupGenerator, Grouping } from "./group_generator";
import { SheetsAccessor } from "./sheets_accessor";
import { MailSender } from "./mail_sender";

const sheetConfig = {
    spreadsheetId: '<Your spreadsheet ID here>',
    memberDataRange: 'Members!A2:A',
    historyDataSheetName: 'History',
};

const emailConfig = {
    subject: 'Next week\'s group',
    body: `
You are in a group with the following members:
{{GROUP}}

Please schedule a meeting in the week of {{MONDAY}}.
`,
};

function buildGroupGeneratorConfig(members: string[], weights: Map<string, number>) {
    return {
        groupMemberSize: 2,
        members,
        initialPairWeightFn: (member0, member1) => weights.get([member0, member1].sort().join(',')) || 1,
        roundWeight: 1,
        maxGenerations: 10,
        mutationProbability: 0.1,
    };
}

function convertHistoryToWeights(history: Grouping[]): Map<string, number> {
    const weights = new Map<string, number>();
    history.forEach(grouping => {
        grouping.groups.forEach(group => {
            group.memberIndices.forEach((memberIndex, i) => {
                group.memberIndices.slice(i + 1).forEach(otherMemberIndex => {
                    const member = grouping.members[memberIndex];
                    const otherMember = grouping.members[otherMemberIndex];
                    const key = [member, otherMember].sort().join(',');
                    weights.set(key, (weights.get(key) || 1) + 1);
                });
            });
        });
    });
    return weights;
}

function formatNextMonday(): string {
    const now = new Date();
    const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    return nextMonday.toISOString().slice(0, 10);
}

function run() {
    // Retrieve members from the sheet.
    const accessor = new SheetsAccessor(sheetConfig);
    const members = accessor.getMembers();
    console.log('Members: ' + members.join(', '));

    // Retrieve history from the sheet.
    const history = accessor.getHistory(members);
    const weights = convertHistoryToWeights(history);

    // Generate groups.
    const config = buildGroupGeneratorConfig(members, weights);
    const generator = new GroupGenerator(config);
    const grouping = generator.generateGroups();
    console.log('Total weight: ' + grouping.totalWeight);

    // Send emails to the members.
    const nextMonday = formatNextMonday();
    const mailSender = new MailSender(emailConfig);
    grouping.groups.forEach((group, i) => {
        const groupMembers = group.memberIndices.map(index => grouping.members[index]);
        const replacements = new Map<string, string>([
            ['{{GROUP}}', groupMembers.join(', ')],
            ['{{MONDAY}}', nextMonday],
        ]);
        mailSender.sendMail(groupMembers, replacements);    
    });

    // Record the grouping to the sheet.
    accessor.recordGrouping(grouping, nextMonday);

    console.log('Done: ' + nextMonday);
}

run();