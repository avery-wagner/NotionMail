#!/usr/bin/env npx tsx

// #!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import { config } from "dotenv";

import NotionClient from "./client";

// require("dotenv").config();
config();
export const notion = new NotionClient();

export async function sendInput() {
  const inputs = await inquirer.prompt([
    { type: "input", name: "sender", message: "Sender:" },
    { type: "input", name: "recipient", message: "Recipient:" },
    { type: "input", name: "message", message: "Message:" },
  ]);
  return inputs;
}

export async function readInput() {
  const inputs = await inquirer.prompt([
    { type: "input", name: "user", message: "User:" },
  ]);
  return inputs;
}

program
  .name("NotionMail")
  .description("A simple mail app supported by Notion.")
  .version("1.0.0");
//   .option("send", "Send mail to a user.")
//   .option("read", "Check a user's mail.");

// const options = program.opts();

// program
//     .command("fetch")
//     .description("Fetch and display data from the Notion Mail database.")
//     .action()

program
  .command("read")
  .description("Read mail from a specified user.")
  .action(function () {
    notion.readMail();
  });

program
  .command("send")
  .description("Send a message to a specified user.")
  .action(function () {
    notion.sendMail();
  });

// program
//     .command("quit")
//     .description("Quit the NotionMail program.")
//     .action()

program.parse(process.argv);
