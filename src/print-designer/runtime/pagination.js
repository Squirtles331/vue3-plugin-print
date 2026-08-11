function rowsPerPage(element) {
  const props = element.props || {};
  const tableHeight = Math.max(1, Number(element.height) || 1);
  const header = props.showHeader === false ? 0 : Math.max(0, Number(props.headerHeight) || 0);
  const footer = props.showFooter === false ? 0 : Math.max(0, Number(props.footerHeight) || 0);
  const rowHeight = Math.max(1, Number(props.rowHeight) || 8);
  return Math.max(1, Math.floor((tableHeight - header - footer) / rowHeight));
}

function tablePageCount(element) {
  if (element.type !== "table" || element.props?.autoPaginate === false) {
    return 1;
  }

  const count = element.runtime?.table?.rows?.length || 0;
  return Math.max(1, Math.ceil(count / rowsPerPage(element)));
}

function fragmentElement(element, fragmentIndex) {
  if (element.type !== "table") {
    return fragmentIndex === 0 || element.repeatPerPage === true ? element : null;
  }

  if (fragmentIndex > 0 && element.props?.autoPaginate === false) {
    return element.repeatPerPage === true ? element : null;
  }

  const capacity = rowsPerPage(element);
  const table = element.runtime?.table || { rows: [], footerRows: [] };
  const allRows = table.allRows || table.rows;
  const start = fragmentIndex * capacity;
  const rows = table.rows.slice(start, start + capacity);
  if (fragmentIndex > 0 && !rows.length) {
    return null;
  }
  return {
    ...element,
    runtime: {
      ...element.runtime,
      table: {
        ...table,
        rows,
        allRows,
        footerRows: fragmentIndex > 0 && element.props?.tfootRepeat === false ? [] : table.footerRows,
      },
    },
  };
}

export function paginateRuntimeDocument(document) {
  if (!document) {
    return { pages: [], pageCount: 0 };
  }

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
    pages: pages.map((page, index) => ({
      ...page,
      runtime: { pageNumber: index + 1, pageCount },
    })),
  };
}
