import assert from "node:assert/strict";
import { isReactive, reactive } from "vue";
import { test } from "vitest";
import { paletteItems } from "../src/print-designer/mock/palette.js";
test("insertion palette icon components remain raw in reactive collections", (): any => {
    const state = reactive({ palette: paletteItems }) as any;
    assert.deepEqual(state.palette.map((item: any): any => item.type), paletteItems.map((item: any): any => item.type));
    assert.ok(state.palette.every((item: any): any => !isReactive(item.icon)));
});
