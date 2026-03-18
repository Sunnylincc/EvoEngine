import { randomUUID } from "node:crypto";
import { LLMProvider } from "../llm/provider.js";
import { EngineMemory, Plan, Strategy } from "../types/index.js";

export class Planner {
  constructor(private readonly llm: LLMProvider) {}

  async generate(iteration: number, strategy: Strategy, memory: EngineMemory): Promise<Plan> {
    const prompt = [
      "You are a planning module for an autonomous execution engine.",
      `Objective: ${strategy.objective}`,
      `Constraints: ${strategy.constraints.join("; ")}`,
      `Recent memory: ${memory.shortTerm.map((m) => `${m.type}:${m.content}`).slice(-5).join(" | ") || "none"}`,
      "Return concise planning reasoning."
    ].join("\n");

    const reasoning = await this.llm.complete(prompt);

    const tools = strategy.tools.length ? strategy.tools : ["web-fetch", "file-write", "trading-sim"];
    const steps = tools.slice(0, 3).map((tool, idx) => ({
      id: randomUUID(),
      description: `Iteration ${iteration}: execute ${tool} step ${idx + 1} toward objective`,
      tool,
      input: {
        objective: strategy.objective,
        iteration,
        step: idx + 1
      }
    }));

    return {
      iteration,
      reasoning,
      steps
    };
  }
}
