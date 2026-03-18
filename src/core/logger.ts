import path from "node:path";
import { appendFile } from "node:fs/promises";
import { ensureDir } from "../utils/fs.js";

export class Logger {
  private readonly logFilePath: string;

  constructor(baseDir: string) {
    this.logFilePath = path.join(baseDir, "logs", "engine.log");
  }

  async log(scope: string, message: string, metadata?: unknown): Promise<void> {
    await ensureDir(path.dirname(this.logFilePath));

    const record = {
      timestamp: new Date().toISOString(),
      scope,
      message,
      metadata: metadata ?? null
    };

    await appendFile(this.logFilePath, `${JSON.stringify(record)}\n`, "utf8");
  }

  getLogFilePath(): string {
    return this.logFilePath;
  }
}
