// @vitest-environment jsdom

import assert from "node:assert/strict";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, test, vi } from "vitest";
import TemplateLibraryDialog from "../src/print-designer/template/TemplateLibraryDialog.vue";

const messageBox = vi.hoisted(() => ({ confirm: vi.fn() }));

vi.mock("element-plus", () => ({
  ElMessageBox: messageBox,
}));

const DialogStub = { template: "<section><slot /></section>" };
const ButtonStub = { emits: ["click"], template: "<button v-bind='$attrs' @click='$emit(\"click\")'><slot /></button>" };

function mountLibrary() {
  return mount(TemplateLibraryDialog, {
    props: {
      visible: true,
      templates: [{ id: "template-a", name: "Dispatch note", updatedAt: "2026-08-09T00:00:00.000Z" }],
    },
    global: {
      stubs: {
        ElDialog: DialogStub,
        ElButton: ButtonStub,
      },
    },
  });
}

afterEach(() => {
  messageBox.confirm.mockReset();
});

test("template library emits a confirmed delete intent", async () => {
  messageBox.confirm.mockResolvedValue();
  const wrapper = mountLibrary();

  await wrapper.get(".template-library__delete").trigger("click");
  await flushPromises();

  assert.deepEqual(wrapper.emitted("remove"), [["template-a"]]);
  wrapper.unmount();
});

test("template library emits a confirmed local reset intent and ignores cancellation", async () => {
  const wrapper = mountLibrary();
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
