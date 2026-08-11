import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error("The packed consumer check must be run through npm.");
}

const temporaryRoot = resolve(".tmp", "packed-consumer");
const consumerRoot = resolve(temporaryRoot, "consumer");
const tarballRoot = resolve(temporaryRoot, "tarball");
const viteCli = resolve("node_modules", "vite", "bin", "vite.js");

rmSync(temporaryRoot, { recursive: true, force: true });
mkdirSync(consumerRoot, { recursive: true });
mkdirSync(tarballRoot, { recursive: true });

try {
  const packed = JSON.parse(execFileSync(process.execPath, [npmCli, "pack", "--json", "--pack-destination", tarballRoot], { encoding: "utf8" }));
  const tarball = resolve(tarballRoot, packed[0].filename);

  writeFileSync(resolve(consumerRoot, "package.json"), JSON.stringify({ private: true, type: "module" }, null, 2));
  writeFileSync(resolve(consumerRoot, "index.html"), "<div id=\"app\"></div><script type=\"module\" src=\"/main.js\"></script>");
  writeFileSync(resolve(consumerRoot, "main.js"), [
    'import { createApp, h } from "vue";',
    'import PrintTemplateStudioPlugin, { PrintTemplateStudio } from "@squirtles331/vue3-plugin-print";',
    'import "@squirtles331/vue3-plugin-print/style.css";',
    'const app = createApp({ render: () => h(PrintTemplateStudio, { height: 320, storageKey: "consumer-check" }) });',
    "app.use(PrintTemplateStudioPlugin);",
    'app.mount("#app");',
  ].join("\n"));

  execFileSync(process.execPath, [
    npmCli,
    "install",
    "--ignore-scripts",
    "--no-package-lock",
    "--prefix",
    consumerRoot,
    "vue@^3.5.13",
    tarball,
  ], { stdio: "inherit" });
  execFileSync(process.execPath, [viteCli, "build", consumerRoot, "--outDir", resolve(consumerRoot, "dist")], { stdio: "inherit" });

  assert.equal(existsSync(resolve(consumerRoot, "dist", "index.html")), true, "Packed consumer build did not produce index.html");
  const output = readFileSync(resolve(consumerRoot, "dist", "index.html"), "utf8");
  assert.match(output, /assets\//, "Packed consumer build did not emit application assets");

  const installedPackageRoot = resolve(consumerRoot, "node_modules", "@squirtles331", "vue3-plugin-print");
  const esmCheckFile = resolve(consumerRoot, "verify-esm-entry.mjs");
  writeFileSync(esmCheckFile, [
    'import plugin, { PrintTemplateStudio, createBlankTemplateDocument } from "@squirtles331/vue3-plugin-print";',
    'if (typeof plugin !== "object" || typeof PrintTemplateStudio !== "object" || typeof createBlankTemplateDocument !== "function") {',
    '  throw new Error("Packed ESM public entry is incomplete.");',
    "}",
  ].join("\n"));
  execFileSync(process.execPath, [esmCheckFile], { cwd: consumerRoot, stdio: "inherit" });

  const requireFromConsumer = createRequire(resolve(consumerRoot, "package.json"));
  const cjsEntry = requireFromConsumer("@squirtles331/vue3-plugin-print");
  for (const [format, entry] of [["CommonJS", cjsEntry]]) {
    assert.equal(typeof entry.default, "object", `${format} entry must expose the plugin as its default export.`);
    assert.equal(typeof entry.PrintTemplateStudio, "object", `${format} entry must expose PrintTemplateStudio.`);
    assert.equal(typeof entry.createBlankTemplateDocument, "function", `${format} entry must expose createBlankTemplateDocument.`);
  }

  const declarations = readFileSync(resolve(installedPackageRoot, "dist", "index.d.ts"), "utf8");
  for (const declaration of ["PrintTemplateStudio", "PrintPolicy", "whenReady", "allowIncomplete"]) {
    assert.match(declarations, new RegExp(`\\b${declaration}\\b`), `Packed declarations must expose ${declaration}.`);
  }
  console.log("Packed consumer build passed.");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
