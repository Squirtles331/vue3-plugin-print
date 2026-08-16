import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
const npmCli = process.env.npm_execpath;
if (!npmCli) {
    throw new Error("The GitHub Pages verification script must be run through npm.");
}
const repositoryName = "vue3-plugin-print";
const docsDist = resolve("docs", ".vitepress", "dist");
const docsIndexPath = resolve(docsDist, "index.html");
const demoIndexPath = resolve(docsDist, "demo", "index.html");
function resolveExpectedBasePath() {
    const configuredBase = process.env.VITEPRESS_BASE || process.env.VITE_BASE_URL;
    if (typeof configuredBase === "string" && configuredBase.trim()) {
        const normalizedBase = configuredBase.trim().replace(/^\/+|\/+$/g, "");
        return normalizedBase ? `/${normalizedBase}/` : "/";
    }
    return `/${repositoryName}/`;
}
function joinBase(base, child) {
    const normalizedBase = base.replace(/\/+$/, "");
    return `${normalizedBase}/${child.replace(/^\/+|\/+$/g, "")}/`;
}
const expectedBasePath = resolveExpectedBasePath();
rmSync(docsDist, { recursive: true, force: true });
try {
    execFileSync(process.execPath, [npmCli, "run", "pages:build"], {
        env: {
            ...process.env,
            VITEPRESS_BASE: expectedBasePath,
        },
        stdio: "inherit",
    });
    assert.equal(existsSync(docsIndexPath), true, "GitHub Pages docs build did not emit index.html");
    assert.equal(existsSync(demoIndexPath), true, "GitHub Pages docs build did not emit the demo application");
    const docsIndex = readFileSync(docsIndexPath, "utf8");
    const demoIndex = readFileSync(demoIndexPath, "utf8");
    assert.ok(docsIndex.includes(`${expectedBasePath}assets/`), "Docs build did not use the configured asset base path");
    assert.ok(demoIndex.includes(`${joinBase(expectedBasePath, "demo")}assets/`), "Demo build did not use the configured demo base path");
}
finally {
    rmSync(docsDist, { recursive: true, force: true });
}
