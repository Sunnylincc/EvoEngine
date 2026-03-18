import { ActionResult, Plan } from "../types/index.js";
import { ToolRegistry } from "../tools/index.js";

export class Executor {
  constructor(private readonly tools: ToolRegistry, private readonly baseDir: string) {}

  async run(plan: Plan): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const step of plan.steps) {
      const tool = this.tools.get(step.tool);
      if (!tool) {
        results.push({
          stepId: step.id,
          tool: step.tool,
          success: false,
          output: null,
          error: `Unknown tool: ${step.tool}`
        });
        continue;
      }

      try {
        const output = await tool.execute(step.input, this.baseDir);
        results.push({
          stepId: step.id,
          tool: step.tool,
          success: true,
          output
        });
      } catch (error) {
        results.push({
          stepId: step.id,
          tool: step.tool,
          success: false,
          output: null,
          error: error instanceof Error ? error.message : "Unknown execution error"
        });
      }
    }

    return results;
  }
}
