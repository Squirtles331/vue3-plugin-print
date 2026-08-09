import { execFileSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error("The release verification script must be run through npm.");
}
const commands = [
  ["run", "lint"],
  ["test"],
  ["run", "test:performance"],
  ["run", "test:pages-build"],
  ["run", "build:demo"],
  ["run", "build:library"],
  ["run", "test:package"],
  ["run", "test:consumer"],
  ["audit", "--omit=dev", "--audit-level=high", "--registry=https://registry.npmjs.org"],
];

for (const args of commands) {
  execFileSync(process.execPath, [npmCli, ...args], { stdio: "inherit" });
}
