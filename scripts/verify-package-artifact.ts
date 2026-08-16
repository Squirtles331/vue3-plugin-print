import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
const requiredFiles = [
    "dist/index.js",
    "dist/index.cjs",
    "dist/index.d.ts",
    "dist/print-designer/types.d.ts",
    "dist/style.css",
];
for (const file of requiredFiles) {
    assert.equal(existsSync(file), true, `Missing package artifact: ${file}`);
}
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(manifest.name, "@squirtles331/vue3-plugin-print");
assert.equal(manifest.private, undefined);
assert.equal(manifest.exports["."].import, "./dist/index.js");
assert.equal(manifest.exports["."].require, "./dist/index.cjs");
assert.equal(manifest.exports["."].types, "./dist/index.d.ts");
assert.equal(manifest.exports["./style.css"], "./dist/style.css");
assert.deepEqual(manifest.peerDependencies, {
    vue: "^3.5.13",
});
assert.equal(manifest.dependencies?.["element-plus"], undefined);
assert.equal(manifest.dependencies?.["@element-plus/icons-vue"], undefined);
assert.equal(manifest.devDependencies?.["element-plus"], undefined);
assert.equal(manifest.devDependencies?.["@element-plus/icons-vue"], undefined);
const stylesheet = readFileSync("dist/style.css", "utf8");
assert.doesNotMatch(stylesheet, /(^|[\n,])\s*(html|body|#app)\s*[,{]/m, "Package stylesheet must not target host page roots.");
assert.doesNotMatch(stylesheet, /\.el-[\w-]+/, "Package stylesheet must not contain Element Plus selectors.");
for (const file of ["dist/index.js", "dist/index.cjs"]) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /element-plus|@element-plus\/icons-vue/, `${file} must not reference Element Plus.`);
}
const declarations = readFileSync("dist/index.d.ts", "utf8");
for (const publicType of ["PrintTemplateStudio", "PrintPolicy", "TemplateDocument", "TemplateRepository"]) {
    assert.match(declarations, new RegExp(`\\b${publicType}\\b`), `Type declarations must expose ${publicType}.`);
}
const publicTypes = readFileSync("dist/print-designer/types.d.ts", "utf8");
for (const publicType of ["whenReady", "allowIncomplete"]) {
    assert.match(publicTypes, new RegExp(`\\b${publicType}\\b`), `Generated public types must expose ${publicType}.`);
}
const npmCli = process.env.npm_execpath;
if (!npmCli) {
    throw new Error("The package artifact check must be run through npm.");
}
const output = execFileSync(process.execPath, [npmCli, "pack", "--dry-run", "--json"], { encoding: "utf8" });
const [packed] = JSON.parse(output);
const packedFiles = new Set(packed.files.map((file) => file.path));
for (const file of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/print-designer/types.d.ts", "dist/style.css"]) {
    assert.equal(packedFiles.has(file), true, `npm pack excludes ${file}`);
}
assert.equal([...packedFiles].some((file) => file.startsWith("demo-dist/")), false, "npm pack must not include demo artifacts.");
console.log("Package artifact checks passed.");
