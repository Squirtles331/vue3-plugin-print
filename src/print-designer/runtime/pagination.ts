import { shouldRenderTableCell, tableCellRowSpan, tableRowHeight } from "../core/tableModel.js";
function availableTableBodyHeight(element) {
    const props = element.props || {};
    const tableHeight = Math.max(1, Number(element.height) || 1);
    const header = props.showHeader === false ? 0 : Math.max(0, Number(props.headerHeight) || 0);
    const footer = props.showFooter === false ? 0 : Math.max(0, Number(props.footerHeight) || 0);
    return Math.max(1, tableHeight - header - footer);
}
function rowHeight(element, index) {
    return Math.max(1, Number(tableRowHeight(element.props, "body", index)) || 8);
}
function mergedGroupEnd(rows, startIndex) {
    let end = startIndex;
    for (let rowIndex = startIndex; rowIndex <= end && rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex];
        Object.values(row && typeof row === "object" ? row : {}).forEach((cell) => {
            if (!shouldRenderTableCell(cell))
                return;
            end = Math.max(end, rowIndex + tableCellRowSpan(cell) - 1);
        });
    }
    return Math.min(rows.length - 1, end);
}
function tableRowFragments(element) {
    const rows = element.runtime?.table?.rows || [];
    if (!rows.length)
        return [[]];
    const availableHeight = availableTableBodyHeight(element);
    const fragments = [];
    let start = 0;
    while (start < rows.length) {
        let end = start - 1;
        let usedHeight = 0;
        while (end + 1 < rows.length) {
            const groupStart = end + 1;
            const groupEnd = mergedGroupEnd(rows, groupStart);
            let groupHeight = 0;
            for (let index = groupStart; index <= groupEnd; index += 1)
                groupHeight += rowHeight(element, index);
            if (end >= start && usedHeight + groupHeight > availableHeight)
                break;
            end = groupEnd;
            usedHeight += groupHeight;
            if (usedHeight >= availableHeight)
                break;
        }
        if (end < start)
            end = mergedGroupEnd(rows, start);
        fragments.push(rows.slice(start, end + 1));
        start = end + 1;
    }
    return fragments;
}
function tablePageCount(element) {
    if (element.type !== "table" || element.props?.autoPaginate === false)
        return 1;
    return Math.max(1, tableRowFragments(element).length);
}
function fragmentElement(element, fragmentIndex) {
    if (element.type !== "table") {
        return fragmentIndex === 0 || element.repeatPerPage === true ? element : null;
    }
    if (element.props?.autoPaginate === false) {
        return fragmentIndex === 0 || element.repeatPerPage === true ? element : null;
    }
    const table = element.runtime?.table || { rows: [], footerRows: [] };
    const fragments = tableRowFragments(element);
    const rows = fragments[fragmentIndex];
    if (!rows)
        return null;
    const rowOffset = fragments.slice(0, fragmentIndex).reduce((count, fragment) => count + fragment.length, 0);
    return {
        ...element,
        runtime: {
            ...element.runtime,
            table: {
                ...table,
                rows,
                rowOffset,
                allRows: table.allRows || table.rows,
                footerRows: fragmentIndex > 0 && element.props?.tfootRepeat === false ? [] : table.footerRows,
            },
        },
    };
}
export function paginateRuntimeDocument(document) {
    if (!document)
        return { pages: [], pageCount: 0 };
    const pages = [];
    (document.pages || []).forEach((page) => {
        const count = Math.max(1, ...(page.elements || []).map(tablePageCount));
        for (let fragmentIndex = 0; fragmentIndex < count; fragmentIndex += 1) {
            pages.push({
                ...page,
                id: `${page.id}--${fragmentIndex + 1}`,
                sourcePageId: page.id,
                elements: (page.elements || []).map((element) => fragmentElement(element, fragmentIndex)).filter(Boolean),
            });
        }
    });
    const pageCount = pages.length;
    return {
        pageCount,
        pages: pages.map((page, index) => ({ ...page, runtime: { pageNumber: index + 1, pageCount } })),
    };
}
