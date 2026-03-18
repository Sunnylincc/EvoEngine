import path from "node:path";
import { randomUUID } from "node:crypto";
import { EngineMemory, MemoryRecord } from "../types/index.js";
import { readJsonFile, writeJsonFile } from "../utils/fs.js";

const DEFAULT_MEMORY: EngineMemory = {
  shortTerm: [],
  longTerm: []
};

export class MemoryStore {
  private readonly memoryPath: string;

  constructor(private readonly baseDir: string) {
    this.memoryPath = path.join(baseDir, ".evoengine", "memory.json");
  }

  async init(): Promise<void> {
    try {
      await this.load();
    } catch {
      await writeJsonFile(this.memoryPath, DEFAULT_MEMORY);
    }
  }

  async load(): Promise<EngineMemory> {
    return readJsonFile<EngineMemory>(this.memoryPath);
  }

  async addRecord(type: MemoryRecord["type"], content: string, metadata?: Record<string, unknown>): Promise<void> {
    const memory = await this.load();
    const record: MemoryRecord = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      content,
      metadata
    };

    memory.shortTerm.push(record);
    if (memory.shortTerm.length > 20) {
      const shifted = memory.shortTerm.shift();
      if (shifted) {
        memory.longTerm.push(shifted);
      }
    }

    await writeJsonFile(this.memoryPath, memory);
  }
}
