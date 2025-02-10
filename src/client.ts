import {
  APIErrorCode,
  Client,
  ClientErrorCode,
  isNotionClientError,
  iteratePaginatedAPI,
} from "@notionhq/client";
import axios from "axios";
import { readInput, sendInput } from "./cli";
import chalk from "chalk";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { IMail } from "./types";
// import { Block } from '@notionhq/client'

/**
 * Class that handles client instantiation and query functionality.
 */
export default class NotionClient {
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
      // blocks: blocks.results || null
    };
  }

  async sendMail() {
    const { message, sender, recipient } = await sendInput();

    try {
      await this.client.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Message: {
            title: [{ text: { content: message } }],
          },
          Sender: {
            title: [{ text: { content: sender } }],
          },
          Recipient: {
            title: [{ text: { content: recipient } }],
          },
        },
      });

      console.log(chalk.blue(`Message sent from ${sender} to ${recipient}.`));
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

    let mailItem = await this.client.databases.query({
      // const { results, next_cursor } = await this.client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "Sender",
        rich_text: {
          equals: user,
        },
      },
    });

    let numMessages = 0;
    let next_cursor = mailItem.next_cursor;
    const results = mailItem.results;
    numMessages += 1;

    const pages: any[] = [];
    // let cursor: string | undefined = undefined;

    while (next_cursor !== null) {
      // while (true) {
      mailItem = await this.client.databases.query({
        // const { results, next_cursor } = await this.client.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        start_cursor: next_cursor,
        filter: {
          property: "Sender",
          rich_text: {
            equals: user,
          },
        },
      });

      if (mailItem.object === "list") {
        next_cursor = mailItem.next_cursor;
        pages.push(...results);
      } else {
        next_cursor = null;
      }
    }

    // const res = await Promise.all(
    //   pages.map(async (data: any) => {
    //     return await this.transformReadData(data);
    //   })
    // );
    // return res;
    return results;
  }

  // private async transformReadData(data: any): Promise<IMail | Array<IMail>> {
  //   // const blocks = await this.client.blocks.children.list({
  //   //     block_id: data.id.split('-').join('')
  //   // });

  //   return {
  //     id: data.id,
  //     message: data.properties.Message.title[0].plain_text, // ??
  //     sender: data.properties.Sender.plain_text,
  //     // recipient: data.properties.Recipient.plain_text,
  //     // blocks: blocks.results || null
  //   };
  // }
}
