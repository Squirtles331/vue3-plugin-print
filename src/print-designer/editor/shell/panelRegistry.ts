export const resourcePanelItems = [
    { key: "pages", label: "页面", title: "页面管理" },
    { key: "insert", label: "插入", title: "插入元素" },
    { key: "layers", label: "图层", title: "图层列表" },
    { key: "data", label: "数据", title: "数据字段" },
] as any;
export const inspectorPanelItems = [
    { key: "page", label: "页面", title: "页面设置" },
    { key: "view", label: "视图", title: "视图偏好" },
    { key: "structure", label: "结构", title: "结构视图" },
    { key: "bindings", label: "绑定", title: "数据绑定" },
] as any;
export function getPanelItem(items: any, key: any): any {
    return items.find((item: any): any => item.key === key) || items[0];
}
