# EvoEngine

EvoEngine is a **CLI-native, local-first autonomous AI agent execution engine** with an evolutionary loop:

1. Load strategy
2. Plan actions
3. Execute tools
4. Reflect on outcomes
5. Store lessons in memory
6. Repeat

It is intentionally minimal, production-oriented, and extensible.

## Features

- **CLI commands**: `init`, `run`, `stop`, `logs`, `inspect`
- **Engine loop** with Planner → Executor → Reflector cycle
- **Model abstraction** (OpenAI + mock provider)
- **JSON/YAML config support**
- **JSON memory system** (short-term + long-term)
- **Persistent logs** in `/logs/engine.log`
- **Pluggable tool registry**
- Built-in tools:
  - `web-fetch`
  - `file-write`
  - `trading-sim` (dummy simulator)

---

## Quick start

### 1) Install

```bash
npm install
```

### 2) Initialize project files

```bash
npm run dev -- init
```

This creates:

- `evoengine.config.json`
- `examples/strategy.json`
- `.evoengine/state.json`
- `.evoengine/memory.json`
- `logs/engine.log`

### 3) Run the engine

```bash
npm run dev -- run
```

### 4) Inspect current state and memory

```bash
npm run dev -- inspect
```

### 5) Tail logs

```bash
npm run dev -- logs --lines 50
```

### 6) Stop a run

```bash
npm run dev -- stop
```

---

## OpenAI usage

By default, config uses `mock` provider. To use OpenAI:

1. Set env var:

```bash
export OPENAI_API_KEY=your_key_here
```

2. Edit `evoengine.config.json`:

```json
{
  "model": {
    "provider": "openai",
    "name": "gpt-4.1-mini",
    "temperature": 0.2
  }
}
```

---

## Project structure

```text
src/
  cli/
    commands.ts
  core/
    engine.ts
    planner.ts
    executor.ts
    reflector.ts
    logger.ts
    state.ts
  llm/
    provider.ts
  memory/
    store.ts
  tools/
    index.ts
  types/
    index.ts
  utils/
    fs.ts
```

---

## Configuration

EvoEngine reads `evoengine.config.json` (or YAML if you adapt command usage).

Example:

```json
{
  "projectName": "EvoEngine",
  "strategyPath": "examples/strategy.json",
  "model": {
    "provider": "mock",
    "name": "gpt-4.1-mini",
    "temperature": 0.2
  },
  "runtime": {
    "maxIterations": 5,
    "loopDelayMs": 250
  }
}
```

---

## Strategy format

`examples/strategy.json`:

```json
{
  "objective": "Continuously improve execution quality for a simple trading-research workflow",
  "constraints": [
    "Operate locally-first and avoid destructive actions",
    "Log every major step"
  ],
  "successCriteria": [
    "Produce tool outputs each loop",
    "Store lessons that alter future behavior"
  ],
  "tools": ["web-fetch", "file-write", "trading-sim"]
}
```

---

## Extending tools

Add a class implementing the `Tool` interface in `src/tools/index.ts`, then register it in `ToolRegistry`.

---

## Production notes

- Keep API keys in environment variables.
- Route logs to your observability stack by tailing `logs/engine.log`.
- Add retries/circuit-breakers per tool as next hardening step.
- Replace JSON memory with a database only when needed.

## License

MIT
