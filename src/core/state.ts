import path from "node:path";
import { ExecutionState } from "../types/index.js";
import { readJsonFile, writeJsonFile } from "../utils/fs.js";

const defaultState: ExecutionState = {
  running: false,
  iteration: 0
};

export class StateStore {
  private readonly statePath: string;

  constructor(baseDir: string) {
    this.statePath = path.join(baseDir, ".evoengine", "state.json");
  }

  async init(): Promise<void> {
    try {
      await this.get();
    } catch {
      await writeJsonFile(this.statePath, defaultState);
    }
  }

  async get(): Promise<ExecutionState> {
    return readJsonFile<ExecutionState>(this.statePath);
  }

  async set(partial: Partial<ExecutionState>): Promise<ExecutionState> {
    const current = await this.get();
    const next = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile(this.statePath, next);
    return next;
  }

  getPath(): string {
    return this.statePath;
  }
}
