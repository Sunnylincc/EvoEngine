import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { Planner } from "./planner.js";
import { Executor } from "./executor.js";
import { Reflector } from "./reflector.js";
import { Logger } from "./logger.js";
import { StateStore } from "./state.js";
import { MemoryStore } from "../memory/store.js";
import { MockProvider, OpenAIProvider } from "../llm/provider.js";
import { ToolRegistry } from "../tools/index.js";
import { EngineConfig, Strategy } from "../types/index.js";
import { readConfigFile } from "../utils/fs.js";

export class EvoEngine {
  private readonly logger: Logger;
  private readonly state: StateStore;
  private readonly memory: MemoryStore;

  constructor(private readonly baseDir: string, private readonly config: EngineConfig) {
    this.logger = new Logger(baseDir);
    this.state = new StateStore(baseDir);
    this.memory = new MemoryStore(baseDir);
  }

  static async load(baseDir: string, configPath: string): Promise<EvoEngine> {
    const config = await readConfigFile<EngineConfig>(configPath);
    return new EvoEngine(baseDir, config);
  }

  async init(): Promise<void> {
    await this.state.init();
    await this.memory.init();
    await this.logger.log("engine", "Initialized EvoEngine runtime", { project: this.config.projectName });
  }

  async run(): Promise<void> {
    const provider = this.config.model.provider === "openai"
      ? new OpenAIProvider(this.config.model.name, this.config.model.temperature)
      : new MockProvider();

    const strategy = await readConfigFile<Strategy>(path.resolve(this.baseDir, this.config.strategyPath));
    const planner = new Planner(provider);
    const executor = new Executor(new ToolRegistry(), this.baseDir);
    const reflector = new Reflector(provider);

    await this.state.set({ running: true, startedAt: new Date().toISOString() });
    await this.logger.log("engine", "Run started", { objective: strategy.objective });

    for (let iteration = 1; iteration <= this.config.runtime.maxIterations; iteration += 1) {
      const current = await this.state.get();
      if (!current.running) {
        await this.logger.log("engine", "Run halted by external stop signal", { iteration });
        break;
      }

      const memory = await this.memory.load();
      const plan = await planner.generate(iteration, strategy, memory);
      await this.logger.log("planner", "Generated plan", plan);

      const results = await executor.run(plan);
      await this.logger.log("executor", "Executed plan", results);
      await this.memory.addRecord("result", `Iteration ${iteration} produced ${results.length} results`, { results });

      const reflection = await reflector.analyze(iteration, results);
      await this.logger.log("reflector", "Generated reflection", reflection);
      await this.memory.addRecord("lesson", reflection.summary, {
        lessons: reflection.lessons,
        planAdjustments: reflection.planAdjustments
      });

      await this.state.set({ iteration });

      if (reflection.shouldStop) {
        await this.logger.log("engine", "Stopping due to reflection signal", { iteration });
        break;
      }

      await sleep(this.config.runtime.loopDelayMs);
    }

    await this.state.set({ running: false });
    await this.logger.log("engine", "Run completed");
  }
}
