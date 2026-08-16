export const PAPER_SIZE_PRESETS = [
    {
        group: "常用",
        options: [
            { key: "A4", label: "A4", widthMm: 210, heightMm: 297, recommended: true },
            { key: "RECEIPT_80", label: "Receipt 80mm", widthMm: 80, heightMm: 200, continuous: true, recommended: true },
            { key: "EXPRESS_100_150", label: "100 × 150 mm", widthMm: 100, heightMm: 150, recommended: true },
        ],
    },
    {
        group: "办公纸",
        options: [
            { key: "A3", label: "A3", widthMm: 297, heightMm: 420 },
            { key: "A4_OFFICE", label: "A4", widthMm: 210, heightMm: 297 },
            { key: "A5", label: "A5", widthMm: 148, heightMm: 210 },
            { key: "A6", label: "A6", widthMm: 105, heightMm: 148 },
            { key: "A7", label: "A7", widthMm: 74, heightMm: 105 },
            { key: "A8", label: "A8", widthMm: 52, heightMm: 74 },
            { key: "LETTER", label: "LETTER", widthMm: 216, heightMm: 279 },
            { key: "LEGAL", label: "LEGAL", widthMm: 216, heightMm: 356 },
            { key: "TABLOID", label: "TABLOID / LEDGER", widthMm: 279, heightMm: 432 },
            { key: "EXECUTIVE", label: "EXECUTIVE", widthMm: 184, heightMm: 267 },
        ],
    },
    {
        group: "票据纸",
        options: [
            { key: "RECEIPT_58", label: "Receipt 58mm", widthMm: 58, heightMm: 180, continuous: true },
            { key: "RECEIPT_80_LIST", label: "Receipt 80mm", widthMm: 80, heightMm: 200, continuous: true },
            { key: "RECEIPT_110", label: "Receipt 110mm", widthMm: 110, heightMm: 240, continuous: true },
        ],
    },
    {
        group: "标签纸",
        options: [
            { key: "241_1", label: "241-1（整张）", widthMm: 241, heightMm: 279 },
            { key: "241_2", label: "241-2（半张）", widthMm: 241, heightMm: 140 },
            { key: "241_3", label: "241-3（三等分）", widthMm: 241, heightMm: 93 },
            { key: "LABEL_100_100", label: "100 × 100 mm", widthMm: 100, heightMm: 100 },
            { key: "LABEL_80_80", label: "80 × 80 mm", widthMm: 80, heightMm: 80 },
            { key: "LABEL_70_50", label: "70 × 50 mm", widthMm: 70, heightMm: 50 },
            { key: "LABEL_60_40", label: "60 × 40 mm", widthMm: 60, heightMm: 40 },
            { key: "LABEL_50_25", label: "50 × 25 mm", widthMm: 50, heightMm: 25 },
            { key: "LABEL_40_30", label: "40 × 30 mm", widthMm: 40, heightMm: 30 },
            { key: "LABEL_30_20", label: "30 × 20 mm", widthMm: 30, heightMm: 20 },
        ],
    },
] as any;
export const CUSTOM_PAPER_SIZE_KEY = "CUSTOM" as any;
export const PAPER_SIZE_MAP = Object.fromEntries(PAPER_SIZE_PRESETS.flatMap((group: any): any => group.options.map((option: any): any => [
    option.key,
    {
        ...option,
        group: group.group,
    },
]))) as any;
export function getPaperPreset(key: any): any {
    return PAPER_SIZE_MAP[key] || null;
}
