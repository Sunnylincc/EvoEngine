#!/usr/bin/env node
import { buildCli } from "./cli/commands.js";

const cli = buildCli(process.cwd());
await cli.parseAsync(process.argv);
