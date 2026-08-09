// @vitest-environment jsdom

import assert from "node:assert/strict";
import { createApp, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { test } from "vitest";
import PrintTemplateStudioPlugin, { PrintTemplateStudio, createBlankTemplateDocument } from "../src/library/index.js";

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};

HTMLCanvasElement.prototype.getContext = () => ({
  setTransform() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fillText() {}, save() {}, translate() {}, rotate() {}, restore() {},
});

test("registers the package component through the Vue plugin", () => {
  const app = createApp({ template: "<div />" });
  app.use(PrintTemplateStudioPlugin);

  assert.equal(app.component("PrintTemplateStudio"), PrintTemplateStudio);
  assert.ok(app.component("ElButton"));
});

test("isolates template state for multiple mounted designers", async () => {
  const first = mount(PrintTemplateStudio, { props: { storageKey: "library-test-one", height: 320 }, attachTo: document.body });
  const second = mount(PrintTemplateStudio, { props: { storageKey: "library-test-two", height: 320 }, attachTo: document.body });

  await nextTick();
  await nextTick();
  const template = createBlankTemplateDocument({ meta: { name: "First instance" } });
  first.vm.loadTemplateDocument(template);
  await nextTick();
  await nextTick();

  assert.equal(first.vm.getTemplateDocument().document.meta.name, "First instance");
  assert.notEqual(second.vm.getTemplateDocument().document.meta.name, "First instance");
  assert.equal(first.emitted("update:template")?.at(-1)?.[0]?.meta.name, "First instance");

  first.unmount();
  second.unmount();
});

test("forwards repository failures through the component error event", async () => {
  const repository = {
    async list() { return []; },
    async get() { return null; },
    async save() { throw new Error("Save rejected by host"); },
    async delete() { return false; },
  };
  const wrapper = mount(PrintTemplateStudio, { props: { repository, height: 320 }, attachTo: document.body });

  await nextTick();
  await nextTick();
  await wrapper.find(".header-bar__chip.is-primary").trigger("click");
  await new Promise((resolve) => setTimeout(resolve, 0));

  const [payload] = wrapper.emitted("error").at(-1);
  assert.equal(payload.scope, "repository.save");
  assert.equal(payload.message, "Save rejected by host");
  wrapper.unmount();
});
