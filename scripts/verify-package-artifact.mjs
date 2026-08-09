import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const requiredFiles = ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/style.css"];
for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `Missing package artifact: ${file}`);
}

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(manifest.name, "@squirtles331/vue3-plugin-print");
assert.equal(manifest.private, undefined);
assert.equal(manifest.exports["."].import, "./dist/index.js");
assert.equal(manifest.exports["."].require, "./dist/index.cjs");
assert.equal(manifest.exports["./style.css"], "./dist/style.css");
assert.deepEqual(manifest.peerDependencies, { vue: "^3.5.13" });

const stylesheet = readFileSync("dist/style.css", "utf8");
assert.doesNotMatch(stylesheet, /(^|[\n,])\s*(html|body|#app)\s*[,{]/m, "Package stylesheet must not target host page roots.");

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error("The package artifact check must be run through npm.");
}
const output = execFileSync(process.execPath, [npmCli, "pack", "--dry-run", "--json"], { encoding: "utf8" });
const [packed] = JSON.parse(output);
const packedFiles = new Set(packed.files.map((file) => file.path));
for (const file of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/style.css"]) {
  assert.equal(packedFiles.has(file), true, `npm pack excludes ${file}`);
}
assert.equal([...packedFiles].some((file) => file.startsWith("demo-dist/")), false, "npm pack must not include demo artifacts.");

console.log("Package artifact checks passed.");
