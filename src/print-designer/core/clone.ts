/**
 * 通用工具：深拷贝、唯一 id 生成
 * 深拷贝优先用原生 structuredClone，降级为 JSON 方案
 */
// 唯一 id：类型前缀 + 时间戳 + 随机串，便于调试识别
export function createId(prefix = 'el'): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${rand}`
}
// 深拷贝：模板 JSON 场景（纯数据，无函数/DOM）
export function cloneDeep<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    }
    catch (e) {
      // 含不可克隆内容时降级
    }
  }
  return JSON.parse(JSON.stringify(value)) as T
}
// 深合并：source 覆盖 target（对象递归，数组整体替换）
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const out: Record<string, unknown> = cloneDeep(target)
  if (!isRecord(source))
    return out as T
  Object.entries(source).forEach(([key, sourceValue]) => {
    const targetValue = out[key]
    out[key] = isRecord(sourceValue) && isRecord(targetValue)
      ? deepMerge(targetValue, sourceValue)
      : Array.isArray(sourceValue) ? cloneDeep(sourceValue) : sourceValue
  })
  return out as T
}
