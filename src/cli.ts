#!/usr/bin/env npx tsx

import inquirer from "inquirer";
import { config } from "dotenv";

import NotionClient from "./client";
import chalk from "chalk";
import { IMail } from "./types";
import {
  RM_TEAL,
  VS_CREAM,
  VS_DARK_BLUE,
  VS_LIGHT_BLUE,
  VS_MID_BLUE,
  VS_RED,
} from "./colors";

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
    timestamp: new Date().toISOString(),
  };

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
    chalk.hex(VS_CREAM)(
      `\nMessage sent from ${chalk.hex(RM_TEAL)(data.sender)} to ${chalk.hex(
        RM_TEAL
      )(data.recipient)}.`
    )
  );
  console.log(`\n`);
}

export function readOutput(data: IMail[]) {
  console.log(
    chalk.hex(VS_CREAM)(
      `\nMessages: (`,
      chalk.hex(VS_MID_BLUE)(data.length),
      `)`
    )
  );

  data.forEach((mailItem: IMail) => {
    console.log(chalk.hex(VS_DARK_BLUE)(`\n----------\n`));
    console.log(
      chalk.hex(VS_DARK_BLUE)(
        `from: ${chalk.hex(VS_MID_BLUE)(mailItem.sender)}\n`
      )
    );
    console.log(chalk.hex(VS_CREAM)(`${mailItem.message}`));
  });

  console.log(`\n`);
}

async function main() {
  console.log(
    chalk.hex(VS_CREAM)(
      `\t\t\t\t     📬\n\n\t\t\t - Welcome to ${chalk.bold.hex(VS_RED)(
        `NotionMail`
      )}! -\n`
    )
  );
  console.log(
    chalk.italic.hex(VS_DARK_BLUE)(
      `\t\t   a simple mail app supported by Notion.\n`
    )
  );
  console.log(
    chalk.hex(VS_CREAM)(
      `\t\t- ${chalk.bold.hex(RM_TEAL)(
        `read`
      )}: Read mail from a specified user.\n`
    )
  );
  console.log(
    chalk.hex(VS_CREAM)(
      `\t\t- ${chalk.bold.hex(RM_TEAL)(
        `send`
      )}: Send a message to a specified user.\n`
    )
  );
  console.log(
    chalk.hex(VS_CREAM)(
      `\t\t- ${chalk.bold.hex(RM_TEAL)(`quit`)}: Quit the program.\n`
    )
  );

  while (true) {
    const { cmd } = await inquirer.prompt({
      type: "list",
      name: "cmd",
      message: "What would you like to do?",
      choices: ["read", "send", "quit"],
    });

    switch (cmd) {
      case "read":
        await notion.readMail();
        break;
      case "send":
        await notion.sendMail();
        break;
      case "quit":
        console.log(
          chalk.italic.hex(VS_LIGHT_BLUE)(
            `\n 👋 Quitting NotionMail. Goodbye!\n`
          )
        );
        process.exit(0);
      default:
        console.log(chalk.red("Invalid command. Please try again."));
        break;
    }
  }
}

// main();
if (require.main === module) {
  main();
}
