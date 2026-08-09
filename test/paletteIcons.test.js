import assert from "node:assert/strict";
import { isReactive, reactive } from "vue";
import { test } from "vitest";
import { paletteItems } from "../src/print-designer/mock/palette.js";

test("insertion palette icon components remain raw in reactive collections", () => {
  const state = reactive({ palette: paletteItems });

  assert.deepEqual(state.palette.map((item) => item.type), paletteItems.map((item) => item.type));
  assert.ok(state.palette.every((item) => !isReactive(item.icon)));
});
