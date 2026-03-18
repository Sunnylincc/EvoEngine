import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface Tool {
  name: string;
  execute(input: Record<string, unknown>, baseDir: string): Promise<unknown>;
}

class WebFetchTool implements Tool {
  name = "web-fetch";

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const target = String(input.url ?? "https://example.com");
    const res = await fetch(target);
    const text = await res.text();

    return {
      url: target,
      status: res.status,
      preview: text.slice(0, 200)
    };
  }
}

class FileWriteTool implements Tool {
  name = "file-write";

  async execute(input: Record<string, unknown>, baseDir: string): Promise<unknown> {
    const relative = String(input.path ?? "outputs/agent-output.txt");
    const fullPath = path.join(baseDir, relative);
    const content = String(input.content ?? `Generated at ${new Date().toISOString()}`);

    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, `${content}\n`, { encoding: "utf8" });
    return { path: fullPath, bytes: content.length };
  }
}

class TradingSimulatorTool implements Tool {
  name = "trading-sim";

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const seed = Number(input.iteration ?? 1);
    const pnl = Number(((Math.sin(seed) + 1) * 25 - 10).toFixed(2));

    return {
      market: "SIM",
      trades: [{ side: seed % 2 === 0 ? "BUY" : "SELL", qty: 1, price: 100 + seed }],
      pnl
    };
  }
}

export class ToolRegistry {
  private readonly tools = new Map<string, Tool>();

  constructor() {
    [new WebFetchTool(), new FileWriteTool(), new TradingSimulatorTool()].forEach((tool) => {
      this.tools.set(tool.name, tool);
    });
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): string[] {
    return [...this.tools.keys()];
  }
}
