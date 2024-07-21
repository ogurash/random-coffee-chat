// Main entry point for the application.

import { GroupGenerator, Grouping } from "./group_generator";
import { SheetsAccessor } from "./sheets_accessor";
import { MailSender } from "./mail_sender";
import { CalendarEventCreator } from "./calendar_event_creator";

const sheetConfig = {
    spreadsheetId: '<Your spreadsheet ID here>',
    memberDataRange: 'Members!A2:A',
    historyDataSheetName: 'History',
};

const groupEmailConfig = {
    subject: 'Next week\'s group',
    body: `
You are in a group with the following members:
{{GROUP}}

Please schedule a meeting in the week of {{MONDAY}}.
`,
};

const noMatchingEmailConfig = {
    subject: 'No group is available',
    body: `
You are not in a group in the week of {{MONDAY}}. Please wait for the next grouping.
    `
};

const groupEventConfig = {
    calendarId: '<Your calendar ID here>',

    summary: 'Group Meeting',
    description: 'This is a group meeting.',
    durationMinutes: 30,
    timeZone: 'Asia/Tokyo',

    // Event start time offset from Monday midnight in minutes.
    // Defalt time is Wednesday 11:30.
    eventTimeOffsetMinutes: 3 * 24 * 60 + 11 * 60 + 30,
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

    // If the number of members is odd, drop one member randomly.
    const droppedMembers = [];
    if (members.length % 2 === 1) {
        console.log('Dropping one member to make the number of members even.');
        const droppedIndex = Math.floor(Math.random() * members.length);
        droppedMembers.push(members[droppedIndex]);
        members.slice(droppedIndex, 1);
    }

    // Generate groups.
    const config = buildGroupGeneratorConfig(members, weights);
    const generator = new GroupGenerator(config);
    const grouping = generator.generateGroups();
    console.log('Total weight: ' + grouping.totalWeight);

    // Send emails to the members who are not in a group.
    const nextMonday = formatNextMonday();
    if (droppedMembers.length > 0) {
        const mailSender = new MailSender(noMatchingEmailConfig);
        mailSender.sendMail(droppedMembers, new Map([
            ['{{MONDAY}}', nextMonday],
        ]));
    }

    // Send emails to the members.
    const calendarEventCreator = new CalendarEventCreator(groupEventConfig.calendarId);
    const mailSender = new MailSender(groupEmailConfig);
    grouping.groups.forEach((group, i) => {
        const groupMembers = group.memberIndices.map(index => grouping.members[index]);
        const replacements = new Map<string, string>([
            ['{{GROUP}}', groupMembers.join(', ')],
            ['{{MONDAY}}', nextMonday],
        ]);
        const eventTime = new Date(new Date(nextMonday).getTime() + groupEventConfig.eventTimeOffsetMinutes * 60 * 1000);
        calendarEventCreator.createEvent({
            summary: groupEventConfig.summary,
            description: groupEventConfig.description,
            start: eventTime,
            durationMinutes: groupEventConfig.durationMinutes,
            timeZone: groupEventConfig.timeZone,
            members: groupMembers,
        });
        mailSender.sendMail(groupMembers, replacements);
    });

    // Record the grouping to the sheet.
    accessor.recordGrouping(grouping, nextMonday);

    console.log('Done: ' + nextMonday);
}

// run();