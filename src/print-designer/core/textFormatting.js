export const TEXT_PRESET_OPTIONS = [
  { label: "标题", value: "title" },
  { label: "正文", value: "body" },
  { label: "标签", value: "label" },
  { label: "标签值", value: "labelValue" },
  { label: "金额", value: "amount" },
  { label: "备注", value: "note" },
];

export const FONT_FAMILY_OPTIONS = [
  { label: "默认", value: "" },
  { label: "Microsoft YaHei", value: "Microsoft YaHei" },
  { label: "SimSun", value: "SimSun" },
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times New Roman" },
];

export const FONT_SIZE_OPTIONS = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

export const LINE_HEIGHT_OPTIONS = [1, 1.2, 1.4, 1.6, 1.8, 2];

export const TEXT_PRESET_DEFINITIONS = {
  title: {
    style: {
      fontSize: 18,
      fontWeight: "bold",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#111827",
      textAlign: "center",
      verticalAlign: "middle",
      lineHeight: 1.4,
      letterSpacing: 0,
      backgroundColor: "transparent",
    },
    props: {
      whiteSpace: "nowrap",
      writingMode: "horizontal-tb",
    },
  },
  body: {
    style: {
      fontSize: 12,
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#111827",
      textAlign: "left",
      verticalAlign: "top",
      lineHeight: 1.4,
      letterSpacing: 0,
      backgroundColor: "transparent",
    },
    props: {
      whiteSpace: "pre-wrap",
      writingMode: "horizontal-tb",
    },
  },
  label: {
    style: {
      fontSize: 11,
      fontWeight: "bold",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#374151",
      textAlign: "left",
      verticalAlign: "middle",
      lineHeight: 1.3,
      letterSpacing: 0,
      backgroundColor: "transparent",
    },
    props: {
      whiteSpace: "nowrap",
      writingMode: "horizontal-tb",
    },
  },
  labelValue: {
    style: {
      fontSize: 12,
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#111827",
      textAlign: "left",
      verticalAlign: "middle",
      lineHeight: 1.4,
      letterSpacing: 0,
      backgroundColor: "transparent",
    },
    props: {
      whiteSpace: "pre-wrap",
      writingMode: "horizontal-tb",
    },
  },
  amount: {
    style: {
      fontSize: 14,
      fontWeight: "bold",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#111827",
      textAlign: "right",
      verticalAlign: "middle",
      lineHeight: 1.2,
      letterSpacing: 0,
      backgroundColor: "transparent",
    },
    props: {
      whiteSpace: "nowrap",
      writingMode: "horizontal-tb",
    },
  },
  note: {
    style: {
      fontSize: 10,
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#6b7280",
      textAlign: "left",
      verticalAlign: "top",
      lineHeight: 1.5,
      letterSpacing: 0,
      backgroundColor: "transparent",
    },
    props: {
      whiteSpace: "pre-wrap",
      writingMode: "horizontal-tb",
    },
  },
};

export function getTextPresetDefinition(preset) {
  return TEXT_PRESET_DEFINITIONS[preset] || null;
}
