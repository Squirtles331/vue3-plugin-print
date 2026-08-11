import type { ComponentOptionsMixin, DefineComponent, Plugin } from "vue";

export interface TemplateDocument {
  schemaVersion: number;
  id: string;
  meta: { name: string; unit: string; createdAt: string; updatedAt: string };
  pageSettings: Record<string, unknown>;
  pages: Array<Record<string, unknown>>;
}

export interface TemplateIssue {
  path: string;
  message: string;
  severity: "warning" | "error";
  elementId?: string;
  binding?: string;
}

export interface TemplateResult {
  valid: boolean;
  document: TemplateDocument | null;
  issues: TemplateIssue[];
}

export interface TemplateRepository {
  create?(overrides?: Partial<TemplateDocument>): Promise<TemplateDocument>;
  list(): Promise<Array<{ id: string; name: string; updatedAt: string }>>;
  get(id: string): Promise<TemplateDocument | null>;
  save(document: TemplateDocument): Promise<TemplateDocument>;
  delete(id: string): Promise<boolean>;
  clear?(): Promise<void>;
}

export interface PrintTemplateStudioErrorPayload {
  scope: string;
  error?: unknown;
  message: string;
  issues?: TemplateIssue[];
}

export interface PrintTemplateStudioProps {
  template?: TemplateDocument | null;
  runtimeData?: Record<string, unknown>;
  repository?: TemplateRepository | null;
  storageKey?: string;
  height?: string | number;
}

export interface PrintTemplateStudioEmitValidators {
  "update:template": (template: TemplateDocument) => boolean;
  "update:runtimeData": (runtimeData: Record<string, unknown>) => boolean;
  "template-change": (template: TemplateDocument) => boolean;
  error: (payload: PrintTemplateStudioErrorPayload) => boolean;
  ready: (instance: PrintTemplateStudioInstance) => boolean;
}

export interface PrintTemplateStudioInstance {
  loadTemplateDocument(document: TemplateDocument): TemplateResult | undefined;
  getTemplateDocument(): TemplateResult | undefined;
  getPublishReadyTemplatePayload(): TemplateResult & { payload?: TemplateDocument | null } | undefined;
  setRuntimeData(data: Record<string, unknown>): void;
  print(data?: Record<string, unknown>): Promise<void> | undefined;
}

export const PrintTemplateStudio: DefineComponent<
  PrintTemplateStudioProps,
  {},
  {},
  {},
  {},
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  PrintTemplateStudioEmitValidators
>;

export const TEMPLATE_SCHEMA_VERSION: number;
export function createBlankTemplateDocument(overrides?: Partial<TemplateDocument>): TemplateDocument;
export function validateTemplateDocument(document: unknown): TemplateResult;
export function migrateTemplateDocument(document: unknown): TemplateResult;
export function serializeTemplateDocument(document: unknown): TemplateResult;
export function createPublishReadyTemplatePayload(document: unknown): TemplateResult & { payload?: TemplateDocument | null };
export function createLocalTemplateRepository(options?: { storage?: Storage; key?: string }): TemplateRepository;
export function createRestTemplateRepository(options: { baseUrl: string; fetchImpl?: typeof fetch; getHeaders?: () => Record<string, string> }): TemplateRepository;

declare const plugin: Plugin;
export default plugin;
