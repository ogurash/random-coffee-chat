import { CalendarEventCreator } from "../src/calendar_event_creator";

function run() {
    const creator = new CalendarEventCreator("c_b4d8dec69393874674eda335322e7d2d1efcab0eca964f233e0ebccb95de0626@group.calendar.google.com");
    creator.createEvent({
        summary: "Test Event",
        description: "This is a test event.",
        start: new Date("2023-01-01T09:00:00+09:00"),
        durationMinutes: 30,
        timeZone: "Asia/Tokyo",
        members: ["tomohiro.takatsuka@power-x.jp", "naoki.ito@power-x.jp"],
    });
}