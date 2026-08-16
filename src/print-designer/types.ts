import type { Component, CSSProperties, Plugin } from 'vue'

export type JsonPrimitive = boolean | null | number | string
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export interface JsonObject {
  [key: string]: JsonValue
}
export type UnknownRecord = Record<string, unknown>
export function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
export type PrintElementType = 'text' | 'image' | 'table' | 'barcode' | 'qrcode' | 'pageNumber' | 'line' | 'rect' | 'circle' | 'multiLabel'

export type ElementStyle = CSSProperties & Record<string, unknown>

export interface ElementProperties extends UnknownRecord {
  autoHeight?: boolean
  autoPaginate?: boolean
  blankHeaders?: boolean
  cellPadding?: number
  cols?: number
  columns?: unknown[]
  dataVariable?: string
  direction?: 'row' | 'column'
  displayValue?: boolean
  eccLevel?: 'L' | 'M' | 'Q' | 'H'
  footerData?: unknown[]
  footerDataVariable?: string
  footerHeight?: number
  format?: string
  gapX?: number
  gapY?: number
  headerHeight?: number
  keepAspectRatio?: boolean
  margin?: number
  placeholder?: string
  primaryPath?: string
  rowHeight?: number
  rowHeights?: UnknownRecord
  rows?: number
  sampleData?: unknown[]
  secondaryPath?: string
  showFooter?: boolean
  showHeader?: boolean
  src?: string
  tertiaryPath?: string
  textFontSize?: number
  textMargin?: number
  tfootRepeat?: boolean
  totalPages?: number
  transform?: UnknownRecord
  whiteSpace?: string
  writingMode?: string
}
export interface TemplateMeta {
  name: string
  unit: 'mm'
  createdAt: string
  updatedAt: string
}
export interface TemplatePaperSettings {
  preset: string
  widthMm: number
  heightMm: number
  orientation: 'portrait' | 'landscape'
}
export interface TemplateMarginSettings {
  top: number
  right: number
  bottom: number
  left: number
}
export interface TemplatePageSettings {
  paper: TemplatePaperSettings
  margin: TemplateMarginSettings
  background: string
  cornerMarks?: {
    visible: boolean
  }
  headerLine?: {
    visible: boolean
    offsetMm: number
  }
  footerLine?: {
    visible: boolean
    offsetMm: number
  }
  printMarks?: {
    visible: boolean
  }
}
export interface TemplateElementStyle extends UnknownRecord {
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  color?: string
  backgroundColor?: string
  textAlign?: 'left' | 'center' | 'right'
}
export interface TemplateElement extends UnknownRecord {
  id: string
  pageId: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  content: string
  variable: string
  visible: boolean
  printable: boolean
  locked: boolean
  repeatPerPage: boolean
  rotation: number
  zIndex: number
  editorHints?: {
    omitRows: boolean
    rowCount: number
  }
  props: ElementProperties
  style: ElementStyle
}
export interface TemplateGroup {
  id: string
  name: string
  elementIds: string[]
}
export interface TemplatePage {
  id: string
  title: string
  elements: TemplateElement[]
  groups: TemplateGroup[]
}

export interface EditorPage extends TemplatePage {
  isCurrent: boolean
  orientation?: string
  size?: string
}

export interface EditorPageState {
  [key: string]: unknown
  id: string
  title: string
  size?: string
  orientation?: string
  isCurrent: boolean
  groups: TemplateGroup[]
}

export interface EditorPageSnapshot {
  currentPageId: string
  objectsById: Record<string, TemplateElement>
  pageObjectMap: Record<string, string[]>
  pages: EditorPageState[]
}

export interface EditorTemplateElement extends TemplateElement {
  selected?: boolean
}
export interface TemplateDocument {
  schemaVersion: 2
  id: string
  meta: TemplateMeta
  pageSettings: TemplatePageSettings
  pages: TemplatePage[]
}
export interface TemplateIssue {
  code?: string
  path: string
  message: string
  severity: 'warning' | 'error'
  elementId?: string
  binding?: string
}
export interface TemplateResult {
  valid: boolean
  document: TemplateDocument | null
  issues: TemplateIssue[]
}
export interface TemplateRepository {
  create?: (overrides?: Partial<TemplateDocument>) => Promise<TemplateDocument>
  list: () => Promise<Array<{
    id: string
    name: string
    updatedAt: string
  }>>
  get: (id: string) => Promise<TemplateDocument | null>
  save: (document: TemplateDocument) => Promise<TemplateDocument>
  delete: (id: string) => Promise<boolean>
  clear?: () => Promise<void>
}
export interface RuntimeDataDraftRepository {
  get: (templateId: string) => Promise<UnknownRecord | null>
  save: (templateId: string, runtimeData: UnknownRecord) => Promise<UnknownRecord>
  delete: (templateId: string) => Promise<boolean>
}
export interface PrintPolicy {
  allowIncomplete?: boolean
}
export interface PrintTemplateStudioErrorPayload {
  scope: string
  error?: unknown
  message: string
  issues?: TemplateIssue[]
}
export interface PrintTemplateStudioInstance {
  whenReady: () => Promise<PrintTemplateStudioInstance>
  loadTemplateDocument: (document: TemplateDocument) => TemplateResult | undefined
  replaceTemplateDocument: (document: TemplateDocument) => Promise<TemplateResult | null> | undefined
  getTemplateDocument: () => TemplateResult | undefined
  getPublishReadyTemplatePayload: () => (TemplateResult & {
    payload?: TemplateDocument | null
  }) | undefined
  setRuntimeData: (data: UnknownRecord) => void
  print: (data?: UnknownRecord) => Promise<void>
}
export interface PrintTemplateStudioProps {
  template?: TemplateDocument | null
  runtimeData?: UnknownRecord
  repository?: TemplateRepository | null
  storageKey?: string
  height?: string | number
  printPolicy?: PrintPolicy
}
export type PrintTemplateStudioComponent = Component<PrintTemplateStudioProps>
export type PrintTemplateStudioPlugin = Plugin
