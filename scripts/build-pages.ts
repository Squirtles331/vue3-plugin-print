import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const npmCli = process.env.npm_execpath as any;
if (!npmCli) {
    throw new Error("The Pages build script must be run through npm.");
}
function normalizeBase(value: any): any {
    if (typeof value !== "string" || !value.trim()) {
        return "/";
    }
    const normalized = value.trim().replace(/^\/+|\/+$/g, "") as any;
    return normalized ? `/${normalized}/` : "/";
}
function joinBase(base: any, child: any): any {
    return `${normalizeBase(base)}${child.replace(/^\/+|\/+$/g, "")}/`;
}
const pagesBase = normalizeBase(process.env.VITEPRESS_BASE || process.env.VITE_BASE_URL) as any;
const docsDist = resolve("docs", ".vitepress", "dist") as any;
const demoDist = resolve("demo-dist") as any;
const demoTarget = resolve(docsDist, "demo") as any;
rmSync(docsDist, { recursive: true, force: true });
rmSync(demoDist, { recursive: true, force: true });
execFileSync(process.execPath, [npmCli, "run", "docs:build"], {
    env: {
        ...process.env,
        VITEPRESS_BASE: pagesBase,
    },
    stdio: "inherit",
});
execFileSync(process.execPath, [npmCli, "run", "build:demo", "--", "--mode", "github-pages"], {
    env: {
        ...process.env,
        VITE_BASE_URL: joinBase(pagesBase, "demo"),
        NODE_ENV: "production",
    },
    stdio: "inherit",
});
mkdirSync(demoTarget, { recursive: true });
cpSync(demoDist, demoTarget, { recursive: true });
