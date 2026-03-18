export type AgentRole = "planner" | "executor" | "reflector";

export interface EngineConfig {
  projectName: string;
  strategyPath: string;
  model: {
    provider: "openai" | "mock";
    name: string;
    temperature: number;
  };
  runtime: {
    maxIterations: number;
    loopDelayMs: number;
  };
}

export interface Strategy {
  objective: string;
  constraints: string[];
  successCriteria: string[];
  tools: string[];
}

export interface MemoryRecord {
  id: string;
  timestamp: string;
  type: "observation" | "lesson" | "result";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface EngineMemory {
  shortTerm: MemoryRecord[];
  longTerm: MemoryRecord[];
}

export interface ActionStep {
  id: string;
  description: string;
  tool: string;
  input: Record<string, unknown>;
}

export interface Plan {
  iteration: number;
  reasoning: string;
  steps: ActionStep[];
}

export interface ActionResult {
  stepId: string;
  tool: string;
  success: boolean;
  output: unknown;
  error?: string;
}

export interface Reflection {
  summary: string;
  lessons: string[];
  planAdjustments: string[];
  shouldStop: boolean;
}

export interface ExecutionState {
  running: boolean;
  iteration: number;
  startedAt?: string;
  updatedAt?: string;
}
