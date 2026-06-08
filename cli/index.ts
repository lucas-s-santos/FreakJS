#!/usr/bin/env bun

const [,, command, ...args] = process.argv;

const commands: Record<string, () => Promise<void>> = {
  dev:    () => import("./commands/dev.ts").then((m) => m.dev(args)),
  build:  () => import("./commands/build.ts").then((m) => m.build(args)),
  create: () => import("./commands/create.ts").then((m) => m.create(args)),
};

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

const handler = commands[command];

if (!handler) {
  console.error(`[FreakJS] Unknown command: "${command}"`);
  printHelp();
  process.exit(1);
}

await handler();

function printHelp() {
  console.log(`
  FreakJS — Bun-native frontend framework

  Usage:
    freakjs <command> [options]

  Commands:
    dev     Start the development server
    build   Build for production (Vercel Build Output API v3)
    create  Scaffold a new FreakJS project

  Options:
    -h, --help   Show this help message
`);
}
