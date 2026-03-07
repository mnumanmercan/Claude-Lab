import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const prompt = "Look for duplicate queries in the ./src/queries dir";

const { text } = await generateText({
  model: anthropic("claude-haiku-4-5"),
  prompt,
});

console.log(text);
