import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const source = resolve("src/library/index.d.ts");
const target = resolve("dist/index.d.ts");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
