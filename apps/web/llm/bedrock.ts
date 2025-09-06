import type { LLM } from "../lib/adapters";
export const BedrockLLM: LLM = {
  async generate(input) {
    return "Bedrock placeholder: " + (input || "");
  }
};
