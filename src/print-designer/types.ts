import type { Component, Plugin } from "vue";
export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
    [key: string]: JsonValue;
};
export type UnknownRecord = Record<string, unknown>;
export function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
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
    cornerMarks?: {
        visible: boolean;
    };
    headerLine?: {
        visible: boolean;
        offsetMm: number;
    };
    footerLine?: {
        visible: boolean;
        offsetMm: number;
    };
    printMarks?: {
        visible: boolean;
    };
}
export interface TemplateElementStyle extends UnknownRecord {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    color?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
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
    props: UnknownRecord;
    style: TemplateElementStyle;
}
export interface TemplateGroup {
    id: string;
    name: string;
    elementIds: string[];
}
export interface TemplatePage {
    id: string;
    title: string;
    elements: TemplateElement[];
    groups: TemplateGroup[];
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
    list(): Promise<Array<{
        id: string;
        name: string;
        updatedAt: string;
    }>>;
    get(id: string): Promise<TemplateDocument | null>;
    save(document: TemplateDocument): Promise<TemplateDocument>;
    delete(id: string): Promise<boolean>;
    clear?(): Promise<void>;
}
export interface RuntimeDataDraftRepository {
    get(templateId: string): Promise<UnknownRecord | null>;
    save(templateId: string, runtimeData: UnknownRecord): Promise<UnknownRecord>;
    delete(templateId: string): Promise<boolean>;
}
export interface PrintPolicy {
    allowIncomplete?: boolean;
}
export interface PrintTemplateStudioErrorPayload {
    scope: string;
    error?: unknown;
    message: string;
    issues?: TemplateIssue[];
}
export interface PrintTemplateStudioInstance {
    whenReady(): Promise<PrintTemplateStudioInstance>;
    loadTemplateDocument(document: TemplateDocument): TemplateResult | undefined;
    replaceTemplateDocument(document: TemplateDocument): Promise<TemplateResult | null> | undefined;
    getTemplateDocument(): TemplateResult | undefined;
    getPublishReadyTemplatePayload(): (TemplateResult & {
        payload?: TemplateDocument | null;
    }) | undefined;
    setRuntimeData(data: UnknownRecord): void;
    print(data?: UnknownRecord): Promise<void>;
}
export interface PrintTemplateStudioProps {
    template?: TemplateDocument | null;
    runtimeData?: UnknownRecord;
    repository?: TemplateRepository | null;
    storageKey?: string;
    height?: string | number;
    printPolicy?: PrintPolicy;
}
export type PrintTemplateStudioComponent = Component<PrintTemplateStudioProps>;
export type PrintTemplateStudioPlugin = Plugin;
