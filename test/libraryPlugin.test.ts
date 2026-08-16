// @vitest-environment jsdom
import assert from "node:assert/strict";
import { createApp, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { test } from "vitest";
import PrintTemplateStudioPlugin, { PrintTemplateStudio, createBlankTemplateDocument } from "../src/index.js";
globalThis.ResizeObserver = class {
    observe(): any { }
    disconnect(): any { }
} as unknown as typeof ResizeObserver;
HTMLCanvasElement.prototype.getContext = (): any => ({
    setTransform(): any { }, clearRect(): any { }, fillRect(): any { }, beginPath(): any { }, moveTo(): any { }, lineTo(): any { }, stroke(): any { }, fillText(): any { }, save(): any { }, translate(): any { }, rotate(): any { }, restore(): any { },
});
test("registers the package component through the Vue plugin", (): any => {
    const app = createApp({ template: "<div />" }) as any;
    app.use(PrintTemplateStudioPlugin);
    assert.equal(app.component("PrintTemplateStudio"), PrintTemplateStudio);
    assert.ok(app.component("PdButton"));
    assert.equal(app.component("ElButton"), undefined);
});
test("isolates template state for multiple mounted designers", async (): Promise<any> => {
    const first = mount(PrintTemplateStudio, { props: { storageKey: "library-test-one", height: 320 }, attachTo: document.body }) as any;
    const second = mount(PrintTemplateStudio, { props: { storageKey: "library-test-two", height: 320 }, attachTo: document.body }) as any;
    await nextTick();
    await nextTick();
    const template = createBlankTemplateDocument({ meta: { name: "First instance" } }) as any;
    first.vm.loadTemplateDocument(template);
    await nextTick();
    await nextTick();
    assert.equal(first.vm.getTemplateDocument().document.meta.name, "First instance");
    assert.notEqual(second.vm.getTemplateDocument().document.meta.name, "First instance");
    assert.equal(first.emitted("update:template")?.at(-1)?.[0]?.meta.name, "First instance");
    first.unmount();
    second.unmount();
});
test("exposes a readiness promise for host integration", async (): Promise<any> => {
    const wrapper = mount(PrintTemplateStudio, { props: { storageKey: "library-ready", height: 320 }, attachTo: document.body }) as any;
    const editor = await wrapper.vm.whenReady() as any;
    assert.equal(typeof editor.getTemplateDocument, "function");
    wrapper.unmount();
});
test("forwards repository failures through the component error event", async (): Promise<any> => {
    const repository = {
        async list(): Promise<any> { return []; },
        async get(): Promise<any> { return null; },
        async save(): Promise<any> { throw new Error("Save rejected by host"); },
        async delete(): Promise<any> { return false; },
    } as any;
    const wrapper = mount(PrintTemplateStudio, { props: { repository, height: 320 }, attachTo: document.body }) as any;
    await nextTick();
    await nextTick();
    await wrapper.find(".header-bar__chip.is-primary").trigger("click");
    await new Promise((resolve: any): any => setTimeout(resolve, 0));
    const [payload] = wrapper.emitted("error").at(-1) as any;
    assert.equal(payload.scope, "repository.save");
    assert.equal(payload.message, "Save rejected by host");
    wrapper.unmount();
});
