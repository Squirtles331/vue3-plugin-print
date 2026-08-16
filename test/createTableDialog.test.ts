// @vitest-environment jsdom
import assert from "node:assert/strict";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { test } from "vitest";
import CreateTableDialog from "../src/print-designer/editor/components/CreateTableDialog.vue";
test("custom table mode starts with the blank-grid row preset while allowing a manual row count", async () => {
    const wrapper = mount(CreateTableDialog, { props: { visible: true }, attachTo: document.body });
    const radios = document.body.querySelectorAll(".pd-radio__input");
    await radios[1].dispatchEvent(new Event("change", { bubbles: true }));
    await nextTick();
    const numbers = document.body.querySelectorAll(".pd-input-number");
    assert.equal(numbers[1].value, "10");
    numbers[1].value = "12";
    await numbers[1].dispatchEvent(new Event("change", { bubbles: true }));
    await nextTick();
    await (document.body.querySelector(".pd-button--primary")).click();
    assert.deepEqual(wrapper.emitted("confirm")?.[0]?.[0], { mode: "custom", columnCount: 5, rowCount: 12 });
    wrapper.unmount();
});
