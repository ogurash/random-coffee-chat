export type EventInfo = {
    summary: string;
    description: string;
    start: Date;
    durationMinutes: number;
    timeZone: string;
    members: string[];
};

export class CalendarEventCreator {
    constructor(private readonly calendarId: string) { }

    createEvent(eventInfo: EventInfo): boolean {
        // Use the "advanced" Google Calendar API so that it can be moved to another member.
        const event = {
            summary: eventInfo.summary,
            description: eventInfo.description,
            start: {
                dateTime: eventInfo.start.toISOString(),
                timeZone: eventInfo.timeZone,
            },
            end: {
                dateTime: new Date(eventInfo.start.getTime() + eventInfo.durationMinutes * 60 * 1000).toISOString(),
                timeZone: eventInfo.timeZone,
            },
            attendees: eventInfo.members.map((guest) => ({ email: guest })),
            guestsCanModify: true,
        };

        try {
            const newEvent = Calendar.Events.insert(event, this.calendarId);
            console.log('Event created:', newEvent);
        } catch (err) {
            console.error('Error creating event:', err);
            return false;
        }

        return true;
    }
}