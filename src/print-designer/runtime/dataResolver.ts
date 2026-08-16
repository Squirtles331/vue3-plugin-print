function clone(value) {
  const rawValue = toRaw(value)
  if (typeof structuredClone === 'function') {
    return structuredClone(rawValue)
  }
  return JSON.parse(JSON.stringify(rawValue))
}
function normalizePath(path) {
  return String(path || '')
    .trim()
    .replace(/^@/, '')
    .replace(/\[(?:"([^"]+)"|'([^']+)'|(\d+))\]/g, (_, quoted, singleQuoted, numericIndex) => `.${quoted || singleQuoted || numericIndex}`)
    .replace(/^\.+|\.+$/g, '')
}
export function resolveDataPath(data, path) {
  const normalized = normalizePath(path)
  if (!normalized) {
    return { found: false, value: undefined, path: normalized }
  }
  let current = data
  for (const segment of normalized.split('.')) {
    if (!segment || current == null || !Object.hasOwn(new Object(current), segment)) {
      return { found: false, value: undefined, path: normalized }
    }
    current = current[segment]
  }
  return { found: true, value: current, path: normalized }
}
export function bindingToken(path) {
  return `{{${String(path || '').replace(/^@/, '')}}}`
}
function resolveElementValue(element, runtimeData) {
  if (element.variable) {
    const result = resolveDataPath(runtimeData, element.variable)
    return result.found
      ? { value: result.value == null ? '' : String(result.value), status: 'resolved', path: result.path }
      : { value: bindingToken(element.variable), status: 'missing', path: result.path }
  }
  const authoredValue = element.type === 'image' ? element.props?.src || element.content : element.content
  return {
    value: authoredValue == null ? '' : String(authoredValue),
    status: authoredValue == null || authoredValue === '' ? 'empty' : 'authored',
    path: '',
  }
}
function resolveTableColumns(props) {
  return Array.isArray(props.columns) ? props.columns : []
}
function resolveCollection(props, variableKey, dataKey, runtimeData) {
  const variable = props[variableKey]
  if (variable) {
    const result = resolveDataPath(runtimeData, variable)
    return {
      value: result.found && Array.isArray(result.value) ? result.value : [],
      status: result.found && Array.isArray(result.value) ? 'resolved' : 'missing',
      path: result.path,
    }
  }
  return {
    value: Array.isArray(props[dataKey]) ? props[dataKey] : [],
    status: Array.isArray(props[dataKey]) && props[dataKey].length ? 'authored' : 'empty',
    path: '',
  }
}
export function applyConstrainedTableTransform(rows, transform) {
  const source = Array.isArray(rows) ? [...rows] : []
  if (!transform || (typeof transform === 'object' && !Array.isArray(transform) && Object.keys(transform).length === 0)) {
    return { rows: source, issues: [] }
  }
  if (!transform || typeof transform !== 'object') {
    return { rows: source, issues: [{ message: 'Table transform must be a declarative object.', severity: 'error' }] }
  }
  if (transform.type === 'sort' && typeof transform.by === 'string') {
    const direction = transform.direction === 'desc' ? -1 : 1
    return {
      rows: source.sort((left, right) => String(left?.[transform.by] ?? '').localeCompare(String(right?.[transform.by] ?? '')) * direction),
      issues: [],
    }
  }
  if (transform.type === 'filterEquals' && typeof transform.by === 'string') {
    return {
      rows: source.filter(row => row?.[transform.by] === transform.value),
      issues: [],
    }
  }
  return {
    rows: source,
    issues: [{ code: 'invalid-table-transform', message: `Unsupported table transform: ${transform.type || 'unknown'}.`, severity: 'error' }],
  }
}
function resolveTable(element, runtimeData) {
  const props = element.props || {}
  const data = resolveCollection(props, 'dataVariable', 'sampleData', runtimeData)
  const footer = resolveCollection(props, 'footerDataVariable', 'footerData', runtimeData)
  const transformed = applyConstrainedTableTransform(data.value, props.transform)
  const issues = [...transformed.issues]
  if (props.customScript) {
    issues.push({
      code: 'disabled-table-script',
      message: 'Custom table scripts are disabled at runtime. Use the declarative transform configuration instead.',
      severity: 'error',
    })
  }
  return {
    columns: resolveTableColumns(props),
    rows: transformed.rows,
    footerRows: footer.value,
    dataStatus: data.status,
    dataPath: data.path,
    footerStatus: footer.status,
    footerPath: footer.path,
    issues,
  }
}
function resolveMultiLabel(element, runtimeData) {
  const props = element.props || {}
  const result = resolveCollection(props, 'dataVariable', 'sampleData', runtimeData)
  return {
    rows: result.value,
    status: result.status,
    path: result.path,
  }
}
export function resolveRuntimeTemplate(document, runtimeData = {}) {
  const input = document && typeof document === 'object' ? clone(document) : null
  if (!input) {
    return { document: null, issues: [{ path: 'document', message: 'A template document is required.', severity: 'error' }] }
  }
  const issues = []
  const pages = (input.pages || []).map((page, pageIndex) => ({
    ...page,
    elements: (page.elements || []).map((element, elementIndex) => {
      const next = { ...element, runtime: {} }
      if (['text', 'image', 'barcode', 'qrcode'].includes(element.type)) {
        next.runtime.value = resolveElementValue(element, runtimeData)
        if (next.runtime.value.status === 'missing') {
          issues.push({
            code: 'missing-binding',
            path: `pages[${pageIndex}].elements[${elementIndex}].variable`,
            elementId: element.id,
            binding: next.runtime.value.path,
            message: `Missing binding value: ${bindingToken(next.runtime.value.path)}`,
            severity: 'warning',
          })
        }
      }
      if (element.type === 'table') {
        next.runtime.table = resolveTable(element, runtimeData)
        next.runtime.table.issues.forEach(issue => issues.push({ ...issue, path: `element:${element.id}` }))
        if (next.runtime.table.dataStatus === 'missing') {
          issues.push({
            code: 'missing-table-data',
            path: `pages[${pageIndex}].elements[${elementIndex}].props.dataVariable`,
            elementId: element.id,
            binding: next.runtime.table.dataPath,
            message: `Missing table data: ${bindingToken(next.runtime.table.dataPath)}`,
            severity: 'warning',
          })
        }
        if (next.runtime.table.footerStatus === 'missing') {
          issues.push({
            code: 'missing-table-footer-data',
            path: `pages[${pageIndex}].elements[${elementIndex}].props.footerDataVariable`,
            elementId: element.id,
            binding: next.runtime.table.footerPath,
            message: `Missing table footer data: ${bindingToken(next.runtime.table.footerPath)}`,
            severity: 'warning',
          })
        }
      }
      if (element.type === 'multiLabel') {
        next.runtime.multiLabel = resolveMultiLabel(element, runtimeData)
        if (next.runtime.multiLabel.status === 'missing') {
          issues.push({
            code: 'missing-label-data',
            path: `pages[${pageIndex}].elements[${elementIndex}].props.dataVariable`,
            elementId: element.id,
            binding: next.runtime.multiLabel.path,
            message: `Missing label data: ${bindingToken(next.runtime.multiLabel.path)}`,
            severity: 'warning',
          })
        }
      }
      return next
    }),
  }))
  return { document: { ...input, pages }, issues }
}
