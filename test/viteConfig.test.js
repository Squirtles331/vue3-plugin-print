import assert from "node:assert/strict";
import { test } from "vitest";
import { resolveDeploymentBase } from "../vite.config.js";

test("uses a repository-relative base only for GitHub Actions Pages builds", () => {
  assert.equal(resolveDeploymentBase({}), "/");
  assert.equal(resolveDeploymentBase({ GITHUB_ACTIONS: "true" }), "/");
  assert.equal(resolveDeploymentBase({ GITHUB_ACTIONS: "true", GITHUB_REPOSITORY: "open-source-maintainer/print-template-studio" }), "/print-template-studio/");
});
