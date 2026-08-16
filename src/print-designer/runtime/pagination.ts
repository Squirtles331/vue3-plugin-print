import { shouldRenderTableCell, tableCellRowSpan, tableRowHeight } from "../core/tableModel.js";
function availableTableBodyHeight(element: any): any {
    const props = element.props || {} as any;
    const tableHeight = Math.max(1, Number(element.height) || 1) as any;
    const header = props.showHeader === false ? 0 : Math.max(0, Number(props.headerHeight) || 0) as any;
    const footer = props.showFooter === false ? 0 : Math.max(0, Number(props.footerHeight) || 0) as any;
    return Math.max(1, tableHeight - header - footer);
}
function rowHeight(element: any, index: any): any {
    return Math.max(1, Number(tableRowHeight(element.props, "body", index)) || 8);
}
function mergedGroupEnd(rows: any, startIndex: any): any {
    let end = startIndex as any;
    for (let rowIndex = startIndex as any; rowIndex <= end && rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex] as any;
        Object.values(row && typeof row === "object" ? row : {}).forEach((cell: any): any => {
            if (!shouldRenderTableCell(cell))
                return;
            end = Math.max(end, rowIndex + tableCellRowSpan(cell) - 1);
        });
    }
    return Math.min(rows.length - 1, end);
}
function tableRowFragments(element: any): any {
    const rows = element.runtime?.table?.rows || [] as any;
    if (!rows.length)
        return [[]];
    const availableHeight = availableTableBodyHeight(element) as any;
    const fragments = [] as any;
    let start = 0 as any;
    while (start < rows.length) {
        let end = start - 1 as any;
        let usedHeight = 0 as any;
        while (end + 1 < rows.length) {
            const groupStart = end + 1 as any;
            const groupEnd = mergedGroupEnd(rows, groupStart) as any;
            let groupHeight = 0 as any;
            for (let index = groupStart as any; index <= groupEnd; index += 1)
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
function tablePageCount(element: any): any {
    if (element.type !== "table" || element.props?.autoPaginate === false)
        return 1;
    return Math.max(1, tableRowFragments(element).length);
}
function fragmentElement(element: any, fragmentIndex: any): any {
    if (element.type !== "table") {
        return fragmentIndex === 0 || element.repeatPerPage === true ? element : null;
    }
    if (element.props?.autoPaginate === false) {
        return fragmentIndex === 0 || element.repeatPerPage === true ? element : null;
    }
    const table = element.runtime?.table || { rows: [], footerRows: [] } as any;
    const fragments = tableRowFragments(element) as any;
    const rows = fragments[fragmentIndex] as any;
    if (!rows)
        return null;
    const rowOffset = fragments.slice(0, fragmentIndex).reduce((count: any, fragment: any): any => count + fragment.length, 0) as any;
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
export function paginateRuntimeDocument(document: any): any {
    if (!document)
        return { pages: [], pageCount: 0 };
    const pages = [] as any;
    (document.pages || []).forEach((page: any): any => {
        const count = Math.max(1, ...(page.elements || []).map(tablePageCount)) as any;
        for (let fragmentIndex = 0 as any; fragmentIndex < count; fragmentIndex += 1) {
            pages.push({
                ...page,
                id: `${page.id}--${fragmentIndex + 1}`,
                sourcePageId: page.id,
                elements: (page.elements || []).map((element: any): any => fragmentElement(element, fragmentIndex)).filter(Boolean),
            });
        }
    });
    const pageCount = pages.length as any;
    return {
        pageCount,
        pages: pages.map((page: any, index: any): any => ({ ...page, runtime: { pageNumber: index + 1, pageCount } })),
    };
}
