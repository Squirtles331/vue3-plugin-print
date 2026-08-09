import assert from "node:assert/strict";
import { test } from "vitest";
import { resolveDeploymentBase } from "../vite.config.js";

test("uses a repository-relative base only for GitHub Actions Pages builds", () => {
  assert.equal(resolveDeploymentBase({}), "/");
  assert.equal(resolveDeploymentBase({ GITHUB_ACTIONS: "true" }), "/");
  assert.equal(resolveDeploymentBase({ VITE_BASE_URL: "/" }), "/");
  assert.equal(resolveDeploymentBase({ VITE_BASE_URL: "/vue3-plugin-print/" }), "/vue3-plugin-print/");
  assert.equal(resolveDeploymentBase({ GITHUB_ACTIONS: "true", GITHUB_REPOSITORY: "open-source-maintainer/print-template-studio" }), "/print-template-studio/");
});
