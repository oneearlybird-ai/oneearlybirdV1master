import type { LLM } from "../lib/adapters";
export const SaaSLLM: LLM = {
  async generate(input) {
    if (input && /patient|dob|phi|diagnosis|mrn|ssn/i.test(input)) {
      return "Sorry, I can’t process sensitive information in this environment.";
    }
    return "SaaSLLM: " + (input || "");
  }
};
