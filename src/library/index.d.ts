import type { ComponentOptionsMixin, DefineComponent, Plugin } from "vue";

export type PrintElementType = "text" | "image" | "table" | "barcode" | "qrcode" | "pageNumber" | "line" | "rect" | "circle" | "multiLabel";

export interface TemplateMeta {
  name: string;
  unit: "mm";
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePaperSettings {
  preset: string;
  widthMm: number;
  heightMm: number;
  orientation: "portrait" | "landscape";
}

export interface TemplateMarginSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplatePageSettings {
  paper: TemplatePaperSettings;
  margin: TemplateMarginSettings;
  background: string;
  cornerMarks?: { visible: boolean };
  headerLine?: { visible: boolean; offsetMm: number };
  footerLine?: { visible: boolean; offsetMm: number };
  printMarks?: { visible: boolean };
}

export interface TemplateElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  [key: string]: unknown;
}

export interface TemplateElement {
  id: string;
  pageId: string;
  type: PrintElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  variable: string;
  visible: boolean;
  printable: boolean;
  locked: boolean;
  repeatPerPage: boolean;
  rotation: number;
  zIndex: number;
  props: Record<string, unknown>;
  style: TemplateElementStyle;
}

export interface TemplatePage {
  id: string;
  title: string;
  elements: TemplateElement[];
  groups: TemplateGroup[];
}

/** Editor-only layout grouping. Runtime rendering continues to use independent elements. */
export interface TemplateGroup {
  id: string;
  name: string;
  elementIds: string[];
}

export interface TemplateDocument {
  schemaVersion: 2;
  id: string;
  meta: TemplateMeta;
  pageSettings: TemplatePageSettings;
  pages: TemplatePage[];
}

export interface TemplateIssue {
  code?: string;
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

export interface PrintPolicy {
  /** Allow missing business data and safe-area violations to print as warnings. */
  allowIncomplete?: boolean;
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
  printPolicy?: PrintPolicy;
}

export interface PrintTemplateStudioEmitValidators {
  "update:template": (template: TemplateDocument) => boolean;
  "update:runtimeData": (runtimeData: Record<string, unknown>) => boolean;
  "template-change": (template: TemplateDocument) => boolean;
  error: (payload: PrintTemplateStudioErrorPayload) => boolean;
  ready: (instance: PrintTemplateStudioInstance) => boolean;
}

export interface PrintTemplateStudioInstance {
  whenReady(): Promise<PrintTemplateStudioInstance>;
  loadTemplateDocument(document: TemplateDocument): TemplateResult | undefined;
  replaceTemplateDocument(document: TemplateDocument): Promise<TemplateResult | null> | undefined;
  getTemplateDocument(): TemplateResult | undefined;
  getPublishReadyTemplatePayload(): TemplateResult & { payload?: TemplateDocument | null } | undefined;
  setRuntimeData(data: Record<string, unknown>): void;
  print(data?: Record<string, unknown>): Promise<void>;
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
export function serializeTemplateDocument(document: unknown): TemplateResult;
export function createPublishReadyTemplatePayload(document: unknown): TemplateResult & { payload?: TemplateDocument | null };
export function createLocalTemplateRepository(options?: { storage?: Storage; key?: string }): TemplateRepository;
export function createRestTemplateRepository(options: { baseUrl: string; fetchImpl?: typeof fetch; getHeaders?: () => Record<string, string> }): TemplateRepository;
export interface RuntimeDataDraftRepository {
  get(templateId: string): Promise<Record<string, unknown> | null>;
  save(templateId: string, runtimeData: Record<string, unknown>): Promise<Record<string, unknown>>;
  delete(templateId: string): Promise<boolean>;
}
export function createLocalRuntimeDataDraftRepository(options?: { storage?: Storage; key?: string }): RuntimeDataDraftRepository;

declare const plugin: Plugin;
export default plugin;
