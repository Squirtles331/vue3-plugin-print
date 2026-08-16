function numberValue(value: any): any {
    const numeric = Number(value) as any;
    return Number.isFinite(numeric) ? numeric : 0;
}
export function calculateTableSummary(rows: any = []): any {
    return (Array.isArray(rows) ? rows : []).reduce((summary: any, row: any): any => ({
        totalQty: summary.totalQty + numberValue(row?.qty),
        totalAmount: summary.totalAmount + numberValue(row?.total),
    }), { totalQty: 0, totalAmount: 0 });
}
export function digitUppercase(value: any): any {
    const fraction: any = ["角", "分"] as any;
    const digit: any = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"] as any;
    const unit: any = [
        ["元", "万", "亿"],
        ["", "拾", "佰", "仟"],
    ] as any;
    let amount = Math.abs(numberValue(value)) as any;
    let result = "" as any;
    for (let index = 0 as any; index < fraction.length; index += 1) {
        result += (digit[Math.floor(amount * 10 * 10 ** index) % 10] + fraction[index]).replace(/零./, "");
    }
    result = result || "整";
    amount = Math.floor(amount);
    for (let unitIndex = 0 as any; unitIndex < unit[0].length && amount > 0; unitIndex += 1) {
        let part = "" as any;
        for (let digitIndex = 0 as any; digitIndex < unit[1].length && amount > 0; digitIndex += 1) {
            part = digit[amount % 10] + unit[1][digitIndex] + part;
            amount = Math.floor(amount / 10);
        }
        result = part.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][unitIndex] + result;
    }
    return result.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整");
}
function authoredCellValue(value: any): any {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        if (value.result != null && value.result !== "") {
            return String(value.result);
        }
        if (typeof value.field === "string" && value.field) {
            return value.field;
        }
        if (value.value != null && value.value !== "") {
            return String(value.value);
        }
    }
    return value == null ? "" : String(value);
}
export function formatTableSummaryCell(value: any, { pageRows = [], totalRows = pageRows }: any = {}): any {
    const source = authoredCellValue(value) as any;
    if (!source.includes("{#")) {
        return source;
    }
    const page = calculateTableSummary(pageRows) as any;
    const total = calculateTableSummary(totalRows) as any;
    return source
        .replaceAll("{#pageQty}", String(page.totalQty))
        .replaceAll("{#totalQty}", String(total.totalQty))
        .replaceAll("{#pageSum}", page.totalAmount.toFixed(2))
        .replaceAll("{#totalSum}", total.totalAmount.toFixed(2))
        .replaceAll("{#totalCap}", digitUppercase(total.totalAmount));
}
