import { describe, it, beforeAll, afterAll, expect, vi } from "vitest";
import { sendOutput, readOutput } from "../src/cli";
import NotionMail from "../src/client";
import { IMail } from "../src/types";
import { render } from "@inquirer/testing";
import inputPrompt from "@inquirer/input";

const mockSendData: IMail = {
  id: "test_id",
  message: "Test message",
  sender: "John",
  recipient: "Jane",
  timestamp: Date.now().toString(),
};
vi.mock("../src/client", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      sendMail: vi.fn().mockImplementation(() => {
        sendOutput(mockSendData);
      }),
      readMail: vi.fn().mockImplementation(() => {
        readOutput([mockSendData]);
      }),
    })),
  };
});

vi.mock("../src/cli", async () => {
  const actual = await vi.importActual<typeof import("../src/cli")>(
    "../src/cli"
  );
  return {
    ...actual,
    sendInput: vi.fn().mockResolvedValue({
      id: "test_id",
      message: "Test message",
      sender: "John",
      recipient: "Jane",
      timestamp: Date.now().toString(),
    }),
    readInput: vi.fn().mockResolvedValue({
      user: "John",
    }),
  };
});

describe("Notion Mail Class", () => {
  let notion: NotionMail;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    notion = new NotionMail();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should process input correctly for sending mail", async () => {
    const { answer, events, getScreen } = await render(inputPrompt, {
      message: "What would you like to do?",
    });
    expect(getScreen()).toMatchInlineSnapshot(`"? What would you like to do?"`);

    events.keypress("down");
    events.keypress("enter");

    await notion.sendMail();

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      `\nMessage sent from John to Jane.`
    );
    expect(console.log).toHaveBeenNthCalledWith(2, `\n`);
  });

  it("should process inputs correctly for reading mail", async () => {
    const { answer, events, getScreen } = await render(inputPrompt, {
      message: "What would you like to do?",
    });
    expect(getScreen()).toMatchInlineSnapshot(`"? What would you like to do?"`);

    events.keypress("enter");

    await notion.readMail();

    // includes the 2 logs from previous test
    expect(console.log).toHaveBeenCalledTimes(7);
    expect(console.log).toHaveBeenNthCalledWith(3, `\nMessages: ( 1 )`);
    expect(console.log).toHaveBeenNthCalledWith(4, `\n----------\n`);
    expect(console.log).toHaveBeenNthCalledWith(5, `from: John\n`);
    expect(console.log).toHaveBeenNthCalledWith(6, `Test message`);
    expect(console.log).toHaveBeenNthCalledWith(7, `\n`);
  });
});
