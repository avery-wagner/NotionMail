#!/usr/bin/env npx tsx

// #!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import { config } from "dotenv";

import NotionClient from "./client";
import chalk from "chalk";
import { IMail } from "./types";

export const RF_RED = "#F95738";
export const RF_ORANGE = "#EE964B";
export const RF_YELLOW = "#F4D35E";
export const RF_CREAM = "#FAF0CA";
export const RF_BLUE = "#0D3B66";

export const RM_TEAL = "#38BDAC";
export const RB_BLUE = "#d1e7ea"; // retro body

// require("dotenv").config();
config();
export const notion = new NotionClient();

export async function sendInput() {
  const inputs = await inquirer.prompt([
    { type: "input", name: "sender", message: "Sender:" },
    { type: "input", name: "recipient", message: "Recipient:" },
    { type: "input", name: "message", message: "Message:" },
  ]);

  const mail: IMail = {
    id: "",
    message: inputs.message,
    sender: inputs.sender,
    recipient: inputs.recipient,
  };

  // return inputs;
  return mail;
}

export async function readInput() {
  const inputs = await inquirer.prompt([
    { type: "input", name: "user", message: "User:" },
  ]);
  return inputs;
}

export function sendOutput(data: IMail) {
  console.log(
    chalk.hex(RB_BLUE)(
      `\nMessage sent from ${chalk.hex(RM_TEAL)(data.sender)} to ${chalk.hex(
        RM_TEAL
      )(data.recipient)}.`
    )
  );
  console.log(`\n`);
}

export function readOutput(data: IMail[]) {
  console.log(
    chalk.hex(RF_CREAM)(`\nMessages: (`, chalk.hex(RM_TEAL)(data.length), `)`)
  );

  data.forEach((mailItem: IMail) => {
    console.log(chalk.hex(RF_BLUE)(`\n----------\n`));
    console.log(
      chalk.hex(RF_BLUE)(`from: ${chalk.hex(RM_TEAL)(mailItem.sender)}\n`)
    );
    console.log(chalk.hex(RF_CREAM)(`${mailItem.message}`));
  });

  console.log(`\n`);
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
