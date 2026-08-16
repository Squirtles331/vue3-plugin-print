import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as any;
const receivedTag = process.env.RELEASE_TAG as any;
const expectedTag = `v${manifest.version}` as any;
assert.ok(receivedTag, "Missing RELEASE_TAG. Package publication is only allowed from a versioned Git tag.");
assert.equal(receivedTag, expectedTag, `Release tag mismatch: expected ${expectedTag} from package.json, received ${receivedTag}.`);
console.log(`Release tag ${receivedTag} matches package version ${manifest.version}.`);
