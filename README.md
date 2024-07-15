# random-coffee-chat
Google Apps Script to organize random coffee chat.

Random Coffee Chat is a Google Apps Script that helps you to organize random coffee chat with your team members. It sends an email to two random team members every week to encourage them to meet and chat. The script is designed to be run as a time-driven trigger, so you can set it up once and forget about it.

## Features

- Sends an email to two random team members every week to encourage them to meet and chat.
- Customizable email template.
- Customizable schedule.
- Customizable team members list (takes the list from Google Sheets).

## How to use

This script uses [@google/clasp](https://developers.google.com/apps-script/guides/typescript) to manage the Apps Script project. To get started, follow these steps:

1. Clone this repository:

```bash
git clone
```

2. Install the dependencies:

```bash
npm install
```

3. Login to your Google account and create a new standalone Apps Script project. You might need to enable the Apps Script API, please follow the instructions output in the console:

```bash
npx clasp login
```

4. Push the code to the new project:

```bash
npx clasp push
```

5. Open the project in the browser:

```bash
npx clasp open
```

6. Create a new Google Sheet and add your team members' email addresses in column A.

7. Copy the Sheet ID from the URL and paste it into the `SPREADSHEET_ID` variable in `src/index.ts`.

8. Set up the time-driven trigger to run the `sendRandomCoffeeChat` function once a week.

9. Run the script manually for the first time to send the initial emails.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development

### Code structure

Google Apps Script doesn't support ES6 modules, so the code is written in TypeScript
and compiled to ES5 using the `@google/clasp` tool. The compiled code is then pushed
to the Apps Script project. It doesn't support `import` / `export` syntax, so the
code should be bundled into a single file before pushing it to the Apps Script project,
using `npm run build`.

As a bundler, this project uses `rollup` with the `@rollup/plugin-typescript` plugin.

### Running the script

To run the script locally, use the following command:

```bash
npx clasp run sendRandomCoffeeChat
```

To test the script, use the following command:

```bash
npm test
```

### References

- [Clasp Typescript page](https://github.com/google/clasp/blob/master/docs/typescript.md)
- [Clasp Typescript example](https://github.com/PopGoesTheWza/ts-gas-project-starter)
