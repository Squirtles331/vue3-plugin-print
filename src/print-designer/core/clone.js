/**
 * 通用工具：深拷贝、唯一 id 生成
 * 深拷贝优先用原生 structuredClone，降级为 JSON 方案
 */

// 唯一 id：类型前缀 + 时间戳 + 随机串，便于调试识别
export function createId(prefix = "el") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

// 深拷贝：模板 JSON 场景（纯数据，无函数/DOM）
export function cloneDeep(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (e) {
      // 含不可克隆内容时降级
    }
  }
  return JSON.parse(JSON.stringify(value));
}

// 深合并：source 覆盖 target（对象递归，数组整体替换）
export function deepMerge(target, source) {
  const out = cloneDeep(target) || {};
  if (!source || typeof source !== "object") {
    return out;
  }
  Object.keys(source).forEach((key) => {
    const sv = source[key];
    const tv = out[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      out[key] = deepMerge(tv, sv);
    } else {
      out[key] = Array.isArray(sv) ? cloneDeep(sv) : sv;
    }
  });
  return out;
}
