import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repositoryName = "print-template-studio";
const outputDirectory = resolve(".tmp", "github-pages-build");
const viteCli = resolve("node_modules", "vite", "bin", "vite.js");

rmSync(outputDirectory, { recursive: true, force: true });

try {
  execFileSync(process.execPath, [viteCli, "build", "--outDir", outputDirectory], {
    env: {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_REPOSITORY: `open-source-maintainer/${repositoryName}`,
    },
    stdio: "inherit",
  });

  const indexPath = resolve(outputDirectory, "index.html");
  assert.equal(existsSync(indexPath), true, "GitHub Pages build did not emit index.html");
  const index = readFileSync(indexPath, "utf8");
  assert.match(index, new RegExp(`/${repositoryName}/assets/`), "GitHub Pages build did not use the repository asset base path");
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
