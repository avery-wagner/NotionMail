import {
  APIErrorCode,
  Client,
  ClientErrorCode,
  isNotionClientError,
  iteratePaginatedAPI,
} from "@notionhq/client";
import axios from "axios";
import { readInput, readOutput, sendInput, sendOutput } from "./cli";
import chalk from "chalk";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { DatabaseItem, extractMail, IMail } from "./types";

/**
 * Class that handles client instantiation and query functionality.
 */
export default class NotionMail {
  client: any;

  constructor() {
    if (!process.env.NOTION_KEY) {
      throw new Error("Notion API token not specified.");
    }

    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error("Notion database ID not specified.");
    }

    this.client = new Client({ auth: process.env.NOTION_KEY });
  }

  async getData() {
    const db = await this.client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    const res = await Promise.all(
      db.results.map(async (data: any) => {
        return await this.dataTransformer(data);
      })
    );
    return res;
  }

  private async dataTransformer(data: any): Promise<IMail> {
    const blocks = await this.client.blocks.children.list({
      block_id: data.id.split("-").join(""),
    });

    return {
      id: data.id,
      message: data.properties.Message.title[0].plain_text, // ??
      sender: data.properties.Sender.plain_text,
      recipient: data.properties.Recipient.plain_text,
    };
  }

  async sendMail() {
    const mail = await sendInput();

    try {
      await this.client.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Message: {
            title: [{ text: { content: mail.message } }],
          },
          Sender: {
            rich_text: [{ text: { content: mail.sender } }],
          },
          Recipient: {
            rich_text: [{ text: { content: mail.recipient } }],
          },
        },
      });
      sendOutput(mail);
      return Promise.resolve();
    } catch (err) {
      if (isNotionClientError(err)) {
        console.error(
          chalk.bold.red("[!] Notion API error: "),
          chalk.red(err.message)
        );
        // Strongly type the error to NotionClientError
        switch (err.code) {
          case ClientErrorCode.RequestTimeout:
            console.error(chalk.yellow("Request timed out! Please try again."));
            break;
          case APIErrorCode.ObjectNotFound:
            console.error(
              chalk.yellow(
                "Object not found! Please verify database connection."
              )
            );
            break;
          case APIErrorCode.Unauthorized:
            console.error(
              chalk.yellow(
                "Unauthorized! Please verify your credentials or connection."
              )
            );
            break;
          default:
            break;
        }
      } else {
        console.error(chalk.red("Some error occurred: ", err.message));
      }
      return Promise.reject(err);
    }
  }

  async readMail() {
    const { user } = await readInput();

    const response: QueryDatabaseResponse = await this.client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "Sender",
        rich_text: {
          equals: user,
        },
      },
    });

    const mail: IMail[] = await extractMail(response);

    readOutput(mail);
  }
}
