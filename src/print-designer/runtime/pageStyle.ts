export function createRuntimePageStyle(template: any): any {
    const pageSettings = template?.pageSettings || {} as any;
    const paper = pageSettings.paper || {} as any;
    const margin = pageSettings.margin || {} as any;
    return {
        width: `${paper.widthMm || 210}mm`,
        minHeight: `${paper.heightMm || 297}mm`,
        background: pageSettings.background || "#ffffff",
        "--runtime-margin-top": `${margin.top || 0}mm`,
        "--runtime-margin-right": `${margin.right || 0}mm`,
        "--runtime-margin-bottom": `${margin.bottom || 0}mm`,
        "--runtime-margin-left": `${margin.left || 0}mm`,
    };
}
export function hasRuntimePrintMarks(template: any): any {
    return template?.pageSettings?.printMarks?.visible === true;
}
