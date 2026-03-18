import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const data = await readFile(filePath, "utf8");
  return JSON.parse(data) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function readConfigFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".yaml" || ext === ".yml") {
    return YAML.parse(raw) as T;
  }

  return JSON.parse(raw) as T;
}
