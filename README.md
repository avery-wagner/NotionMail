 <h3 align="center">📬</h3>
 <h1 align="center">NotionMail</h1>

<p align="center">A simple mail app supported by Notion.</p>

<p align="center">
  <a href="#overview">Overview</a> &nbsp;&bull;&nbsp;
  <a href="#testing">Testing</a> &nbsp;&bull;&nbsp;
  <a href="#how-to-use">How to Use</a> &nbsp;&bull;&nbsp;
  <a href="#references">References</a> &nbsp;&bull;&nbsp;
  <a href="#future-improvements">Future Improvements</a> &nbsp;&bull;&nbsp;
  <a href="#justifications">Justifications</a> 
</p>

## Overview

> Description of the program and additional improvements(s) you selected.

This is a simple CLI application that allows you to "send mail" to some specified user. The mail is stored inside a database within Notion, with _Sender_, _Recipient_, and _Message_ properties.

### Additional Improvements

I chose to also add timestamp support, which involved adding a _Date_ property to the database I created.

#### Testing

I created a very simple unit test that seeks to verify the functionality of the CLI in my program. Using the package `@inquirer/testing`, I was able to test some of the menu features and verify that my outputs were correct.

## How to use

> Description about how to install and run the program.

## References

> List of references to sources you relied on (e.g. StackOverflow post about Node CLI applications, API docs, any open-source libraries).

- [https://developers.notion.com/docs/working-with-databases#adding-pages-to-a-database]
  - I referenced the Notion docs throughout this assignment to ensure I was following best practices & using the API properly in my code.
- [https://dev.to/alanpjohn/creating-a-nextjs-blog-in-typescript-using-notion-api-2a9]
  - This article was helpful in properly typing the database responses in my code. I used this author's method of Extraction to create types tailored to the `IMail` interface I created for my database.
- [https://www.npmjs.com/package/@inquirer/testing]
  - I used this package to mimic the behavior of my CLI in my units tests.
- [https://medium.hexlabs.io/typescript-based-command-line-interface-cli-with-node-js-e2d7a0db84d7]
  - This article aided me in structuring my overall CLI program.
- [https://www.color-hex.com/vintage-color-palettes]
  - I used this website for the colors used in my CLI display.
- [https://stephencharlesweiss.com/mocks-and-spies-inspecting-console-messages-with-jest]
  - I used this author's method of spying on the console in my unit tests.

## Future Improvements

> What are some future improvements you might make to this program or its code?

For future improvements, I would like to flesh out the tests for my program much more. I would add individual test cases that check for error handling, and more tests to check that my `inquirer` prompts and CLI outputs are functioning correctly. Being more verbose in my test cases would also be important for future developments, i.e. checking that `sendOutput` works correctly for one message, more than one message, zero messages, etc.

Additionally, I would add more detailed integration and end-to-end tests that would replace mocked API requests with real ones, and more robustly check that my program is working with the Notion API as expected.

I might also add some of the following features:

- Ability to delete emails
- Ability to flag or prioritize emails
- Ability to filter emails by message content
- Ability for messages to be sent between unique user databases

## Justifications

> What were some of the product or technical choices you made and why?

I decided to use TypeScript for building my application because of its typing capabilities, and because I am comfortable with the language. When working with databases, I know it is important to employ strong type checking to protect data coming in and out of the database. This is why I sought out a method to "extract" types directly from the Notion API; this allows for strong typing of data and concise data processing within my program.

Creating the `NotionMail` class ensures that only one instance of the Notion Mail client is running at a time. This could be important in a broader context to ensure that data can be properly read and written into the database, and avoids the potentiality of duplicate requests. Additionally, this structure allows for error checking within the `NotionMail` constructor to avoid running the client without the necessary connection configuration: the API key and database ID. This also prevents this sensitive information from being hard coded, and instead relies on the use of environment variables. This abstraction promotes security and deployability of the app on a larger scale.
