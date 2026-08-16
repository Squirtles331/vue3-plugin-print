import { BARCODE_FORMATS, PAGE_NUMBER_FORMATS, QRCODE_ECC_LEVELS } from "./constants";
import { FONT_FAMILY_OPTIONS, TEXT_PRESET_OPTIONS } from "./textFormatting";
export const INSPECTOR_TABS = {
    PROPERTY: "property",
    STYLE: "style",
    ADVANCED: "advanced",
} as any;
export const TAB_LABELS = {
    [INSPECTOR_TABS.PROPERTY]: "属性",
    [INSPECTOR_TABS.STYLE]: "样式",
    [INSPECTOR_TABS.ADVANCED]: "高级",
} as any;
export const FIELD_SOURCE = {
    ROOT: "root",
    STYLE: "style",
    PROPS: "props",
} as any;
export const FIELD_CONTROL = {
    INPUT: "input",
    TEXTAREA: "textarea",
    NUMBER: "number",
    SELECT: "select",
    SWITCH: "switch",
    COLOR: "color",
    CODE: "code",
    IMAGE: "image",
    TABLE_COLUMNS: "table-columns",
    TABLE_SAMPLE_ROWS: "table-sample-rows",
    TABLE_FOOTER: "table-footer",
    MULTI_LABEL_ITEMS: "multi-label-items",
    ACTIONS: "actions",
    READONLY: "readonly",
    BUTTONS: "buttons",
} as any;
export const SECTION_LAYOUT = {
    STACK: "stack",
    GRID_2: "grid-2",
    ACTIONS_2X2: "actions-2x2",
    INLINE_BUTTONS: "inline-buttons",
} as any;
const BORDER_STYLE_OPTIONS = [
    { label: "实线", value: "solid" },
    { label: "虚线", value: "dashed" },
    { label: "点线", value: "dotted" },
] as any;
const TEXT_ALIGN_OPTIONS = [
    { label: "左对齐", value: "left" },
    { label: "居中", value: "center" },
    { label: "右对齐", value: "right" },
] as any;
const VERTICAL_ALIGN_OPTIONS = [
    { label: "顶部", value: "top" },
    { label: "居中", value: "middle" },
    { label: "底部", value: "bottom" },
] as any;
const FONT_WEIGHT_OPTIONS = [
    { label: "常规", value: "normal" },
    { label: "加粗", value: "bold" },
] as any;
const FONT_STYLE_OPTIONS = [
    { label: "常规", value: "normal" },
    { label: "斜体", value: "italic" },
] as any;
const TEXT_DECORATION_OPTIONS = [
    { label: "无", value: "none" },
    { label: "下划线", value: "underline" },
] as any;
const WHITE_SPACE_OPTIONS = [
    { label: "自动换行", value: "pre-wrap" },
    { label: "单行", value: "nowrap" },
    { label: "保留空格", value: "pre" },
] as any;
const WRITING_MODE_OPTIONS = [
    { label: "横排", value: "horizontal-tb" },
    { label: "竖排", value: "vertical-rl" },
] as any;
const OBJECT_FIT_OPTIONS = [
    { label: "适应", value: "contain" },
    { label: "裁切填满", value: "cover" },
    { label: "拉伸", value: "fill" },
    { label: "原始尺寸", value: "none" },
] as any;
const MULTI_LABEL_DIRECTION_OPTIONS = [
    { label: "按行填充", value: "row" },
    { label: "按列填充", value: "column" },
] as any;
const LINE_HEIGHT_OPTIONS = [
    { label: "1.0", value: 1 },
    { label: "1.2", value: 1.2 },
    { label: "1.4", value: 1.4 },
    { label: "1.6", value: 1.6 },
    { label: "1.8", value: 1.8 },
    { label: "2.0", value: 2 },
] as any;
function createField(key: any, label: any, source: any, control: any, options: any = {}): any {
    return {
        key,
        label,
        source,
        control,
        ...options,
    };
}
function createSection(key: any, label: any, layout: any, fields: any = [], options: any = {}): any {
    return {
        key,
        label,
        layout,
        fields,
        ...options,
    };
}
function createTab(key: any, sections: any = []): any {
    return {
        key,
        sections,
    };
}
function findSchemaSection(schema: any, tabKey: any, sectionKey: any): any {
    return schema?.tabs?.find((tab: any): any => tab.key === tabKey)?.sections?.find((section: any): any => section.key === sectionKey) || null;
}
function patchSchemaFieldControl(schema: any, tabKey: any, sectionKey: any, source: any, key: any, control: any): any {
    const section = findSchemaSection(schema, tabKey, sectionKey) as any;
    const field = section?.fields?.find((item: any): any => item.source === source && item.key === key) as any;
    if (field) {
        field.control = control;
    }
}
function insertSchemaFieldAfter(schema: any, tabKey: any, sectionKey: any, afterKey: any, field: any): any {
    const section = findSchemaSection(schema, tabKey, sectionKey) as any;
    if (!section?.fields) {
        return;
    }
    const exists = section.fields.some((item: any): any => item.source === field.source && item.key === field.key) as any;
    if (exists) {
        return;
    }
    const insertAt = section.fields.findIndex((item: any): any => item.source === field.source && item.key === afterKey) as any;
    if (insertAt === -1) {
        section.fields.push(field);
        return;
    }
    section.fields.splice(insertAt + 1, 0, field);
}
function removeSchemaField(schema: any, tabKey: any, sectionKey: any, source: any, key: any): any {
    const section = findSchemaSection(schema, tabKey, sectionKey) as any;
    if (!section?.fields) {
        return;
    }
    section.fields = section.fields.filter((item: any): any => !(item.source === source && item.key === key));
}
const GEOMETRY_FIELDS = [
    createField("x", "X(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("y", "Y(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("width", "宽度(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("height", "高度(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("rotation", "旋转(°)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 1 }),
] as any;
const BEHAVIOR_FIELDS = [
    createField("printable", "是否打印", FIELD_SOURCE.ROOT, FIELD_CONTROL.SWITCH),
    createField("locked", "锁定元素", FIELD_SOURCE.ROOT, FIELD_CONTROL.SWITCH),
    createField("repeatPerPage", "每页重复", FIELD_SOURCE.ROOT, FIELD_CONTROL.SWITCH),
] as any;
const COMMON_METADATA_FIELDS = [
    createField("id", "ID", FIELD_SOURCE.ROOT, FIELD_CONTROL.READONLY),
    createField("type", "类型", FIELD_SOURCE.ROOT, FIELD_CONTROL.READONLY),
    createField("visible", "显示", FIELD_SOURCE.ROOT, FIELD_CONTROL.SWITCH),
    createField("zIndex", "层级值", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 1 }),
] as any;
const COMMON_MANAGEMENT_FIELDS = [
    createField("saveAsTemplate", "保存为模板元素", FIELD_SOURCE.ROOT, FIELD_CONTROL.BUTTONS, {
        buttons: [{ label: "保存为模板元素", value: "saveAsTemplate", tone: "default" }],
    }),
    createField("deleteElement", "删除当前元素", FIELD_SOURCE.ROOT, FIELD_CONTROL.BUTTONS, {
        buttons: [{ label: "删除当前元素", value: "deleteElement", tone: "danger" }],
    }),
] as any;
const LAYER_ACTION_OPTIONS = [
    { label: "上移一层", value: "bringForward" },
    { label: "下移一层", value: "sendBackward" },
    { label: "置于顶层", value: "bringToFront" },
    { label: "置于底层", value: "sendToBack" },
] as any;
const TEXT_PRESET_FIELD = createField("textPreset", "样式预设", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
    options: TEXT_PRESET_OPTIONS,
}) as any;
const TEXT_FORMATTING_SUMMARY_FIELDS = [
    createField("fontFamily", "字体", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: FONT_FAMILY_OPTIONS,
    }),
    createField("fontSize", "字号", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 8,
        max: 120,
        step: 1,
    }),
    createField("color", "文字颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("lineHeight", "行高", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: LINE_HEIGHT_OPTIONS,
    }),
] as any;
const COMMON_PROPERTY_FIELDS = [
    createField("layerActions", "层级操作", FIELD_SOURCE.ROOT, FIELD_CONTROL.ACTIONS, {
        actions: LAYER_ACTION_OPTIONS,
    }),
] as any;
function createCommonInspectorSchema(propertyFields: any = [], styleFields: any = [], advancedFields: any = []): any {
    return {
        tabs: [
            createTab(INSPECTOR_TABS.PROPERTY, [
                createSection("property", "属性", SECTION_LAYOUT.STACK, [...propertyFields, ...COMMON_PROPERTY_FIELDS]),
            ]),
            createTab(INSPECTOR_TABS.STYLE, [createSection("style", "样式", SECTION_LAYOUT.STACK, styleFields)]),
            createTab(INSPECTOR_TABS.ADVANCED, [createSection("advanced", "高级", SECTION_LAYOUT.STACK, advancedFields)]),
        ],
    };
}
export const TEXT_INSPECTOR_SCHEMA = {
    tabs: [
        createTab(INSPECTOR_TABS.PROPERTY, [
            createSection("geometry", "位置 & 尺寸", SECTION_LAYOUT.GRID_2, GEOMETRY_FIELDS),
            createSection("layer", "层级", SECTION_LAYOUT.ACTIONS_2X2, [
                createField("layerActions", "层级操作", FIELD_SOURCE.ROOT, FIELD_CONTROL.ACTIONS, {
                    actions: LAYER_ACTION_OPTIONS,
                }),
            ]),
            createSection("content", "内容", SECTION_LAYOUT.STACK, [
                createField("name", "元素名称", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT),
                createField("content", "文本内容", FIELD_SOURCE.ROOT, FIELD_CONTROL.TEXTAREA),
                createField("variable", "变量绑定", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT),
            ]),
            createSection("behavior", "数据 & 行为", SECTION_LAYOUT.GRID_2, [
                ...BEHAVIOR_FIELDS,
                createField("autoHeight", "自动高度", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH),
            ]),
        ]),
        createTab(INSPECTOR_TABS.STYLE, [
            createSection("preset", "样式预设", SECTION_LAYOUT.STACK, [TEXT_PRESET_FIELD]),
            createSection("formatting", "补充排版", SECTION_LAYOUT.GRID_2, [
                ...TEXT_FORMATTING_SUMMARY_FIELDS,
                createField("letterSpacing", "字间距", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, { step: 0.1 }),
                createField("whiteSpace", "换行方式", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
                    options: WHITE_SPACE_OPTIONS,
                }),
                createField("writingMode", "书写方向", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
                    options: WRITING_MODE_OPTIONS,
                }),
                createField("textDecoration", "文本装饰", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
                    options: TEXT_DECORATION_OPTIONS,
                }),
            ]),
            createSection("border", "边框", SECTION_LAYOUT.GRID_2, [
                createField("borderStyle", "边框样式", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
                    options: BORDER_STYLE_OPTIONS,
                }),
                createField("borderWidth", "边框宽度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
                    min: 0,
                    step: 0.1,
                }),
                createField("borderColor", "边框颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
                createField("borderRadius", "圆角", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
                    min: 0,
                    step: 1,
                }),
            ]),
            createSection("appearance", "外观", SECTION_LAYOUT.GRID_2, [
                createField("backgroundColor", "背景颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
                createField("opacity", "透明度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
                    min: 0,
                    max: 1,
                    step: 0.1,
                }),
                createField("padding", "内边距", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
                    min: 0,
                    step: 1,
                }),
            ]),
        ]),
        createTab(INSPECTOR_TABS.ADVANCED, [
            createSection("metadata", "元素信息", SECTION_LAYOUT.STACK, [
                createField("id", "ID", FIELD_SOURCE.ROOT, FIELD_CONTROL.READONLY),
                createField("type", "类型", FIELD_SOURCE.ROOT, FIELD_CONTROL.READONLY),
                createField("visible", "显示", FIELD_SOURCE.ROOT, FIELD_CONTROL.SWITCH),
                createField("zIndex", "层级值", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 1 }),
            ]),
            createSection("actions", "扩展能力", SECTION_LAYOUT.STACK, [
                createField("saveAsTemplate", "保存为模板元素", FIELD_SOURCE.ROOT, FIELD_CONTROL.BUTTONS, {
                    buttons: [{ label: "保存为模板元素", value: "saveAsTemplate", tone: "default" }],
                }),
            ]),
            createSection("danger", "危险操作", SECTION_LAYOUT.STACK, [
                createField("deleteElement", "删除当前元素", FIELD_SOURCE.ROOT, FIELD_CONTROL.BUTTONS, {
                    buttons: [{ label: "删除当前元素", value: "deleteElement", tone: "danger" }],
                }),
            ]),
        ]),
    ],
} as any;
const BASE_ADVANCED_FIELDS = [] as any;
BASE_ADVANCED_FIELDS.push(...COMMON_METADATA_FIELDS, ...BEHAVIOR_FIELDS, ...COMMON_MANAGEMENT_FIELDS);
const BASE_STYLE_FIELDS = [
    createField("opacity", "透明度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        max: 1,
        step: 0.1,
    }),
    createField("backgroundColor", "背景颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("borderColor", "边框颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("borderWidth", "边框宽度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        step: 0.1,
    }),
    createField("borderStyle", "边框样式", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: BORDER_STYLE_OPTIONS,
    }),
    createField("borderRadius", "圆角", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        step: 1,
    }),
    createField("padding", "内边距", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        step: 1,
    }),
] as any;
const BASE_TEXT_STYLE_FIELDS = [
    createField("fontFamily", "字体", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: FONT_FAMILY_OPTIONS,
    }),
    createField("fontSize", "字号", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 8,
        max: 120,
        step: 1,
    }),
    createField("fontWeight", "字重", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: FONT_WEIGHT_OPTIONS,
    }),
    createField("fontStyle", "字形", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: FONT_STYLE_OPTIONS,
    }),
    createField("color", "文字颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("textAlign", "水平对齐", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: TEXT_ALIGN_OPTIONS,
    }),
    createField("verticalAlign", "垂直对齐", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: VERTICAL_ALIGN_OPTIONS,
    }),
    createField("lineHeight", "行高", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: LINE_HEIGHT_OPTIONS,
    }),
    createField("letterSpacing", "字间距", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        step: 0.1,
    }),
] as any;
export const IMAGE_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    ...GEOMETRY_FIELDS,
    createField("variable", "变量绑定", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT),
    createField("src", "图片地址", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT),
    createField("placeholder", "占位文字", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT),
    createField("keepAspectRatio", "保持比例", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH),
], [
    ...BASE_STYLE_FIELDS,
    createField("objectFit", "填充方式", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: OBJECT_FIT_OPTIONS,
    }),
], [...BASE_ADVANCED_FIELDS, createField("src", "图片预览", FIELD_SOURCE.PROPS, FIELD_CONTROL.IMAGE)]) as any;
export const TABLE_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    ...GEOMETRY_FIELDS,
    createField("dataVariable", "数据变量", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT),
    createField("footerDataVariable", "页脚变量", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT),
    createField("columns", "列配置", FIELD_SOURCE.PROPS, FIELD_CONTROL.CODE, {
        valueType: "json",
        rows: 10,
    }),
    createField("sampleData", "预览数据", FIELD_SOURCE.PROPS, FIELD_CONTROL.CODE, {
        valueType: "json",
        rows: 10,
    }),
], [...BASE_STYLE_FIELDS, ...BASE_TEXT_STYLE_FIELDS], [
    ...BASE_ADVANCED_FIELDS,
    createField("showHeader", "显示表头", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH),
    createField("showFooter", "显示表尾", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH),
    createField("autoPaginate", "自动分页", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH),
    createField("tfootRepeat", "页脚重复", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH),
    createField("footerData", "页脚数据", FIELD_SOURCE.PROPS, FIELD_CONTROL.CODE, {
        valueType: "json",
        rows: 6,
    }),
    createField("transform", "数据转换", FIELD_SOURCE.PROPS, FIELD_CONTROL.CODE, {
        valueType: "json",
        rows: 8,
    }),
]) as any;
export const BARCODE_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    ...GEOMETRY_FIELDS,
    createField("content", "条码内容", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT),
    createField("format", "编码格式", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
        options: BARCODE_FORMATS.map((value: any): any => ({ label: value, value })),
    }),
], [
    ...BASE_STYLE_FIELDS,
    createField("color", "条码颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("backgroundColor", "底色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
], [...BASE_ADVANCED_FIELDS, createField("displayValue", "显示文字", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH)]) as any;
export const QRCODE_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    ...GEOMETRY_FIELDS,
    createField("content", "二维码内容", FIELD_SOURCE.ROOT, FIELD_CONTROL.TEXTAREA),
    createField("eccLevel", "纠错等级", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
        options: QRCODE_ECC_LEVELS.map((value: any): any => ({ label: value, value })),
    }),
], [
    ...BASE_STYLE_FIELDS,
    createField("color", "前景色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("backgroundColor", "背景色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
], [...BASE_ADVANCED_FIELDS]) as any;
export const PAGE_NUMBER_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    ...GEOMETRY_FIELDS,
    createField("format", "页码格式", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
        options: PAGE_NUMBER_FORMATS.map((value: any): any => ({ label: value, value })),
    }),
], [...BASE_STYLE_FIELDS, ...BASE_TEXT_STYLE_FIELDS], [...BASE_ADVANCED_FIELDS]) as any;
export const LINE_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    createField("x", "X(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("y", "Y(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("width", "宽度(mm)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("height", "线宽", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 0.1 }),
    createField("rotation", "旋转(°)", FIELD_SOURCE.ROOT, FIELD_CONTROL.NUMBER, { step: 1 }),
], [
    createField("borderColor", "线条颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("borderWidth", "线条粗细", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0.1,
        step: 0.1,
    }),
    createField("borderStyle", "线条样式", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: BORDER_STYLE_OPTIONS,
    }),
    createField("opacity", "透明度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        max: 1,
        step: 0.1,
    }),
], [...BASE_ADVANCED_FIELDS]) as any;
export const RECT_INSPECTOR_SCHEMA = createCommonInspectorSchema([...GEOMETRY_FIELDS], [...BASE_STYLE_FIELDS], [...BASE_ADVANCED_FIELDS]) as any;
export const CIRCLE_INSPECTOR_SCHEMA = createCommonInspectorSchema([...GEOMETRY_FIELDS], [
    createField("opacity", "透明度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        max: 1,
        step: 0.1,
    }),
    createField("backgroundColor", "背景颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("borderColor", "边框颜色", FIELD_SOURCE.STYLE, FIELD_CONTROL.COLOR),
    createField("borderWidth", "边框宽度", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
        min: 0,
        step: 0.1,
    }),
    createField("borderStyle", "边框样式", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
        options: BORDER_STYLE_OPTIONS,
    }),
], [...BASE_ADVANCED_FIELDS]) as any;
export const MULTI_LABEL_INSPECTOR_SCHEMA = createCommonInspectorSchema([
    ...GEOMETRY_FIELDS,
    createField("dataVariable", "数据变量", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT),
    createField("rows", "行数", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, {
        min: 1,
        step: 1,
    }),
    createField("cols", "列数", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, {
        min: 1,
        step: 1,
    }),
    createField("gapX", "水平间距", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, {
        min: 0,
        step: 0.1,
    }),
    createField("gapY", "垂直间距", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, {
        min: 0,
        step: 0.1,
    }),
    createField("direction", "填充方式", FIELD_SOURCE.PROPS, FIELD_CONTROL.SELECT, {
        options: MULTI_LABEL_DIRECTION_OPTIONS,
    }),
], [...BASE_TEXT_STYLE_FIELDS, ...BASE_STYLE_FIELDS], [...BASE_ADVANCED_FIELDS]) as any;
patchSchemaFieldControl(IMAGE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", FIELD_SOURCE.PROPS, "src", FIELD_CONTROL.IMAGE);
removeSchemaField(IMAGE_INSPECTOR_SCHEMA, INSPECTOR_TABS.ADVANCED, "advanced", FIELD_SOURCE.PROPS, "src");
insertSchemaFieldAfter(PAGE_NUMBER_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "rotation", createField("content", "页码示例", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT));
insertSchemaFieldAfter(PAGE_NUMBER_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "content", createField("totalPages", "总页数", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, {
    min: 1,
    step: 1,
}));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "content", createField("variable", "变量绑定", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "format", createField("displayValue", "显示文字", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH));
insertSchemaFieldAfter(QRCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "content", createField("variable", "变量绑定", FIELD_SOURCE.ROOT, FIELD_CONTROL.INPUT));
patchSchemaFieldControl(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", FIELD_SOURCE.PROPS, "columns", FIELD_CONTROL.TABLE_COLUMNS);
patchSchemaFieldControl(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", FIELD_SOURCE.PROPS, "sampleData", FIELD_CONTROL.TABLE_SAMPLE_ROWS);
patchSchemaFieldControl(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.ADVANCED, "advanced", FIELD_SOURCE.PROPS, "footerData", FIELD_CONTROL.TABLE_FOOTER);
insertSchemaFieldAfter(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "footerDataVariable", createField("showHeader", "显示表头", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH));
insertSchemaFieldAfter(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "showHeader", createField("showFooter", "显示表尾", FIELD_SOURCE.PROPS, FIELD_CONTROL.SWITCH));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.STYLE, "style", "backgroundColor", createField("fontFamily", "字体", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
    options: FONT_FAMILY_OPTIONS,
}));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.STYLE, "style", "fontFamily", createField("fontSize", "字号", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
    min: 8,
    max: 48,
    step: 1,
}));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.STYLE, "style", "fontSize", createField("fontWeight", "字重", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
    options: FONT_WEIGHT_OPTIONS,
}));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.STYLE, "style", "fontWeight", createField("letterSpacing", "字间距", FIELD_SOURCE.STYLE, FIELD_CONTROL.NUMBER, {
    step: 0.1,
}));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.STYLE, "style", "letterSpacing", createField("textAlign", "水平对齐", FIELD_SOURCE.STYLE, FIELD_CONTROL.SELECT, {
    options: TEXT_ALIGN_OPTIONS,
}));
insertSchemaFieldAfter(MULTI_LABEL_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "dataVariable", createField("sampleData", "预览数据", FIELD_SOURCE.PROPS, FIELD_CONTROL.MULTI_LABEL_ITEMS, {
    valueType: "json",
    rows: 8,
}));
removeSchemaField(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.ADVANCED, "advanced", FIELD_SOURCE.PROPS, "displayValue");
removeSchemaField(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.ADVANCED, "advanced", FIELD_SOURCE.PROPS, "showHeader");
removeSchemaField(TABLE_INSPECTOR_SCHEMA, INSPECTOR_TABS.ADVANCED, "advanced", FIELD_SOURCE.PROPS, "showFooter");
insertSchemaFieldAfter(IMAGE_INSPECTOR_SCHEMA, INSPECTOR_TABS.STYLE, "style", "objectFit", createField("objectPosition", "图片定位", FIELD_SOURCE.STYLE, FIELD_CONTROL.INPUT));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "displayValue", createField("margin", "留白", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, { min: 0, max: 40, step: 0.5 }));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "margin", createField("textMargin", "文字间距", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, { min: 0, max: 40, step: 0.5 }));
insertSchemaFieldAfter(BARCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "textMargin", createField("textFontSize", "文字字号", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, { min: 6, max: 72, step: 1 }));
insertSchemaFieldAfter(QRCODE_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "eccLevel", createField("margin", "留白", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, { min: 0, max: 40, step: 0.5 }));
insertSchemaFieldAfter(MULTI_LABEL_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "dataVariable", createField("primaryPath", "主字段路径", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT));
insertSchemaFieldAfter(MULTI_LABEL_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "primaryPath", createField("secondaryPath", "副字段路径", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT));
insertSchemaFieldAfter(MULTI_LABEL_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "secondaryPath", createField("tertiaryPath", "第三字段路径", FIELD_SOURCE.PROPS, FIELD_CONTROL.INPUT));
insertSchemaFieldAfter(MULTI_LABEL_INSPECTOR_SCHEMA, INSPECTOR_TABS.PROPERTY, "property", "tertiaryPath", createField("cellPadding", "单元格内边距", FIELD_SOURCE.PROPS, FIELD_CONTROL.NUMBER, { min: 0, max: 40, step: 0.5 }));
