import { LLMProvider } from "../llm/provider.js";
import { ActionResult, Reflection } from "../types/index.js";

export class Reflector {
  constructor(private readonly llm: LLMProvider) {}

  async analyze(iteration: number, results: ActionResult[]): Promise<Reflection> {
    const failures = results.filter((r) => !r.success);
    const summaryPrompt = [
      "Reflect on this autonomous agent iteration.",
      `Iteration: ${iteration}`,
      `Results: ${JSON.stringify(results)}`,
      "Produce a short improvement summary."
    ].join("\n");

    const summary = await this.llm.complete(summaryPrompt);

    const lessons = [
      failures.length > 0 ? `Handle ${failures.length} tool failures with retries or fallbacks.` : "Continue current tool selection strategy.",
      "Persist high-signal outputs to long-term memory for future planning."
    ];

    const planAdjustments = failures.length
      ? ["Prioritize stable tools next iteration.", "Add validation before tool execution."]
      : ["Increase ambition of action steps gradually."];

    return {
      summary,
      lessons,
      planAdjustments,
      shouldStop: failures.length >= 3
    };
  }
}
