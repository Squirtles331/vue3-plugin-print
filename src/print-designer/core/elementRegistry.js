import { BARCODE_FORMATS, ElementType, PAGE_NUMBER_FORMATS, QRCODE_ECC_LEVELS } from "./constants";
import {
  BARCODE_INSPECTOR_SCHEMA,
  CIRCLE_INSPECTOR_SCHEMA,
  IMAGE_INSPECTOR_SCHEMA,
  LINE_INSPECTOR_SCHEMA,
  MULTI_LABEL_INSPECTOR_SCHEMA,
  PAGE_NUMBER_INSPECTOR_SCHEMA,
  QRCODE_INSPECTOR_SCHEMA,
  RECT_INSPECTOR_SCHEMA,
  TABLE_INSPECTOR_SCHEMA,
  TEXT_INSPECTOR_SCHEMA,
} from "./elementInspectorSchemas";

const DEFAULT_TABLE_SCRIPT = `// RMB Uppercase Conversion
try {
  function digitUppercase(n) {
    var fraction = ["角", "分"];
    var digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    var unit = [
      ["元", "万", "亿"],
      ["", "拾", "佰", "仟"],
    ];
    var head = n < 0 ? "欠" : "";
    n = Math.abs(n);
    var s = "";
    for (var i = 0; i < fraction.length; i += 1) {
      s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, "");
    }
    s = s || "整";
    n = Math.floor(n);
    for (var unitIndex = 0; unitIndex < unit[0].length && n > 0; unitIndex += 1) {
      var p = "";
      for (var j = 0; j < unit[1].length && n > 0; j += 1) {
        p = digit[n % 10] + unit[1][j] + p;
        n = Math.floor(n / 10);
      }
      s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][unitIndex] + s;
    }
    return head + s.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整");
  }

  let totalAmount = 0;
  let totalQty = 0;

  if (data && Array.isArray(data)) {
    data.forEach((row) => {
      totalAmount += Number(row.total) || 0;
      totalQty += Number(row.qty) || 0;
    });
  }

  function replaceFooterToken(value) {
    if (typeof value !== "string") {
      return value;
    }

    if (type === "page") {
      return value
        .replace("{#pageSum}", totalAmount.toFixed(2))
        .replace("{#pageQty}", String(totalQty));
    }

    return value
      .replace("{#pageSum}", totalAmount.toFixed(2))
      .replace("{#pageQty}", String(totalQty))
      .replace("{#totalSum}", totalAmount.toFixed(2))
      .replace("{#totalQty}", String(totalQty))
      .replace("{#totalCap}", digitUppercase(totalAmount));
  }

  if (footerData && Array.isArray(footerData)) {
    footerData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const cell = row[key];

        if (cell && typeof cell === "object") {
          if (typeof cell.field === "string") {
            cell.result = replaceFooterToken(cell.field);
          } else if (typeof cell.value === "string" && cell.value.includes("{#")) {
            cell.result = replaceFooterToken(cell.value);
          }
          return;
        }

        row[key] = replaceFooterToken(cell);
      });
    });
  }

  return { data, footerData };
} catch (error) {
  console.error("Table script execution error:", error);
  return { data, footerData };
}`;

function formatTableAmount(value) {
  return Number(value || 0).toFixed(2);
}

function digitUppercase(value) {
  const fraction = ["角", "分"];
  const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const unit = [
    ["元", "万", "亿"],
    ["", "拾", "佰", "仟"],
  ];

  let amount = Math.abs(Number(value) || 0);
  let result = "";

  for (let i = 0; i < fraction.length; i += 1) {
    result += (digit[Math.floor(amount * 10 * 10 ** i) % 10] + fraction[i]).replace(/零./, "");
  }

  result = result || "整";
  amount = Math.floor(amount);

  for (let i = 0; i < unit[0].length && amount > 0; i += 1) {
    let part = "";

    for (let j = 0; j < unit[1].length && amount > 0; j += 1) {
      part = digit[amount % 10] + unit[1][j] + part;
      amount = Math.floor(amount / 10);
    }

    result = part.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + result;
  }

  return result.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整");
}

function defaultTableColumns() {
  return [
    { key: "id", title: "ID", width: 107.3, align: "center" },
    { key: "name", title: "名称", width: 214.59, align: "left" },
    { key: "qty", title: "数量", width: 128.76, align: "right" },
    { key: "price", title: "单价", width: 171.68, align: "right" },
    { key: "total", title: "合计", width: 171.68, align: "right" },
  ];
}

function defaultTableData(rows = 30) {
  const list = [];

  for (let i = 1; i <= rows; i += 1) {
    const qty = ((i - 1) % 5) + 1;
    const price = 100 + (i - 1) * 10;
    list.push({ id: i, name: `商品 ${i}`, qty, price, total: qty * price });
  }

  return list;
}

function defaultTableFooterData(rows) {
  const totalQty = rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
  const totalAmount = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

  return [
    {
      id: { value: "本页合计" },
      name: "",
      qty: {
        value: "",
        field: "{#pageQty}",
        result: String(totalQty),
        printValue: "{#pageQty}",
      },
      price: "",
      total: {
        value: "",
        field: "{#pageSum}",
        result: formatTableAmount(totalAmount),
        printValue: "{#pageSum}",
      },
    },
    {
      id: { value: "总计" },
      name: "",
      qty: {
        value: "",
        field: "{#totalQty}",
        result: String(totalQty),
        printValue: "{#totalQty}",
      },
      price: "",
      total: {
        value: "",
        field: "{#totalSum}",
        result: formatTableAmount(totalAmount),
        printValue: "{#totalSum}",
      },
    },
    {
      id: { value: "大写金额" },
      name: "",
      qty: "",
      price: "",
      total: {
        value: "",
        field: "{#totalCap}",
        result: digitUppercase(totalAmount),
        printValue: "{#totalCap}",
      },
    },
  ];
}

function defaultMultiLabelData(rows = 5, cols = 3) {
  const total = Math.max(1, rows * cols);

  return Array.from({ length: total }, (_, index) => ({
    title: `标签 ${index + 1}`,
    code: `NO-${String(index + 1).padStart(3, "0")}`,
    detail: "示例数据",
  }));
}

export const ELEMENT_DEFINITIONS = {
  [ElementType.TEXT]: {
    label: "文本",
    createDefaults: () => ({
      width: 40,
      height: 10,
      content: "",
      props: {
        autoHeight: false,
        whiteSpace: "pre-wrap",
        writingMode: "horizontal-tb",
      },
    }),
    renderer: "text",
    inspectorSchema: TEXT_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.IMAGE]: {
    label: "图片",
    createDefaults: () => ({
      width: 36,
      height: 24,
      content: "",
      props: {
        src: "",
        placeholder: "",
        keepAspectRatio: true,
      },
      style: {
        objectFit: "contain",
      },
    }),
    renderer: "image",
    inspectorSchema: IMAGE_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.TABLE]: {
    label: "表格",
    createDefaults: () => {
      const sampleData = [];

      return {
        width: 180,
        height: 100,
        props: {
          columns: defaultTableColumns(),
          sampleData,
          footerData: [],
          columnsVariable: "",
          dataVariable: "",
          footerDataVariable: "",
          customScriptVariable: "",
          autoPaginate: true,
          tfootRepeat: true,
          showHeader: true,
          showFooter: false,
          designOmitRows: true,
          designRowCount: 10,
          headerHeight: 10,
          rowHeight: 8,
          footerHeight: 10,
          embeddedCellTextPosition: "overlap",
          embeddedCellTextLayer: "below",
          repeatPerPage: false,
          customScript: "",
        },
        style: {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "transparent",
          borderColor: "#000000",
          borderWidth: 1,
          headerBackgroundColor: "#f3f4f6",
          headerColor: "#000000",
          headerFontSize: 14,
          footerBackgroundColor: "#f9fafb",
          footerColor: "#000000",
          footerFontSize: 14,
          textAlign: "left",
          headerTextAlign: "left",
          footerTextAlign: "left",
          fontStyle: "normal",
          lineHeight: 1.45,
          padding: 1.2,
        },
      };
    },
    renderer: "table",
    inspectorSchema: TABLE_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.PAGE_NUMBER]: {
    label: "页码",
    createDefaults: () => ({
      width: 12,
      height: 8,
      content: "",
      props: {
        format: PAGE_NUMBER_FORMATS[0],
        totalPages: 1,
      },
      style: {
        textAlign: "center",
      },
    }),
    renderer: "pageNumber",
    inspectorSchema: PAGE_NUMBER_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.BARCODE]: {
    label: "条码",
    createDefaults: () => ({
      width: 45,
      height: 16,
      content: "",
      props: {
        format: BARCODE_FORMATS[0],
        displayValue: true,
      },
    }),
    renderer: "barcode",
    inspectorSchema: BARCODE_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.QRCODE]: {
    label: "二维码",
    createDefaults: () => ({
      width: 22,
      height: 22,
      content: "",
      props: {
        eccLevel: QRCODE_ECC_LEVELS[1],
      },
    }),
    renderer: "qrcode",
    inspectorSchema: QRCODE_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.LINE]: {
    label: "线条",
    createDefaults: () => ({
      width: 40,
      height: 1,
      style: {
        borderWidth: 1,
        borderColor: "#000000",
      },
      props: {},
    }),
    renderer: "line",
    inspectorSchema: LINE_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.RECT]: {
    label: "矩形",
    createDefaults: () => ({
      width: 24,
      height: 18,
      style: {
        borderWidth: 1,
        borderColor: "#000000",
        backgroundColor: "transparent",
      },
      props: {},
    }),
    renderer: "rect",
    inspectorSchema: RECT_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.CIRCLE]: {
    label: "圆形",
    createDefaults: () => ({
      width: 20,
      height: 20,
      style: {
        borderWidth: 1,
        borderColor: "#000000",
        backgroundColor: "transparent",
        borderRadius: 999,
      },
      props: {},
    }),
    renderer: "circle",
    inspectorSchema: CIRCLE_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },

  [ElementType.MULTI_LABEL]: {
    label: "多标签",
    createDefaults: () => ({
      width: 90,
      height: 50,
      props: {
        rows: 5,
        cols: 3,
        gapX: 12,
        gapY: 12,
        direction: "row",
        dataVariable: "",
        sampleData: [],
      },
    }),
    renderer: "multiLabel",
    inspectorSchema: MULTI_LABEL_INSPECTOR_SCHEMA,
    interactionPolicy: "box",
  },
};

export const ELEMENT_PALETTE = Object.entries(ELEMENT_DEFINITIONS).map(([type, definition]) => ({
  type,
  label: definition.label,
}));

export function getElementDefinition(type) {
  return ELEMENT_DEFINITIONS[type] || null;
}

export function isElementType(type) {
  return Boolean(getElementDefinition(type));
}
