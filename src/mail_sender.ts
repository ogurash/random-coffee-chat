/** Mail template setting used for sending emails to group members.
 * Subject and body can take replacement strings, and they will be
 * replaced with the actual values when sending the email.
 */
type MailTemplate = {
    subject: string;
    body: string;
};

export class MailSender {
    constructor(private readonly mailTemplate: MailTemplate) { }

    sendMail(emails: string[], replacements: Map<string, string>): void {
        // Print quota stats to check if we have enough quota to send an email.
        const emailQuotaRemaining = MailApp.getRemainingDailyQuota();
        console.log("Remaining email quota: " + emailQuotaRemaining);

        // Format the subject and body with the replacements.
        const subject = this.formatString(this.mailTemplate.subject, replacements);
        const body = this.formatString(this.mailTemplate.body, replacements);

        // Send an email to the specified recipient.
        MailApp.sendEmail({
            to: emails.join(','),
            subject: subject,
            body: body
        });
    }

    private formatString(template: string, replacements: Map<string, string>): string {
        let formatted = template;
        replacements.forEach((value, key) => {
            formatted = formatted.replace(new RegExp(key, 'g'), value);
        });
        return formatted;
    }
}