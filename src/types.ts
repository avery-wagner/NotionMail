import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

/** (credit: https://dev.to/alanpjohn/creating-a-nextjs-blog-in-typescript-using-notion-api-2a9)
 * Using "Extract", we are able to create an alias the exact type we need from the Notion API response.
 * This type contains a "properties" attribute of which we can break down even further into more alias typedefs.
 */

export type MailResult = Extract<
  QueryDatabaseResponse["results"][number],
  { properties: Record<string, unknown> }
>;

type PropertyValueMap = MailResult["properties"];
type PropertyValue = PropertyValueMap[string];

type PropertyValueType = PropertyValue["type"];

type ExtractedPropertyValue<TType extends PropertyValueType> = Extract<
  PropertyValue,
  { type: TType }
>;

// Extract the property value types we need
export type PropertyValueTitle = ExtractedPropertyValue<"title">;
export type PropertyValueRichText = ExtractedPropertyValue<"rich_text">;

/**
 * Type outlining the properties of an entry in our Mail database.
 */
export type IMail = {
  id: string;
  message: string;
  sender: string;
  recipient: string;
};

/**
 * Extract an array of the interface type from the "QueryDatabaseResponse"
 */
export type DatabaseItem = MailResult & {
  properties: {
    Message: PropertyValueTitle;
    Sender: PropertyValueRichText;
    Recipient: PropertyValueRichText;
  };
};

const extractMail = async (
  response: QueryDatabaseResponse
): Promise<IMail[]> => {
  const databaseItems: DatabaseItem[] = response.results.map(
    (databaseItem) => databaseItem as DatabaseItem
  );
  const mailList: IMail[] = await Promise.all(
    databaseItems.map(async (data: DatabaseItem) => {
      const message = data.properties.Message.title[0].plain_text;
      const sender = data.properties.Sender.rich_text[0].plain_text;
      const recipient = data.properties.Recipient.rich_text[0].plain_text;

      const mail: IMail = {
        id: data.id,
        message,
        sender,
        recipient,
      };
      return mail;
    })
  );
  return mailList;
};
