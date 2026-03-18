import path from "node:path";
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { EvoEngine } from "../core/engine.js";
import { StateStore } from "../core/state.js";
import { Logger } from "../core/logger.js";
import { MemoryStore } from "../memory/store.js";
import { ensureDir, writeJsonFile } from "../utils/fs.js";
import { EngineConfig, Strategy } from "../types/index.js";

const DEFAULT_CONFIG: EngineConfig = {
  projectName: "EvoEngine",
  strategyPath: "examples/strategy.json",
  model: {
    provider: "mock",
    name: "gpt-4.1-mini",
    temperature: 0.2
  },
  runtime: {
    maxIterations: 5,
    loopDelayMs: 250
  }
};

const DEFAULT_STRATEGY: Strategy = {
  objective: "Continuously improve execution quality for a simple trading-research workflow",
  constraints: [
    "Operate locally-first and avoid destructive actions",
    "Log every major step"
  ],
  successCriteria: [
    "Produce tool outputs each loop",
    "Store lessons that alter future behavior"
  ],
  tools: ["web-fetch", "file-write", "trading-sim"]
};

export function buildCli(baseDir: string): Command {
  const program = new Command();
  const configPath = path.join(baseDir, "evoengine.config.json");

  program
    .name("evoengine")
    .description("Local-first autonomous AI execution engine with evolutionary loop")
    .version("0.1.0");

  program.command("init").description("Initialize EvoEngine project files").action(async () => {
    await ensureDir(path.join(baseDir, ".evoengine"));
    await ensureDir(path.join(baseDir, "logs"));
    await ensureDir(path.join(baseDir, "examples"));

    await writeJsonFile(configPath, DEFAULT_CONFIG);
    await writeJsonFile(path.join(baseDir, "examples", "strategy.json"), DEFAULT_STRATEGY);

    const engine = await EvoEngine.load(baseDir, configPath);
    await engine.init();

    console.log(`Initialized EvoEngine in ${baseDir}`);
    console.log(`Config: ${configPath}`);
  });

  program.command("run").description("Run the autonomous engine loop").action(async () => {
    const engine = await EvoEngine.load(baseDir, configPath);
    await engine.init();
    await engine.run();
    console.log("Run completed. Check logs/engine.log for details.");
  });

  program.command("stop").description("Stop a running engine loop").action(async () => {
    const state = new StateStore(baseDir);
    await state.init();
    await state.set({ running: false });
    console.log("Stop signal written.");
  });

  program.command("logs")
    .description("Tail recent engine logs")
    .option("-n, --lines <number>", "number of lines", "25")
    .action(async (opts: { lines: string }) => {
      const logger = new Logger(baseDir);
      const logPath = logger.getLogFilePath();
      const raw = await readFile(logPath, "utf8");
      const lines = raw.trim().split("\n");
      const count = Number(opts.lines) || 25;
      console.log(lines.slice(-count).join("\n"));
    });

  program.command("inspect").description("Inspect state and memory snapshot").action(async () => {
    const state = new StateStore(baseDir);
    const memory = new MemoryStore(baseDir);
    await state.init();
    await memory.init();

    const [stateData, memoryData] = await Promise.all([state.get(), memory.load()]);

    console.log(JSON.stringify({ state: stateData, memory: memoryData }, null, 2));
  });

  return program;
}
