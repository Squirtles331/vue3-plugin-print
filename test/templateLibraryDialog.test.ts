// @vitest-environment jsdom
import assert from "node:assert/strict";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, test, vi } from "vitest";
import TemplateLibraryDialog from "../src/print-designer/template/TemplateLibraryDialog.vue";
const messageBox = vi.hoisted((): any => ({ confirm: vi.fn() })) as any;
vi.mock("../src/print-designer/ui/feedback.js", (): any => ({
    PdMessageBox: messageBox,
}));
const DialogStub = { props: ["modelValue"], template: "<section v-if='modelValue'><slot /></section>" } as any;
function mountLibrary(): any {
    return mount(TemplateLibraryDialog, {
        props: {
            visible: true,
            templates: [{ id: "template-a", name: "Dispatch note", updatedAt: "2026-08-09T00:00:00.000Z" }],
        },
        global: {
            stubs: {
                PdDialog: DialogStub,
            },
        },
    });
}
afterEach((): any => {
    messageBox.confirm.mockReset();
});
test("template library emits a confirmed delete intent", async (): Promise<any> => {
    messageBox.confirm.mockResolvedValue();
    const wrapper = mountLibrary() as any;
    await wrapper.get(".template-library__delete").trigger("click");
    await flushPromises();
    assert.deepEqual(wrapper.emitted("remove"), [["template-a"]]);
    wrapper.unmount();
});
test("template library emits a confirmed local reset intent and ignores cancellation", async (): Promise<any> => {
    const wrapper = mountLibrary() as any;
    messageBox.confirm.mockRejectedValueOnce("cancel");
    await wrapper.get(".template-library__actions button").trigger("click");
    await flushPromises();
    assert.equal(wrapper.emitted("clear"), undefined);
    messageBox.confirm.mockResolvedValueOnce();
    await wrapper.get(".template-library__actions button").trigger("click");
    await flushPromises();
    assert.deepEqual(wrapper.emitted("clear"), [[]]);
    wrapper.unmount();
});
