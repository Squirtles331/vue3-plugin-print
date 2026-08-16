<template>
  <div class="element-properties-panel" :class="{ 'element-properties-panel--table': isTableObject }">
    <section v-if="isMultipleSelection" class="element-properties-panel__multi">
      <header class="element-properties-panel__summary">
        <div class="element-properties-panel__summary-head">
          <strong>已选中 {{ multipleSelectedObjects.length }} 个元素</strong>
          <span class="element-properties-panel__type-tag">批量编辑</span>
        </div>
        <p class="element-properties-panel__summary-hint">仅显示所有已选元素共享的基础属性；数据绑定和元素专属配置请单独编辑。</p>
      </header>
      <section class="element-properties-panel__section">
        <header class="element-properties-panel__section-head"><h3>显示与输出</h3></header>
        <div class="element-properties-panel__section-body is-stack">
          <PdSwitch :model-value="multipleBooleanValue('visible', true)" active-text="显示" inactive-text="隐藏" @change="setMultipleRootValue('visible', !!$event)" />
          <PdSwitch :model-value="multipleBooleanValue('printable', true)" active-text="打印" inactive-text="不打印" @change="setMultipleRootValue('printable', !!$event)" />
          <PdSwitch :model-value="multipleBooleanValue('locked', false)" active-text="锁定" inactive-text="可编辑" @change="setMultipleRootValue('locked', !!$event)" />
        </div>
      </section>
      <section class="element-properties-panel__section">
        <header class="element-properties-panel__section-head"><h3>位置、尺寸与层级</h3></header>
        <div class="element-properties-panel__section-body is-grid-2">
          <label class="element-properties-panel__field">
            <span>X (mm)</span>
            <PdInputNumber :model-value="multipleRootValue('x', 0)" :step="0.1" controls-position="right" @change="setMultipleRootValue('x', numberValue($event))" />
          </label>
          <label class="element-properties-panel__field">
            <span>Y (mm)</span>
            <PdInputNumber :model-value="multipleRootValue('y', 0)" :step="0.1" controls-position="right" @change="setMultipleRootValue('y', numberValue($event))" />
          </label>
          <label class="element-properties-panel__field">
            <span>宽 (mm)</span>
            <PdInputNumber :model-value="multipleRootValue('width', 1)" :min="0.1" :step="0.1" controls-position="right" @change="setMultipleRootValue('width', numberValue($event))" />
          </label>
          <label class="element-properties-panel__field">
            <span>高 (mm)</span>
            <PdInputNumber :model-value="multipleRootValue('height', 1)" :min="0.1" :step="0.1" controls-position="right" @change="setMultipleRootValue('height', numberValue($event))" />
          </label>
          <div class="element-properties-panel__field">
            <span>层级</span>
            <div class="element-properties-panel__action-grid">
              <button type="button" class="element-properties-panel__section-button" @click="reorderMultipleSelection('front')">置于顶层</button>
              <button type="button" class="element-properties-panel__section-button" @click="reorderMultipleSelection('back')">置于底层</button>
            </div>
          </div>
        </div>
      </section>
      <section class="element-properties-panel__section">
        <header class="element-properties-panel__section-head"><h3>通用样式</h3></header>
        <div class="element-properties-panel__section-body is-grid-2">
          <label class="element-properties-panel__field">
            <span>透明度</span>
            <PdInputNumber :model-value="multipleStyleValue('opacity', 1)" :min="0" :max="1" :step="0.1" controls-position="right" @change="setMultipleStyleValue('opacity', numberValue($event))" />
          </label>
          <label class="element-properties-panel__field">
            <span>背景颜色</span>
            <input type="color" :value="multipleStyleValue('backgroundColor', '#ffffff')" @input="setMultipleStyleValue('backgroundColor', ($event.target as HTMLInputElement).value)" />
          </label>
          <label class="element-properties-panel__field">
            <span>边框颜色</span>
            <input type="color" :value="multipleStyleValue('borderColor', '#000000')" @input="setMultipleStyleValue('borderColor', ($event.target as HTMLInputElement).value)" />
          </label>
          <label class="element-properties-panel__field">
            <span>边框宽度</span>
            <PdInputNumber :model-value="multipleStyleValue('borderWidth', 0)" :min="0" :step="0.1" controls-position="right" @change="setMultipleStyleValue('borderWidth', numberValue($event))" />
          </label>
        </div>
      </section>
    </section>

    <InspectorEmpty
      v-else-if="!selectedObject"
      title="未选中元素"
      description="选中元素后，这里会显示位置、样式、绑定和运行时属性。页面级设置请到右侧页面设置。"
    />

    <template v-else-if="isTableObject">
      <section class="element-properties-panel__summary">
        <div class="element-properties-panel__summary-head">
          <PdInput
            :model-value="selectedObject.name"
            placeholder="元素名称"
            @input="setRootValue('name', $event)"
          />
          <span class="element-properties-panel__type-tag">{{ typeLabel }}</span>
        </div>

        <div class="element-properties-panel__summary-meta">
          <span>X {{ displayNumber(selectedObject.x) }}</span>
          <span>Y {{ displayNumber(selectedObject.y) }}</span>
          <span>W {{ displayNumber(selectedObject.width) }}</span>
          <span>H {{ displayNumber(selectedObject.height) }}</span>
          <span>状态 {{ selectedObject.locked ? "已锁定" : "可编辑" }}</span>
        </div>

        <p class="element-properties-panel__summary-hint">{{ panelHint }}</p>
      </section>

      <nav class="element-properties-panel__tabs" aria-label="属性分组">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="element-properties-panel__tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tabLabel(tab.key) }}
        </button>
      </nav>

      <div class="element-properties-panel__sections element-properties-panel__sections--table">
        <template v-if="activeTab === INSPECTOR_TABS.PROPERTY">
          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>位置与尺寸</h3>
            </header>
            <div class="element-properties-panel__section-body is-grid-2">
              <label class="element-properties-panel__field">
                <span>X (mm)</span>
                <PdInputNumber
                  :model-value="numberValue(selectedObject.x)"
                  controls-position="right"
                  @change="setRootValue('x', numberValue($event))"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>Y (mm)</span>
                <PdInputNumber
                  :model-value="numberValue(selectedObject.y)"
                  controls-position="right"
                  @change="setRootValue('y', numberValue($event))"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>宽度 (mm)</span>
                <PdInputNumber
                  :model-value="numberValue(selectedObject.width)"
                  :min="0"
                  controls-position="right"
                  @change="setRootValue('width', numberValue($event))"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>高度 (mm)</span>
                <PdInputNumber
                  :model-value="numberValue(selectedObject.height)"
                  :min="0"
                  controls-position="right"
                  @change="setRootValue('height', numberValue($event))"
                />
              </label>
            </div>
          </section>

          <section v-if="selectedTableCells.length" class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>已选 {{ selectedTableCells.length }} 个{{ selectedTableSection === 'footer' ? '表脚' : '正文' }}单元格</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <div class="element-properties-panel__action-grid">
                <button type="button" class="element-properties-panel__section-button" :disabled="selectedObject.locked" @click="mergeSelectedTableCells">
                  合并单元格
                </button>
                <button type="button" class="element-properties-panel__section-button" :disabled="selectedObject.locked" @click="splitSelectedTableCells">
                  拆分单元格
                </button>
                <button type="button" class="element-properties-panel__section-button" :disabled="selectedObject.locked" @click="insertSelectedTableRow">
                  插入行
                </button>
                <button type="button" class="element-properties-panel__section-button" :disabled="selectedObject.locked" @click="removeSelectedTableRows">
                  删除行
                </button>
                <button type="button" class="element-properties-panel__section-button" :disabled="selectedObject.locked" @click="insertSelectedTableColumn">
                  插入列
                </button>
                <button type="button" class="element-properties-panel__section-button" :disabled="selectedObject.locked" @click="removeSelectedTableColumns">
                  删除列
                </button>
              </div>
              <template v-if="selectedTableSection === 'footer'">
                <label class="element-properties-panel__field">
                  <span>表脚静态文本</span>
                  <PdInput
                    :model-value="selectedTableCellTextValue()"
                    :disabled="selectedObject.locked"
                    @change="updateSelectedFooterText($event)"
                  />
                </label>
                <label class="element-properties-panel__field element-properties-panel__field--switch">
                  <span>汇总当前列</span>
                  <PdSwitch
                    :model-value="selectedTableCellHasCurrentColumnSummary()"
                    :disabled="selectedObject.locked"
                    @change="setSelectedFooterSummary(!!$event)"
                  />
                </label>
              </template>
              <div class="element-properties-panel__section-body is-grid-2">
                <label class="element-properties-panel__field">
                  <span>背景</span>
                  <input
                    class="element-properties-panel__color"
                    type="color"
                    :value="selectedTableCellStyleValue('backgroundColor', '#ffffff')"
                    :disabled="selectedObject.locked"
                    @input="applySelectedTableCellStyle({ backgroundColor: ($event.target as HTMLInputElement).value })"
                  />
                </label>
                <label class="element-properties-panel__field">
                  <span>文字</span>
                  <input
                    class="element-properties-panel__color"
                    type="color"
                    :value="selectedTableCellStyleValue('color', '#111827')"
                    :disabled="selectedObject.locked"
                    @input="applySelectedTableCellStyle({ color: ($event.target as HTMLInputElement).value })"
                  />
                </label>
                <label class="element-properties-panel__field">
                  <span>字号 (px)</span>
                  <PdInputNumber
                    :model-value="selectedTableCellNumberStyleValue('fontSize')"
                    :min="1"
                    controls-position="right"
                    :disabled="selectedObject.locked"
                    @change="applySelectedTableCellStyle({ fontSize: Math.max(1, numberValue($event)) + 'px' })"
                  />
                </label>
                <label class="element-properties-panel__field">
                  <span>对齐</span>
                  <PdSelect
                    :model-value="selectedTableCellStyleValue('textAlign', 'left')"
                    :disabled="selectedObject.locked"
                    @change="applySelectedTableCellStyle({ textAlign: $event })"
                  >
                    <PdOption v-for="option in TABLE_TEXT_ALIGN_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
                  </PdSelect>
                </label>
              </div>
              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>加粗</span>
                <PdSwitch
                  :model-value="selectedTableCellStyleValue('fontWeight') === 'bold'"
                  :disabled="selectedObject.locked"
                  @change="applySelectedTableCellStyle({ fontWeight: $event ? 'bold' : 'normal' })"
                />
              </label>
            </div>
          </section>

          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>层级</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field">
                <span>层级</span>
                <PdInputNumber
                  :model-value="numberValue(selectedObject.zIndex)"
                  controls-position="right"
                  @change="setRootValue('zIndex', numberValue($event))"
                />
              </label>
              <div class="element-properties-panel__action-grid">
                <button
                  type="button"
                  class="element-properties-panel__section-button"
                  @click="reorderSelectedObject('bringForward')"
                >
                  上移一层
                </button>
                <button
                  type="button"
                  class="element-properties-panel__section-button"
                  @click="reorderSelectedObject('sendBackward')"
                >
                  下移一层
                </button>
                <button
                  type="button"
                  class="element-properties-panel__section-button"
                  @click="reorderSelectedObject('bringToFront')"
                >
                  置于顶层
                </button>
                <button
                  type="button"
                  class="element-properties-panel__section-button"
                  @click="reorderSelectedObject('sendToBack')"
                >
                  置于底层
                </button>
              </div>
            </div>
          </section>

          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>数据绑定</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>自动分页</span>
                <PdSwitch
                  :model-value="!!tablePropValue('autoPaginate', true)"
                  @change="setTablePropValue('autoPaginate', !!$event)"
                />
              </label>
              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>重复表脚</span>
                <PdSwitch
                  :model-value="!!tablePropValue('tfootRepeat', true)"
                  @change="setTablePropValue('tfootRepeat', !!$event)"
                />
              </label>
              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>显示表头</span>
                <PdSwitch
                  :model-value="!!tablePropValue('showHeader', true)"
                  @change="setTablePropValue('showHeader', !!$event)"
                />
              </label>
              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>显示表脚</span>
                <PdSwitch
                  :model-value="!!tablePropValue('showFooter', true)"
                  @change="setTablePropValue('showFooter', !!$event)"
                />
              </label>
              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>设计行省略</span>
                <PdSwitch
                  :model-value="!!tableEditorHintValue('omitRows', true)"
                  @change="setTableEditorHintValue('omitRows', !!$event)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>设计行数</span>
                <PdInputNumber
                  :model-value="tableDesignRowCountValue()"
                  :min="1"
                  controls-position="right"
                  @change="setTableEditorHintValue('rowCount', Math.max(1, numberValue($event) || 1))"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>数据变量</span>
                <PdInput
                  :model-value="tableStringPropValue('dataVariable')"
                  placeholder="@dataVariable"
                  @input="setTablePropValue('dataVariable', $event)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>表脚数据变量</span>
                <PdInput
                  :model-value="tableStringPropValue('footerDataVariable')"
                  placeholder="@footerDataVariable"
                  @input="setTablePropValue('footerDataVariable', $event)"
                />
              </label>
              <p class="element-properties-panel__field-help">仅支持受限 JSON 配置，不支持任意 JavaScript。</p>

              <div class="element-properties-panel__code-card">
                <div class="element-properties-panel__code-card-head">
                  <span>列配置</span>
                  <div class="element-properties-panel__code-card-actions">
                    <strong>JSON</strong>
                    <button
                      type="button"
                      class="element-properties-panel__mini-button"
                      @click="openTableEditor('columns', '列定义', 'json')"
                    >
                      打开编辑器
                    </button>
                  </div>
                </div>
                <pre class="element-properties-panel__code-preview">{{ tableEditorPreview("columns") }}</pre>
              </div>

              <div class="element-properties-panel__code-card">
                <div class="element-properties-panel__code-card-head">
                  <span>示例数据</span>
                  <div class="element-properties-panel__code-card-actions">
                    <strong>JSON</strong>
                    <button
                      type="button"
                      class="element-properties-panel__mini-button"
                      @click="openTableEditor('sampleData', '数据', 'json')"
                    >
                      打开编辑器
                    </button>
                  </div>
                </div>
                <pre class="element-properties-panel__code-preview">{{ tableEditorPreview("sampleData") }}</pre>
              </div>

              <div class="element-properties-panel__code-card">
                <div class="element-properties-panel__code-card-head">
                  <span>页脚数据</span>
                  <div class="element-properties-panel__code-card-actions">
                    <strong>JSON</strong>
                    <button
                      type="button"
                      class="element-properties-panel__mini-button"
                      @click="openTableEditor('footerData', '表脚数据', 'json')"
                    >
                      打开编辑器
                    </button>
                  </div>
                </div>
                <pre class="element-properties-panel__code-preview">{{ tableEditorPreview("footerData") }}</pre>
              </div>

              <div class="element-properties-panel__code-card">
                <div class="element-properties-panel__code-card-head">
                  <span>转换规则</span>
                  <div class="element-properties-panel__code-card-actions">
                    <strong>JSON</strong>
                    <button
                      type="button"
                      class="element-properties-panel__mini-button"
                      @click="openTableEditor('transform', '数据转换', 'json')"
                    >
                      打开编辑器
                    </button>
                  </div>
                </div>
                <pre class="element-properties-panel__code-preview">{{ tableEditorPreview("transform") }}</pre>
              </div>

              <label class="element-properties-panel__field element-properties-panel__field--switch">
                <span>是否打印</span>
                <PdSwitch
                  :model-value="selectedObject.printable !== false"
                  @change="setRootValue('printable', !!$event)"
                />
              </label>
            </div>
          </section>
        </template>

        <template v-else-if="activeTab === INSPECTOR_TABS.STYLE">
          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>表格尺寸</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field">
                <span>表头高度 (mm)</span>
                <PdInputNumber
                  :model-value="tableNumberPropValue('headerHeight')"
                  :min="0"
                  controls-position="right"
                  @change="setTablePropValue('headerHeight', numberValue($event))"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>行高 (mm)</span>
                <PdInputNumber
                  :model-value="tableNumberPropValue('rowHeight')"
                  :min="0"
                  controls-position="right"
                  @change="setTablePropValue('rowHeight', numberValue($event))"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>表脚高度 (mm)</span>
                <PdInputNumber
                  :model-value="tableNumberPropValue('footerHeight')"
                  :min="0"
                  controls-position="right"
                  @change="setTablePropValue('footerHeight', numberValue($event))"
                />
              </label>
            </div>
          </section>

          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>基础样式</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field">
                <span>背景颜色</span>
                <div class="element-properties-panel__color-row">
                  <input
                    class="element-properties-panel__color"
                    type="color"
                    :value="colorFieldValue({ source: 'style', key: 'backgroundColor' })"
                    @input="setTableStyleValue('backgroundColor', ($event.target as HTMLInputElement).value)"
                  />
                  <button type="button" class="element-properties-panel__mini-button" @click="setTableStyleValue('backgroundColor', 'transparent')">
                    清空
                  </button>
                </div>
              </label>
              <label class="element-properties-panel__field">
                <span>文本颜色</span>
                <input
                  class="element-properties-panel__color"
                  type="color"
                  :value="colorFieldValue({ source: 'style', key: 'color' })"
                  @input="setTableStyleValue('color', ($event.target as HTMLInputElement).value)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>字号 (mm)</span>
                <PdInputNumber
                  :model-value="tableFontSizeMmValue('fontSize')"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
                  @change="setTableFontSizeMmValue('fontSize', $event)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>对齐方式</span>
                <PdSelect
                  :model-value="tableStringStyleValue('textAlign', 'left')"
                  @change="setTableStyleValue('textAlign', $event)"
                >
                  <PdOption v-for="option in TABLE_TEXT_ALIGN_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
                </PdSelect>
              </label>
            </div>
          </section>

          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>表头</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field">
                <span>背景</span>
                <div class="element-properties-panel__color-row">
                  <input
                    class="element-properties-panel__color"
                    type="color"
                    :value="colorFieldValue({ source: 'style', key: 'headerBackgroundColor' })"
                    @input="setTableStyleValue('headerBackgroundColor', ($event.target as HTMLInputElement).value)"
                  />
                  <button type="button" class="element-properties-panel__mini-button" @click="setTableStyleValue('headerBackgroundColor', '#f3f4f6')">
                    重置
                  </button>
                </div>
              </label>
              <label class="element-properties-panel__field">
                <span>文本颜色</span>
                <input
                  class="element-properties-panel__color"
                  type="color"
                  :value="colorFieldValue({ source: 'style', key: 'headerColor' })"
                  @input="setTableStyleValue('headerColor', ($event.target as HTMLInputElement).value)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>字号</span>
                <PdInputNumber
                  :model-value="tableFontSizeMmValue('headerFontSize', 'fontSize')"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
                  @change="setTableFontSizeMmValue('headerFontSize', $event, 'fontSize')"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>对齐方式</span>
                <PdSelect
                  :model-value="tableStringStyleValue('headerTextAlign', 'left')"
                  @change="setTableStyleValue('headerTextAlign', $event)"
                >
                  <PdOption v-for="option in TABLE_TEXT_ALIGN_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
                </PdSelect>
              </label>
            </div>
          </section>

          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>表脚</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field">
                <span>背景</span>
                <div class="element-properties-panel__color-row">
                  <input
                    class="element-properties-panel__color"
                    type="color"
                    :value="colorFieldValue({ source: 'style', key: 'footerBackgroundColor' })"
                    @input="setTableStyleValue('footerBackgroundColor', ($event.target as HTMLInputElement).value)"
                  />
                  <button type="button" class="element-properties-panel__mini-button" @click="setTableStyleValue('footerBackgroundColor', '#f9fafb')">
                    重置
                  </button>
                </div>
              </label>
              <label class="element-properties-panel__field">
                <span>文本颜色</span>
                <input
                  class="element-properties-panel__color"
                  type="color"
                  :value="colorFieldValue({ source: 'style', key: 'footerColor' })"
                  @input="setTableStyleValue('footerColor', ($event.target as HTMLInputElement).value)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>字号</span>
                <PdInputNumber
                  :model-value="tableFontSizeMmValue('footerFontSize', 'fontSize')"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
                  @change="setTableFontSizeMmValue('footerFontSize', $event, 'fontSize')"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>对齐方式</span>
                <PdSelect
                  :model-value="tableStringStyleValue('footerTextAlign', 'left')"
                  @change="setTableStyleValue('footerTextAlign', $event)"
                >
                  <PdOption v-for="option in TABLE_TEXT_ALIGN_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
                </PdSelect>
              </label>
            </div>
          </section>

          <section class="element-properties-panel__section">
            <header class="element-properties-panel__section-head">
              <h3>边框</h3>
            </header>
            <div class="element-properties-panel__section-body is-stack">
              <label class="element-properties-panel__field">
                <span>边框样式</span>
                <PdSelect
                  :model-value="tableStringStyleValue('borderStyle', 'solid')"
                  @change="setTableStyleValue('borderStyle', $event)"
                >
                  <PdOption v-for="option in TABLE_BORDER_STYLE_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
                </PdSelect>
              </label>
              <label class="element-properties-panel__field">
                <span>边框宽度 (mm)</span>
                <PdInputNumber
                  :model-value="tableBorderWidthMmValue()"
                  :min="0"
                  :step="0.1"
                  controls-position="right"
                  @change="setTableBorderWidthMmValue($event)"
                />
              </label>
              <label class="element-properties-panel__field">
                <span>边框颜色</span>
                <input
                  class="element-properties-panel__color"
                  type="color"
                  :value="colorFieldValue({ source: 'style', key: 'borderColor' })"
                  @input="setTableStyleValue('borderColor', ($event.target as HTMLInputElement).value)"
                />
              </label>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="element-properties-panel__section">
            <div class="element-properties-panel__advanced-card">
              <header class="element-properties-panel__section-head">
                <h3>元素信息</h3>
              </header>
              <label class="element-properties-panel__field">
                <span>ID</span>
                <div class="element-properties-panel__copy-field">
                  <div class="element-properties-panel__readonly">
                    {{ selectedObject.id }}
                  </div>
                  <button type="button" class="element-properties-panel__mini-button" @click="copySelectedObjectId">
                    复制
                  </button>
                </div>
              </label>
              <label class="element-properties-panel__field">
                <span>类型</span>
                <div class="element-properties-panel__readonly">{{ typeLabel }}</div>
              </label>
            </div>
          </section>

          <div class="element-properties-panel__button-list">
            <button type="button" class="element-properties-panel__section-button" @click="runFieldAction('saveAsTemplate')">
              保存为自定义元素
            </button>
            <button
              type="button"
              class="element-properties-panel__section-button is-danger"
              @click="runFieldAction('deleteElement')"
            >
              删除当前元素
            </button>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <section class="element-properties-panel__summary">
        <div class="element-properties-panel__summary-head">
          <PdInput
            :model-value="selectedObject.name"
            placeholder="元素名称"
            @input="setRootValue('name', $event)"
          />
          <span class="element-properties-panel__type-tag">{{ typeLabel }}</span>
        </div>

        <div class="element-properties-panel__summary-meta">
          <span>X {{ displayNumber(selectedObject.x) }}</span>
          <span>Y {{ displayNumber(selectedObject.y) }}</span>
          <span>W {{ displayNumber(selectedObject.width) }}</span>
          <span>H {{ displayNumber(selectedObject.height) }}</span>
          <span>状态 {{ selectedObject.locked ? "已锁定" : "可编辑" }}</span>
        </div>

        <p class="element-properties-panel__summary-hint">{{ panelHint }}</p>
      </section>

      <template v-if="selectedSchema">
        <nav class="element-properties-panel__tabs" aria-label="属性分组">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="element-properties-panel__tab"
            :class="{ 'is-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tabLabel(tab.key) }}
          </button>
        </nav>

        <div class="element-properties-panel__sections">
          <section
            v-for="section in activeSections"
            :key="section.key"
            class="element-properties-panel__section"
          >
            <header class="element-properties-panel__section-head">
              <h3>{{ section.label }}</h3>
            </header>

            <div
              class="element-properties-panel__section-body"
              :class="sectionLayoutClass(section.layout)"
            >
              <template v-for="field in section.fields" :key="`${activeTab}-${section.key}-${field.source}-${field.key}`">
                <label
                  v-if="!isStructuredField(field)"
                  class="element-properties-panel__field"
                  :class="{ 'is-readonly': field.control === FIELD_CONTROL.READONLY }"
                >
                  <span>{{ field.label }}</span>

                  <PdInput
                    v-if="field.control === FIELD_CONTROL.INPUT"
                    :model-value="stringFieldValue(field)"
                    @input="setFieldValue(field, $event)"
                  />

                  <PdInput
                    v-else-if="field.control === FIELD_CONTROL.TEXTAREA"
                    type="textarea"
                    :rows="textareaRows(field)"
                    :model-value="stringFieldValue(field)"
                    @input="setFieldValue(field, $event)"
                  />

                  <PdInput
                    v-else-if="field.control === FIELD_CONTROL.CODE"
                    type="textarea"
                    :rows="textareaRows(field)"
                    :model-value="codeFieldValue(field)"
                    class="element-properties-panel__code-input"
                    @change="setFieldValue(field, $event)"
                  />

                  <PdInputNumber
                    v-else-if="field.control === FIELD_CONTROL.NUMBER"
                    :model-value="numberFieldValue(field)"
                    :min="field.min"
                    :max="field.max"
                    :step="field.step || 1"
                    controls-position="right"
                    @change="setFieldValue(field, numberValue($event))"
                  />

                  <PdSelect
                    v-else-if="field.control === FIELD_CONTROL.SELECT"
                    :model-value="selectFieldValue(field)"
                    @change="setFieldValue(field, $event)"
                  >
                    <PdOption
                      v-for="option in field.options || []"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </PdSelect>

                  <PdSwitch
                    v-else-if="field.control === FIELD_CONTROL.SWITCH"
                    :model-value="!!getFieldValue(field)"
                    @change="setFieldValue(field, !!$event)"
                  />

                  <input
                    v-else-if="field.control === FIELD_CONTROL.COLOR"
                    class="element-properties-panel__color"
                    type="color"
                    :value="colorFieldValue(field)"
                    @input="setFieldValue(field, ($event.target as HTMLInputElement).value)"
                  />

                  <div v-else-if="field.control === FIELD_CONTROL.IMAGE" class="element-properties-panel__image-field">
                    <PdInput
                      :model-value="stringFieldValue(field)"
                      :placeholder="imageFieldPlaceholder(field)"
                      @input="setFieldValue(field, $event)"
                    />
                    <template v-if="field.key === 'src'">
                      <button
                        type="button"
                        class="element-properties-panel__section-button element-properties-panel__upload-button"
                        @click="triggerImageUpload(field)"
                      >
                        上传图片
                      </button>
                      <input
                        :ref="(el) => setImageInputRef(fieldIdentifier(field), el)"
                        class="element-properties-panel__file-input"
                        type="file"
                        accept="image/*"
                        @change="onImageFileChange(field, $event)"
                      />
                      <div class="element-properties-panel__field-help">
                        最大 2MB，自动转换为 Base64
                      </div>
                    </template>
                    <div v-if="stringFieldValue(field)" class="element-properties-panel__image-preview">
                      <img :src="stringFieldValue(field)" alt="" />
                    </div>
                  </div>

                  <div v-else-if="field.control === FIELD_CONTROL.READONLY" class="element-properties-panel__readonly">
                    {{ stringFieldValue(field) || "--" }}
                  </div>
                </label>

                <div
                  v-else-if="field.control === FIELD_CONTROL.TABLE_COLUMNS"
                  class="element-properties-panel__table-columns"
                >
                  <div class="element-properties-panel__table-columns-hint">
                    列 `key` 会映射到示例数据和打印数据中的字段名。
                  </div>

                  <div
                    v-for="(column, index) in tableColumnsValue(field)"
                    :key="`${field.key}-${index}-${column.key}`"
                    class="element-properties-panel__table-column-card"
                  >
                    <div class="element-properties-panel__table-column-head">
                      <strong>列 {{ index + 1 }}</strong>
                      <div class="element-properties-panel__table-column-actions">
                        <button
                          type="button"
                          class="element-properties-panel__mini-button"
                          :disabled="index === 0"
                          @click="moveTableColumn(field, index, -1)"
                        >
                          上移
                        </button>
                        <button
                          type="button"
                          class="element-properties-panel__mini-button"
                          :disabled="index === tableColumnsValue(field).length - 1"
                          @click="moveTableColumn(field, index, 1)"
                        >
                          下移
                        </button>
                        <button
                          type="button"
                          class="element-properties-panel__mini-button is-danger"
                          :disabled="tableColumnsValue(field).length <= 1"
                          @click="removeTableColumn(field, index)"
                        >
                          删除
                        </button>
                      </div>
                    </div>

                    <div class="element-properties-panel__table-column-grid">
                      <label class="element-properties-panel__field">
                        <span>标题</span>
                        <PdInput
                          :model-value="column.title"
                          @input="updateTableColumn(field, index, 'title', $event)"
                        />
                      </label>

                      <label class="element-properties-panel__field">
                        <span>字段 key</span>
                        <PdInput
                          :model-value="column.key"
                          @input="updateTableColumn(field, index, 'key', $event)"
                        />
                      </label>

                      <label class="element-properties-panel__field">
                        <span>数据路径</span>
                        <PdInput
                          :model-value="column.valuePath"
                          placeholder="lineItem.amount"
                          @input="updateTableColumn(field, index, 'valuePath', $event)"
                        />
                      </label>

                      <label class="element-properties-panel__field">
                        <span>宽度权重</span>
                        <PdInputNumber
                          :model-value="column.width"
                          :step="1"
                          controls-position="right"
                          @change="updateTableColumn(field, index, 'width', numberValue($event))"
                        />
                      </label>

                      <label class="element-properties-panel__field">
                        <span>对齐方式</span>
                        <PdSelect
                          :model-value="column.align"
                          @change="updateTableColumn(field, index, 'align', $event)"
                        >
                          <PdOption
                            v-for="option in TABLE_ALIGN_OPTIONS"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </PdSelect>
                      </label>

                      <label class="element-properties-panel__field">
                        <span>格式化</span>
                        <PdSelect
                          :model-value="column.formatter?.type || ''"
                          @change="updateTableColumnFormatter(field, index, 'type', $event)"
                        >
                          <PdOption v-for="option in TABLE_FORMATTER_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
                        </PdSelect>
                      </label>

                      <label v-if="column.formatter?.type === 'number' || column.formatter?.type === 'currency'" class="element-properties-panel__field">
                        <span>小数位</span>
                        <PdInputNumber
                          :model-value="Number(column.formatter?.decimals) || 0"
                          :min="0"
                          :max="8"
                          controls-position="right"
                          @change="updateTableColumnFormatter(field, index, 'decimals', Math.max(0, Math.min(8, numberValue($event) || 0)))"
                        />
                      </label>

                      <label v-if="column.formatter?.type === 'currency'" class="element-properties-panel__field">
                        <span>货币符号</span>
                        <PdInput
                          :model-value="column.formatter?.symbol || ''"
                          @input="updateTableColumnFormatter(field, index, 'symbol', $event)"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="element-properties-panel__section-button"
                    @click="addTableColumn(field)"
                  >
                    新增列
                  </button>
                </div>

                <div
                  v-else-if="field.control === FIELD_CONTROL.TABLE_SAMPLE_ROWS"
                  class="element-properties-panel__table-rows"
                >
                  <div class="element-properties-panel__table-columns-hint">
                    示例数据用于画布预览，列名需与上方的字段 key 保持对应。
                  </div>

                  <div v-if="tableColumnsValue(tableColumnsField).length" class="element-properties-panel__table-rows-grid">
                    <div class="element-properties-panel__table-rows-head">
                      <span
                        v-for="column in tableColumnsValue(tableColumnsField)"
                        :key="`head-${column.key}`"
                        class="element-properties-panel__table-rows-head-cell"
                      >
                        {{ column.title }}
                        <small>{{ column.key }}</small>
                      </span>
                      <span class="element-properties-panel__table-rows-head-cell is-actions">操作</span>
                    </div>

                    <div
                      v-for="(row, rowIndex) in tableSampleRowsValue(field)"
                      :key="`row-${rowIndex}`"
                      class="element-properties-panel__table-rows-row"
                    >
                      <PdInput
                        v-for="column in tableColumnsValue(tableColumnsField)"
                        :key="`${rowIndex}-${column.key}`"
                        :model-value="tableSampleCellValue(row, column.key)"
                        @input="updateTableSampleCell(field, rowIndex, column.key, $event)"
                      />
                      <button
                        type="button"
                        class="element-properties-panel__mini-button is-danger"
                        @click="removeTableSampleRow(field, rowIndex)"
                      >
                        删除行
                      </button>
                    </div>
                  </div>

                  <div v-else class="element-properties-panel__table-empty-state">
                    先配置表格列，再填写示例数据。
                  </div>

                  <button
                    type="button"
                    class="element-properties-panel__section-button"
                    :disabled="!tableColumnsValue(tableColumnsField).length"
                    @click="addTableSampleRow(field)"
                  >
                    新增示例行
                  </button>
                </div>

                <div
                  v-else-if="field.control === FIELD_CONTROL.TABLE_FOOTER"
                  class="element-properties-panel__table-footer"
                >
                  <div class="element-properties-panel__table-columns-hint">
                    汇总行会按当前列结构写入，预览区会优先显示这里配置的页脚内容。
                  </div>

                  <div v-if="tableColumnsValue(tableColumnsField).length">
                    <div v-if="tableFooterRowsValue(field).length" class="element-properties-panel__table-columns">
                      <div
                        v-for="(row, rowIndex) in tableFooterRowsValue(field)"
                        :key="`footer-row-${rowIndex}`"
                        class="element-properties-panel__table-column-card"
                      >
                        <div class="element-properties-panel__table-column-head">
                          <strong>汇总行 {{ rowIndex + 1 }}</strong>
                          <div class="element-properties-panel__table-column-actions">
                            <button
                              type="button"
                              class="element-properties-panel__mini-button is-danger"
                              @click="removeTableFooterRow(field, rowIndex)"
                            >
                              删除
                            </button>
                          </div>
                        </div>

                        <div class="element-properties-panel__table-footer-grid">
                          <label
                            v-for="column in tableColumnsValue(tableColumnsField)"
                            :key="`footer-${rowIndex}-${column.key}`"
                            class="element-properties-panel__field"
                          >
                            <span>{{ column.title }} / {{ column.key }}</span>
                            <PdInput
                              :model-value="tableFooterCellValue(field, rowIndex, column.key)"
                              @input="updateTableFooterCell(field, rowIndex, column.key, $event)"
                            />
                            <div
                              v-if="tableFooterCellToken(field, rowIndex, column.key)"
                              class="element-properties-panel__field-help"
                            >
                              {{ tableFooterCellToken(field, rowIndex, column.key) }}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div v-else class="element-properties-panel__table-empty-state">
                      当前还没有汇总行，点击下方按钮添加。
                    </div>
                  </div>

                  <div v-else class="element-properties-panel__table-empty-state">
                    先配置表格列，再编辑页脚。
                  </div>

                  <div class="element-properties-panel__button-list">
                    <button
                      type="button"
                      class="element-properties-panel__section-button"
                      :disabled="!tableColumnsValue(tableColumnsField).length"
                      @click="addTableFooterRow(field)"
                    >
                      新增汇总行
                    </button>
                    <button
                      type="button"
                      class="element-properties-panel__section-button"
                      :disabled="!tableColumnsValue(tableColumnsField).length"
                      @click="resetTableFooter(field)"
                    >
                      清空页脚
                    </button>
                  </div>
                </div>

                <div
                  v-else-if="field.control === FIELD_CONTROL.MULTI_LABEL_ITEMS"
                  class="element-properties-panel__multi-label-data"
                >
                  <div class="element-properties-panel__table-columns-hint">
                    未填数据时，画布只显示标签网格。
                  </div>

                  <div class="element-properties-panel__multi-label-grid">
                    <div
                      v-for="(item, index) in multiLabelSampleDataValue(field)"
                      :key="`multi-label-${index}`"
                      class="element-properties-panel__multi-label-card"
                    >
                      <div class="element-properties-panel__multi-label-card-head">
                        <strong>标签 {{ index + 1 }}</strong>
                        <span>{{ multiLabelCellCoordinate(index) }}</span>
                      </div>

                      <div class="element-properties-panel__multi-label-card-body">
                        <label class="element-properties-panel__field">
                          <span>主标题</span>
                          <PdInput
                            :model-value="item.title"
                            @input="updateMultiLabelSampleCell(field, index, 'title', $event)"
                          />
                        </label>

                        <label class="element-properties-panel__field">
                          <span>编码</span>
                          <PdInput
                            :model-value="item.code"
                            @input="updateMultiLabelSampleCell(field, index, 'code', $event)"
                          />
                        </label>

                        <label class="element-properties-panel__field">
                          <span>说明</span>
                          <PdInput
                            :model-value="item.detail"
                            @input="updateMultiLabelSampleCell(field, index, 'detail', $event)"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="field.control === FIELD_CONTROL.ACTIONS"
                  class="element-properties-panel__action-grid"
                >
                  <button
                    v-for="action in field.actions || []"
                    :key="action.value"
                    type="button"
                    class="element-properties-panel__action-button"
                    @click="runFieldAction(action.value)"
                  >
                    {{ action.label }}
                  </button>
                </div>

                <div
                  v-else-if="field.control === FIELD_CONTROL.BUTTONS"
                  class="element-properties-panel__button-list"
                >
                  <button
                    v-for="button in field.buttons || []"
                    :key="button.value"
                    type="button"
                    class="element-properties-panel__section-button"
                    :class="{ 'is-danger': button.tone === 'danger' }"
                    @click="runFieldAction(button.value)"
                  >
                    {{ button.label }}
                  </button>
                </div>
                <small v-if="fieldError(field)" class="element-properties-panel__field-error">{{ fieldError(field) }}</small>
              </template>
            </div>
          </section>
        </div>
      </template>

      <section v-else class="element-properties-panel__fallback">
        <strong>该元素类型暂未完全接入结构化属性面板。</strong>
        <p>常用打印元素已经使用统一的“属性 / 样式 / 高级”面板布局。</p>
      </section>
    </template>

    <TableCodeEditorDialog
      :visible="activeTableEditor.visible"
      :title="activeTableEditor.title"
      :language="activeTableEditor.language"
      :model-value="tableEditorDraft(activeTableEditor.key)"
      @update:model-value="updateTableEditorDraft(activeTableEditor.key, $event)"
      @update:visible="activeTableEditor.visible = $event"
      @cancel="closeTableEditor()"
      @save="saveActiveTableEditor"
    />
  </div>
</template>

<script setup lang="ts">import { computed, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { PdMessage, PdMessageBox } from "../../ui/feedback.js";
import PdInput from "../../ui/primitives/PdInput.vue";
import PdInputNumber from "../../ui/primitives/PdInputNumber.vue";
import PdOption from "../../ui/primitives/PdOption.vue";
import PdSelect from "../../ui/primitives/PdSelect.vue";
import PdSwitch from "../../ui/primitives/PdSwitch.vue";
import InspectorEmpty from "../../components/inspector/InspectorEmpty.vue";
import TableCodeEditorDialog from "../components/TableCodeEditorDialog.vue";
import { FIELD_CONTROL, INSPECTOR_TABS, TAB_LABELS, SECTION_LAYOUT } from "../../core/elementInspectorSchemas";
import { getElementDefinition, getElementSizeRule } from "../../core/elementFactory";
import { getElementPropertyCapabilities, validateElementProperty } from "../../core/propertyCapabilities.js";
import { applyTableCellStyle as applyTableCellStylePatch, insertTableColumn as insertTableColumnAt, insertTableRow as insertTableRowAt, mergeTableCells as mergeTableCellsPatch, removeTableColumn as removeTableColumnAt, removeTableRow as removeTableRowAt, renameTableColumn as renameTableColumnPatch, splitTableCell as splitTableCellPatch, tableCellStyle as tableCellStyleValue, tableCellValue as tableCellTextValue, toTableCellDescriptor, updateTableCell as updateTableCellValue, } from "../../core/tableModel.js";
import { MM_TO_CSS_PX } from "../measurement.js";
import { createRemoveObjectsCommand, createUpdateObjectPropsCommand } from "../commands/documentCommands.js";
import { createOrderIds, createOrderTransactionCommand, createPatchTransactionCommand } from "../commands/layoutCommands.js";
import { executeEditorCommand } from "../commands/executeCommand.js";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { createLocalElementPresetRepository } from "../../template/elementPresetRepository.js";
import { fieldErrorKey, getFieldError } from "./fieldErrorState.js";
const documentStore = useEditorDocumentStore() as any;
const historyStore = useEditorHistoryStore() as any;
const selectionStore = useEditorSelectionStore() as any;
const presetRepository = createLocalElementPresetRepository() as any;
const { objectsById } = storeToRefs(documentStore) as any;
const { selectedIds, tableSelection } = storeToRefs(selectionStore) as any;
const activeTab = ref(INSPECTOR_TABS.PROPERTY) as any;
const TABLE_ALIGN_OPTIONS = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
] as any;
const TABLE_TEXT_ALIGN_OPTIONS = [
    { label: "左对齐", value: "left" },
    { label: "居中", value: "center" },
    { label: "右对齐", value: "right" },
] as any;
const TABLE_FORMATTER_OPTIONS = [
    { label: "不格式化", value: "" },
    { label: "数字", value: "number" },
    { label: "货币", value: "currency" },
    { label: "日期", value: "date" },
] as any;
const TABLE_BORDER_STYLE_OPTIONS = [
    { label: "实线", value: "solid" },
    { label: "虚线", value: "dashed" },
    { label: "点线", value: "dotted" },
    { label: "双线", value: "double" },
] as any;
const STRUCTURED_FIELD_CONTROLS = new Set([
    FIELD_CONTROL.TABLE_COLUMNS,
    FIELD_CONTROL.TABLE_SAMPLE_ROWS,
    FIELD_CONTROL.TABLE_FOOTER,
    FIELD_CONTROL.MULTI_LABEL_ITEMS,
    FIELD_CONTROL.ACTIONS,
    FIELD_CONTROL.BUTTONS,
]) as any;
const SQUARE_DIMENSION_TYPES = new Set(["circle", "qrcode"]) as any;
const tableColumnsField = {
    source: "props",
    key: "columns",
    control: FIELD_CONTROL.TABLE_COLUMNS,
} as any;
const selectedObject = computed((): any => {
    if (selectedIds.value.length !== 1) {
        return null;
    }
    const objectId = selectedIds.value[0];
    return objectId ? objectsById.value[objectId] || null : null;
}) as any;
const isMultipleSelection = computed((): any => selectedIds.value.length > 1) as any;
const multipleSelectedObjects = computed((): any => selectedIds.value.map((id: any): any => objectsById.value[id]).filter(Boolean)) as any;
const isTableObject = computed((): any => selectedObject.value?.type === "table") as any;
const selectedTableCells = computed((): any => {
    const selection = tableSelection.value;
    if (!isTableObject.value || selection?.tableId !== selectedObject.value?.id) {
        return [];
    }
    return selection.cells || [];
}) as any;
const selectedTableSection = computed((): any => tableSelection.value?.section === "footer" ? "footer" : "body") as any;
function multipleBooleanValue(key: any, fallback: any): any {
    const values = multipleSelectedObjects.value.map((object: any): any => object[key]);
    return values.length && values.every((value: any): any => value === values[0]) ? values[0] : fallback;
}
function multipleRootValue(key: any, fallback: any): any {
    const values = multipleSelectedObjects.value.map((object: any): any => object[key]);
    return values.length && values.every((value: any): any => value === values[0]) && Number.isFinite(Number(values[0]))
        ? Number(values[0])
        : fallback;
}
function multipleStyleValue(key: any, fallback: any): any {
    const values = multipleSelectedObjects.value.map((object: any): any => object.style?.[key]);
    return values.length && values.every((value: any): any => value === values[0]) && values[0] != null ? values[0] : fallback;
}
function setMultipleRootValue(key: any, value: any): any {
    const patches = multipleSelectedObjects.value
        .filter((object: any): any => !object.locked || key === "locked")
        .map((object: any): any => {
        const rule = getElementSizeRule(object.type);
        const nextValue = key === "width" && rule
            ? Math.min(rule.maxWidth, Math.max(rule.minWidth, Number(value) || rule.minWidth))
            : key === "height" && rule
                ? Math.min(rule.maxHeight, Math.max(rule.minHeight, Number(value) || rule.minHeight))
                : value;
        return { id: object.id, patch: { [key]: nextValue } };
    });
    const command = createPatchTransactionCommand(documentStore, `Update ${key} for selection`, patches);
    if (command) {
        executeEditorCommand(historyStore, command);
    }
}
function setMultipleStyleValue(key: any, value: any): any {
    const patches = multipleSelectedObjects.value
        .filter((object: any): any => !object.locked)
        .map((object: any): any => ({ id: object.id, patch: { style: { ...(object.style || {}), [key]: value } } }));
    const command = createPatchTransactionCommand(documentStore, `Update ${key} for selection`, patches);
    if (command) {
        executeEditorCommand(historyStore, command);
    }
}
function reorderMultipleSelection(action: any): any {
    const pageId = multipleSelectedObjects.value[0]?.pageId;
    if (!pageId || multipleSelectedObjects.value.some((object: any): any => object.pageId !== pageId)) {
        return;
    }
    const nextIds = createOrderIds(documentStore.pageObjectMap[pageId] || [], documentStore.objectsById, selectedIds.value, action);
    const command = createOrderTransactionCommand(documentStore, pageId, nextIds, action === "front" ? "Bring selection to front" : "Send selection to back");
    if (command) {
        executeEditorCommand(historyStore, command);
    }
}
const selectedDefinition = computed((): any => {
    if (!selectedObject.value) {
        return null;
    }
    return getElementDefinition(selectedObject.value.type);
}) as any;
const selectedSchema = computed((): any => selectedDefinition.value?.inspectorSchema || null) as any;
const tabs = computed((): any => selectedSchema.value?.tabs || []) as any;
const activeTabSchema = computed((): any => tabs.value.find((tab: any): any => tab.key === activeTab.value) || null) as any;
const propertyCapabilities = computed((): any => getElementPropertyCapabilities(selectedObject.value?.type).fields) as any;
const activeSections = computed((): any => enrichSections(normalizeSections(activeTabSchema.value?.sections || []), propertyCapabilities.value)) as any;
const fieldErrors = ref({}) as any;
const propertyEditSession = ref(null) as any;
let propertyEditTimer = null as any;
const tableEditorDrafts = ref({
    columns: "",
    sampleData: "",
    footerData: "",
    transform: "",
}) as any;
const activeTableEditor = ref({
    visible: false,
    key: "",
    title: "",
    language: "json",
}) as any;
/*

    const sampleDataField = {
      key: "sampleData",
      label: "示例数据",
      source: "props",
      control: FIELD_CONTROL.MULTI_LABEL_ITEMS,
      valueType: "json",
      rows: 8,
    };

    if (insertAt === -1) {
      nextFields.unshift(sampleDataField);
    } else {
      nextFields.splice(insertAt + 1, 0, sampleDataField);
    }

    return {
      ...section,
      fields: nextFields,
    };
  });
});
*/
const typeLabel = computed((): any => selectedDefinition.value?.label || selectedObject.value?.type || "") as any;
const panelHint = computed((): any => {
    if (!selectedObject.value) {
        return "选中元素后，这里会显示位置、样式、绑定和运行时属性。";
    }
    const label = typeLabel.value || "元素";
    const status = selectedObject.value.locked ? "已锁定，部分字段只读。" : "可直接编辑。";
    return `正在编辑 ${label}。${status}`;
}) as any;
watch(tabs, (nextTabs: any): any => {
    if (!nextTabs.length) {
        activeTab.value = INSPECTOR_TABS.PROPERTY;
        return;
    }
    const hasCurrent = nextTabs.some((tab: any): any => tab.key === activeTab.value);
    if (!hasCurrent) {
        activeTab.value = nextTabs[0].key;
    }
}, { immediate: true });
watch((): any => selectedObject.value?.id, (): any => {
    fieldErrors.value = {};
    endPropertyEditSession();
});
watch(selectedIds, (): any => {
    endPropertyEditSession();
});
watch((): any => [
    selectedObject.value?.id || "",
    selectedObject.value?.props?.columns,
    selectedObject.value?.props?.sampleData,
    selectedObject.value?.props?.footerData,
    selectedObject.value?.props?.transform,
], (): any => {
    if (!isTableObject.value) {
        tableEditorDrafts.value = {
            columns: "",
            sampleData: "",
            footerData: "",
            transform: "",
        };
        return;
    }
    tableEditorDrafts.value = {
        columns: tableJsonPropValue("columns"),
        sampleData: tableJsonPropValue("sampleData"),
        footerData: tableJsonPropValue("footerData"),
        transform: tableJsonPropValue("transform"),
    };
}, { immediate: true, deep: true });
function tabLabel(tab: any): any {
    return TAB_LABELS[tab] || tab;
}
function fieldControl(field: any): any {
    if (!field) {
        return "";
    }
    return field.control || "";
}
function normalizeField(field: any): any {
    return {
        ...field,
        control: fieldControl(field),
    };
}
function normalizeSection(section: any): any {
    return {
        ...section,
        fields: (section.fields || []).map(normalizeField),
    };
}
function normalizeSections(sections: any): any {
    return regroupSections(sections.map(normalizeSection));
}
function enrichSections(sections: any, capabilities: any): any {
    return sections.map((section: any): any => ({
        ...section,
        fields: section.fields.map((field: any): any => {
            const capability = capabilities.find((item: any): any => item.source === field.source && item.key === field.key);
            return capability
                ? { ...field, min: field.min ?? capability.min, max: field.max ?? capability.max, capability }
                : field;
        }),
    }));
}
function isStructuredField(field: any): any {
    return STRUCTURED_FIELD_CONTROLS.has(field?.control);
}
function createRuntimeSection(key: any, label: any, layout: any, fields: any): any {
    return {
        key,
        label,
        layout,
        fields,
    };
}
function fieldIdentifier(field: any): any {
    return `${field.source}:${field.key}`;
}
const GLOBAL_HIDDEN_RUNTIME_FIELDS = new Set() as any;
const HIDDEN_RUNTIME_FIELDS = {
    "text:property": new Set(["props:sampleValue"]),
    "text:style": new Set(["props:textPreset"]),
    "text:advanced": new Set(["root:zIndex"]),
    "image:property": new Set(),
    "image:style": new Set(),
    "image:advanced": new Set(),
} as any;
function isHiddenField(field: any): any {
    if (!field) {
        return true;
    }
    const identifier = fieldIdentifier(field);
    const runtimeKey = `${selectedObject.value?.type || ""}:${activeTab.value || ""}`;
    const hiddenFields = HIDDEN_RUNTIME_FIELDS[runtimeKey];
    return GLOBAL_HIDDEN_RUNTIME_FIELDS.has(identifier) || hiddenFields?.has(identifier) || false;
}
function groupRuntimeSections(fields: any, definitions: any): any {
    const visibleFields = fields.filter((field: any): any => !isHiddenField(field));
    const fieldMap = new Map(visibleFields.map((field: any): any => [fieldIdentifier(field), field]));
    const used = new Set();
    const sections = [];
    definitions.forEach((definition: any): any => {
        const sectionFields = (definition.fields || [])
            .map((id: any): any => fieldMap.get(id))
            .filter(Boolean);
        if (!sectionFields.length) {
            return;
        }
        sectionFields.forEach((field: any): any => used.add(fieldIdentifier(field)));
        sections.push(createRuntimeSection(definition.key, definition.label, definition.layout, sectionFields));
    });
    const remainingFields = visibleFields.filter((field: any): any => !used.has(fieldIdentifier(field)));
    if (remainingFields.length) {
        sections.push(createRuntimeSection("more", "更多", SECTION_LAYOUT.STACK, remainingFields));
    }
    return sections;
}
function createGeometryRuntimeSection(): any {
    return createRuntimeSection("geometry", "位置与尺寸", SECTION_LAYOUT.GRID_2, [
        "root:x",
        "root:y",
        "root:width",
        "root:height",
        "root:rotation",
    ]);
}
function createLayerRuntimeSection(): any {
    return createRuntimeSection("layer", "层级", SECTION_LAYOUT.STACK, ["root:zIndex", "root:layerActions"]);
}
function createMetadataRuntimeSection(): any {
    return createRuntimeSection("metadata", "元素信息", SECTION_LAYOUT.STACK, ["root:id", "root:type"]);
}
function createBehaviorRuntimeSection(extraFields: any = []): any {
    return createRuntimeSection("behavior", "行为", SECTION_LAYOUT.GRID_2, [
        "root:locked",
        "root:printable",
        "root:repeatPerPage",
        ...extraFields,
    ]);
}
function createActionsRuntimeSection(): any {
    return createRuntimeSection("actions", "扩展能力", SECTION_LAYOUT.STACK, ["root:saveAsTemplate"]);
}
function createDangerRuntimeSection(): any {
    return createRuntimeSection("danger", "危险操作", SECTION_LAYOUT.STACK, ["root:deleteElement"]);
}
function runtimeSectionDefinitions(type: any, tab: any): any {
    switch (`${type}:${tab}`) {
        case "text:property":
            return [
                createRuntimeSection("geometry", "位置与尺寸", SECTION_LAYOUT.GRID_2, [
                    "root:x",
                    "root:y",
                    "root:width",
                    "root:height",
                ]),
                createLayerRuntimeSection(),
                createRuntimeSection("content", "内容", SECTION_LAYOUT.STACK, [
                    "root:content",
                    "root:variable",
                ]),
                createRuntimeSection("behavior", "数据 & 行为", SECTION_LAYOUT.GRID_2, [
                    "root:repeatPerPage",
                    "props:autoHeight",
                    "props:whiteSpace",
                    "root:printable",
                ]),
            ];
        case "text:style":
            return [
                createRuntimeSection("layout", "排版", SECTION_LAYOUT.GRID_2, [
                    "props:writingMode",
                    "style:fontSize",
                    "style:color",
                    "style:textAlign",
                    "style:verticalAlign",
                    "style:fontFamily",
                    "style:fontWeight",
                    "style:fontStyle",
                    "style:textDecoration",
                    "style:lineHeight",
                    "style:letterSpacing",
                ]),
                createRuntimeSection("border", "边框", SECTION_LAYOUT.GRID_2, [
                    "style:borderStyle",
                    "style:borderWidth",
                    "style:borderColor",
                ]),
                createRuntimeSection("appearance", "外观", SECTION_LAYOUT.GRID_2, [
                    "style:backgroundColor",
                ]),
            ];
        case "text:advanced":
            return [
                createMetadataRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "image:property":
            return [
                createRuntimeSection("geometry", "位置与尺寸", SECTION_LAYOUT.GRID_2, [
                    "root:x",
                    "root:y",
                    "root:width",
                    "root:height",
                ]),
                createLayerRuntimeSection(),
                createRuntimeSection("source", "图片来源", SECTION_LAYOUT.STACK, [
                    "props:src",
                    "root:variable",
                ]),
                createRuntimeSection("behavior", "数据 & 行为", SECTION_LAYOUT.STACK, ["root:repeatPerPage", "root:printable"]),
            ];
        case "image:style":
            return [
                createRuntimeSection("border", "边框", SECTION_LAYOUT.STACK, [
                    "style:borderStyle",
                    "style:borderWidth",
                    "style:borderColor",
                ]),
                createRuntimeSection("appearance", "外观", SECTION_LAYOUT.STACK, [
                    "style:backgroundColor",
                    "style:objectFit",
                    "style:objectPosition",
                    "style:opacity",
                ]),
            ];
        case "image:advanced":
            return [
                createMetadataRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "barcode:property":
            return [
                createGeometryRuntimeSection(),
                createLayerRuntimeSection(),
                createRuntimeSection("binding", "数据绑定", SECTION_LAYOUT.STACK, ["root:variable"]),
                createRuntimeSection("content", "内容", SECTION_LAYOUT.STACK, [
                    "root:content",
                    "props:format",
                    "props:displayValue",
                    "props:margin",
                    "props:textMargin",
                    "props:textFontSize",
                ]),
            ];
        case "barcode:style":
            return [
                createRuntimeSection("colors", "颜色", SECTION_LAYOUT.GRID_2, ["style:color", "style:backgroundColor"]),
                createRuntimeSection("text", "文字", SECTION_LAYOUT.GRID_2, [
                    "style:fontFamily",
                    "style:fontSize",
                    "style:fontWeight",
                    "style:letterSpacing",
                    "style:textAlign",
                ]),
                createRuntimeSection("box", "盒模型", SECTION_LAYOUT.GRID_2, [
                    "style:opacity",
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:borderRadius",
                    "style:padding",
                ]),
            ];
        case "barcode:advanced":
            return [
                createMetadataRuntimeSection(),
                createBehaviorRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "qrcode:property":
            return [
                createGeometryRuntimeSection(),
                createLayerRuntimeSection(),
                createRuntimeSection("binding", "数据绑定", SECTION_LAYOUT.STACK, ["root:variable"]),
                createRuntimeSection("content", "内容", SECTION_LAYOUT.STACK, ["root:content", "props:eccLevel", "props:margin"]),
            ];
        case "qrcode:style":
            return [
                createRuntimeSection("colors", "颜色", SECTION_LAYOUT.GRID_2, ["style:color", "style:backgroundColor"]),
                createRuntimeSection("box", "盒模型", SECTION_LAYOUT.GRID_2, [
                    "style:opacity",
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:borderRadius",
                    "style:padding",
                ]),
            ];
        case "qrcode:advanced":
            return [
                createMetadataRuntimeSection(),
                createBehaviorRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "pageNumber:property":
            return [
                createGeometryRuntimeSection(),
                createLayerRuntimeSection(),
                createRuntimeSection("preview", "预览", SECTION_LAYOUT.GRID_2, ["root:content", "props:totalPages"]),
                createRuntimeSection("format", "格式", SECTION_LAYOUT.STACK, ["props:format"]),
            ];
        case "pageNumber:style":
            return [
                createRuntimeSection("typography", "文字", SECTION_LAYOUT.GRID_2, [
                    "style:fontFamily",
                    "style:fontSize",
                    "style:fontWeight",
                    "style:fontStyle",
                    "style:color",
                    "style:textAlign",
                    "style:verticalAlign",
                    "style:lineHeight",
                    "style:letterSpacing",
                ]),
                createRuntimeSection("box", "盒模型", SECTION_LAYOUT.GRID_2, [
                    "style:opacity",
                    "style:backgroundColor",
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:borderRadius",
                    "style:padding",
                ]),
            ];
        case "pageNumber:advanced":
            return [
                createMetadataRuntimeSection(),
                createBehaviorRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "line:property":
            return [createGeometryRuntimeSection(), createLayerRuntimeSection()];
        case "line:style":
            return [
                createRuntimeSection("stroke", "线条", SECTION_LAYOUT.GRID_2, [
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:opacity",
                ]),
            ];
        case "line:advanced":
            return [
                createMetadataRuntimeSection(),
                createBehaviorRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "rect:style":
        case "circle:style":
            return [
                createRuntimeSection("fill", "填充", SECTION_LAYOUT.GRID_2, [
                    "style:opacity",
                    "style:backgroundColor",
                ]),
                createRuntimeSection("stroke", "描边", SECTION_LAYOUT.GRID_2, [
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:borderRadius",
                ]),
                createRuntimeSection("spacing", "内边距", SECTION_LAYOUT.STACK, ["style:padding"]),
            ];
        case "rect:property":
        case "circle:property":
            return [createGeometryRuntimeSection(), createLayerRuntimeSection()];
        case "rect:advanced":
        case "circle:advanced":
            return [
                createMetadataRuntimeSection(),
                createBehaviorRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "table:property":
            return [
                createGeometryRuntimeSection(),
                createLayerRuntimeSection(),
                createRuntimeSection("bindings", "数据绑定", SECTION_LAYOUT.STACK, [
                    "props:dataVariable",
                    "props:footerDataVariable",
                ]),
                createRuntimeSection("structure", "结构", SECTION_LAYOUT.GRID_2, ["props:showHeader", "props:showFooter"]),
                createRuntimeSection("columns", "列配置", SECTION_LAYOUT.STACK, ["props:columns"]),
                createRuntimeSection("preview", "预览数据", SECTION_LAYOUT.STACK, ["props:sampleData"]),
            ];
        case "table:style":
            return [
                createRuntimeSection("text", "文字", SECTION_LAYOUT.GRID_2, [
                    "style:fontFamily",
                    "style:fontSize",
                    "style:fontWeight",
                    "style:fontStyle",
                    "style:color",
                    "style:textAlign",
                    "style:verticalAlign",
                    "style:lineHeight",
                    "style:letterSpacing",
                ]),
                createRuntimeSection("box", "盒模型", SECTION_LAYOUT.GRID_2, [
                    "style:opacity",
                    "style:backgroundColor",
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:borderRadius",
                    "style:padding",
                ]),
            ];
        case "table:advanced":
            return [
                createMetadataRuntimeSection(),
                createRuntimeSection("pagination", "分页", SECTION_LAYOUT.GRID_2, [
                    "props:autoPaginate",
                    "props:tfootRepeat",
                ]),
                createBehaviorRuntimeSection(),
                createRuntimeSection("footer", "页脚", SECTION_LAYOUT.STACK, ["props:footerData"]),
                createRuntimeSection("transform", "数据转换", SECTION_LAYOUT.STACK, ["props:transform"]),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        case "multiLabel:property":
            return [
                createGeometryRuntimeSection(),
                createLayerRuntimeSection(),
                createRuntimeSection("binding", "数据绑定", SECTION_LAYOUT.STACK, ["props:dataVariable"]),
                createRuntimeSection("layout", "布局", SECTION_LAYOUT.GRID_2, [
                    "props:rows",
                    "props:cols",
                    "props:gapX",
                    "props:gapY",
                    "props:direction",
                    "props:cellPadding",
                ]),
                createRuntimeSection("mapping", "字段映射", SECTION_LAYOUT.STACK, [
                    "props:primaryPath",
                    "props:secondaryPath",
                    "props:tertiaryPath",
                ]),
                createRuntimeSection("preview", "预览数据", SECTION_LAYOUT.STACK, ["props:sampleData"]),
            ];
        case "multiLabel:style":
            return [
                createRuntimeSection("text", "文字", SECTION_LAYOUT.GRID_2, [
                    "style:fontFamily",
                    "style:fontSize",
                    "style:fontWeight",
                    "style:fontStyle",
                    "style:color",
                    "style:textAlign",
                    "style:verticalAlign",
                    "style:lineHeight",
                    "style:letterSpacing",
                ]),
                createRuntimeSection("card", "标签卡片", SECTION_LAYOUT.GRID_2, [
                    "style:opacity",
                    "style:backgroundColor",
                    "style:borderColor",
                    "style:borderWidth",
                    "style:borderStyle",
                    "style:borderRadius",
                    "style:padding",
                ]),
            ];
        case "multiLabel:advanced":
            return [
                createMetadataRuntimeSection(),
                createBehaviorRuntimeSection(),
                createActionsRuntimeSection(),
                createDangerRuntimeSection(),
            ];
        default:
            return null;
    }
}
function regroupSections(sections: any): any {
    const definitions = runtimeSectionDefinitions(selectedObject.value?.type, activeTab.value);
    if (!definitions?.length) {
        return sections;
    }
    const fields = sections.flatMap((section: any): any => section.fields || []);
    return groupRuntimeSections(fields, definitions);
}
function sectionLayoutClass(layout: any): any {
    switch (layout) {
        case SECTION_LAYOUT.GRID_2:
            return "is-grid-2";
        case SECTION_LAYOUT.ACTIONS_2X2:
            return "is-actions-2x2";
        case SECTION_LAYOUT.INLINE_BUTTONS:
            return "is-inline-buttons";
        default:
            return "is-stack";
    }
}
function displayNumber(value: any): any {
    return Number.isFinite(value) ? value.toFixed(1) : "--";
}
function getFieldValue(field: any): any {
    if (!selectedObject.value) {
        return undefined;
    }
    if (field.source === "root") {
        return selectedObject.value[field.key];
    }
    if (field.source === "style") {
        return selectedObject.value.style?.[field.key];
    }
    if (field.source === "props") {
        return selectedObject.value.props?.[field.key];
    }
    if (field.source === "editorHints") {
        return selectedObject.value.editorHints?.[field.key];
    }
    return undefined;
}
function stringFieldValue(field: any): any {
    const value = getFieldValue(field);
    if (field.valueType === "json" && value != null) {
        try {
            return JSON.stringify(value, null, 2);
        }
        catch {
            return "";
        }
    }
    return value == null ? "" : String(value);
}
function codeFieldValue(field: any): any {
    return stringFieldValue(field);
}
const imageFileInputs = new Map() as any;
function imageFieldPlaceholder(field: any): any {
    if (field?.key === "src") {
        return "请输入图片地址或 Base64...";
    }
    return "";
}
function setImageInputRef(key: any, element: any): any {
    if (!key) {
        return;
    }
    if (element) {
        imageFileInputs.set(key, element);
        return;
    }
    imageFileInputs.delete(key);
}
function triggerImageUpload(field: any): any {
    imageFileInputs.get(fieldIdentifier(field))?.click();
}
function readImageFileAsDataUrl(file: any): any {
    return new Promise((resolve: any, reject: any): any => {
        const reader = new FileReader();
        reader.onload = (): any => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = (): any => reject(new Error("read-image-failed"));
        reader.readAsDataURL(file);
    });
}
async function onImageFileChange(field: any, event: any): Promise<any> {
    const input = event?.target;
    const file = input?.files?.[0];
    if (!file) {
        return;
    }
    if (!file.type.startsWith("image/")) {
        PdMessage.error("请选择图片文件");
        input.value = "";
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        PdMessage.error("图片大小不能超过 2MB");
        input.value = "";
        return;
    }
    try {
        const dataUrl = await readImageFileAsDataUrl(file);
        setFieldValue(field, dataUrl);
    }
    catch {
        PdMessage.error("图片读取失败，请重试");
    }
    finally {
        input.value = "";
    }
}
function numberValue(value: any): any {
    return Number.isFinite(value) ? value : 0;
}
function roundDimensionValue(value: any): any {
    return Math.round(value * 1000) / 1000;
}
function isDimensionKey(key: any): any {
    return key === "width" || key === "height";
}
function linkedDimensionKey(key: any): any {
    return key === "width" ? "height" : "width";
}
function buildRootUpdatePayload(object: any, key: any, value: any): any {
    const nextPayload = {
        [key]: value,
    };
    if (!object || !isDimensionKey(key) || !Number.isFinite(value)) {
        return nextPayload;
    }
    if (SQUARE_DIMENSION_TYPES.has(object.type)) {
        nextPayload[linkedDimensionKey(key)] = value;
        return nextPayload;
    }
    if (object.type !== "image" || !object.props?.keepAspectRatio) {
        return nextPayload;
    }
    const currentPrimary = Number(object[key]);
    const currentSecondary = Number(object[linkedDimensionKey(key)]);
    if (currentPrimary <= 0 || currentSecondary <= 0) {
        return nextPayload;
    }
    nextPayload[linkedDimensionKey(key)] = roundDimensionValue((value / currentPrimary) * currentSecondary);
    return nextPayload;
}
function numberFieldValue(field: any): any {
    return numberValue(getFieldValue(field));
}
function colorFieldValue(field: any): any {
    const value = getFieldValue(field);
    if (typeof value === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
        return value;
    }
    return "#000000";
}
function selectFieldValue(field: any): any {
    const value = getFieldValue(field);
    if (value != null && value !== "") {
        return value;
    }
    return field.options?.[0]?.value;
}
function textareaRows(field: any): any {
    if (field.rows) {
        return field.rows;
    }
    return field.key === "customScript" ? 8 : 4;
}
function tableEditorDraft(key: any): any {
    return tableEditorDrafts.value[key] ?? "";
}
function updateTableEditorDraft(key: any, value: any): any {
    tableEditorDrafts.value = {
        ...tableEditorDrafts.value,
        [key]: value == null ? "" : String(value),
    };
}
function openTableEditor(key: any, title: any, language: any): any {
    const currentValue = tableJsonPropValue(key);
    updateTableEditorDraft(key, currentValue);
    activeTableEditor.value = {
        visible: true,
        key,
        title,
        language,
    };
}
function closeTableEditor(resetDraft: any = true): any {
    const key = activeTableEditor.value.key;
    if (resetDraft && key) {
        updateTableEditorDraft(key, tableJsonPropValue(key));
    }
    activeTableEditor.value = {
        visible: false,
        key: "",
        title: "",
        language: "json",
    };
}
function saveActiveTableEditor(): any {
    const { key, title, language } = activeTableEditor.value;
    if (!key) {
        return;
    }
    commitTableJsonEditor(key, title);
    closeTableEditor(false);
}
function tableEditorPreview(key: any): any {
    const source = tableEditorDraft(key).trim();
    if (!source) {
        return key === "transform" ? "{}" : "[]";
    }
    const lines = source.split(/\r?\n/).slice(0, 6);
    return lines.join("\n");
}
function tablePropValue(key: any, fallback: any = ""): any {
    const value = selectedObject.value?.props?.[key];
    return value == null ? fallback : value;
}
function tableEditorHintValue(key: any, fallback: any = ""): any {
    const value = selectedObject.value?.editorHints?.[key];
    return value == null ? fallback : value;
}
function tableStyleValue(key: any, fallback: any = ""): any {
    const value = selectedObject.value?.style?.[key];
    return value == null ? fallback : value;
}
function tableNumberPropValue(key: any, fallback: any = 0): any {
    const value = Number(tablePropValue(key, fallback));
    return Number.isFinite(value) ? value : fallback;
}
function tableDesignRowCountValue(): any {
    const explicitValue = Number(selectedObject.value?.editorHints?.rowCount);
    if (Number.isFinite(explicitValue) && explicitValue > 0) {
        return explicitValue;
    }
    const sampleRows = selectedObject.value?.props?.sampleData;
    return Array.isArray(sampleRows) && sampleRows.length ? sampleRows.length : 5;
}
function tableStringPropValue(key: any, fallback: any = ""): any {
    const value = tablePropValue(key, fallback);
    return value == null ? fallback : String(value);
}
function tableStringStyleValue(key: any, fallback: any = ""): any {
    const value = tableStyleValue(key, fallback);
    return value == null ? fallback : String(value);
}
function setTablePropValue(key: any, value: any): any {
    setFieldValue({ source: "props", key }, value);
}
function setTableEditorHintValue(key: any, value: any): any {
    setFieldValue({ source: "editorHints", key }, value);
}
function setTableStyleValue(key: any, value: any): any {
    setFieldValue({ source: "style", key }, value);
}
function tableJsonPropValue(key: any): any {
    if (key === "columns") {
        return JSON.stringify(tableColumnsValue(tableColumnsField).map((column: any): any => {
            const result: any = {
                field: column.key,
                valuePath: column.valuePath || column.key,
                header: column.title,
                width: column.width,
            };
            if (column.align && column.align !== "left") {
                result.align = column.align;
            }
            if (column.formatter && typeof column.formatter === "object") {
                result.formatter = column.formatter;
            }
            return result;
        }), null, 2);
    }
    return stringFieldValue({ source: "props", key, valueType: "json" });
}
function setTableJsonPropValue(key: any, value: any, label: any): any {
    if (key === "columns") {
        const source = typeof value === "string" ? value.trim() : "";
        if (!source) {
            setTableObjectProps({
                columns: [],
                sampleData: [],
                footerData: [],
            });
            return true;
        }
        try {
            const parsed = JSON.parse(source);
            if (!Array.isArray(parsed)) {
                PdMessage.error("列定义必须是数组 JSON");
                return false;
            }
            const nextColumns = parsed.map((column: any, index: any): any => normalizeTableColumn(column, index));
            setTableObjectProps({
                columns: nextColumns,
                sampleData: normalizeTableSampleData(selectedObject.value?.props?.sampleData, nextColumns),
                footerData: normalizeTableFooterData(selectedObject.value?.props?.footerData, nextColumns),
            });
        }
        catch {
            PdMessage.error(`${label} 不是有效 JSON`);
            return false;
        }
        return true;
    }
    const source = typeof value === "string" ? value.trim() : "";
    if (source) {
        try {
            JSON.parse(source);
        }
        catch {
            PdMessage.error(`${label} 不是有效 JSON`);
            return false;
        }
    }
    setFieldValue({ source: "props", key, valueType: "json", label }, value);
    return true;
}
function tableCodePropValue(key: any): any {
    return codeFieldValue({ source: "props", key });
}
function setTableCodePropValue(key: any, value: any): any {
    setFieldValue({ source: "props", key, label: key }, value);
    return true;
}
function commitTableJsonEditor(key: any, label: any): any {
    if (setTableJsonPropValue(key, tableEditorDraft(key), label)) {
        updateTableEditorDraft(key, tableJsonPropValue(key));
    }
}
function commitTableCodeEditor(key: any): any {
    if (setTableCodePropValue(key, tableEditorDraft(key))) {
        updateTableEditorDraft(key, tableCodePropValue(key));
    }
}
function pxToMmValue(value: any): any {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.round((numeric / MM_TO_CSS_PX) * 100) / 100 : 0;
}
function mmToPxValue(value: any): any {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.round(numeric * MM_TO_CSS_PX * 100) / 100 : 0;
}
function tableFontSizeMmValue(key: any, fallbackKey: any = ""): any {
    const fallback = fallbackKey ? tableStyleValue(fallbackKey, 14) : 14;
    return pxToMmValue(tableStyleValue(key, fallback));
}
function setTableFontSizeMmValue(key: any, value: any, fallbackKey: any = ""): any {
    const fallback = fallbackKey ? tableStyleValue(fallbackKey, 14) : 14;
    const mmValue = Number.isFinite(Number(value)) ? Number(value) : pxToMmValue(fallback);
    setTableStyleValue(key, mmToPxValue(mmValue));
}
function tableBorderWidthMmValue(): any {
    return pxToMmValue(tableStyleValue("borderWidth", 1));
}
function setTableBorderWidthMmValue(value: any): any {
    setTableStyleValue("borderWidth", mmToPxValue(value));
}
function reorderSelectedObject(action: any): any {
    if (!selectedObject.value) {
        return;
    }
    if (!documentStore.reorderObject(selectedObject.value.id, action)) {
        PdMessage.warning("当前元素已锁定，无法调整层级。");
    }
}
async function copySelectedObjectId(): Promise<any> {
    if (!selectedObject.value?.id) {
        return;
    }
    try {
        await navigator.clipboard.writeText(selectedObject.value.id);
        PdMessage.success("ID 已复制");
    }
    catch {
        PdMessage.error("复制失败");
    }
}
function setTableObjectProps(patch: any): any {
    if (!selectedObject.value) {
        return;
    }
    for (const [key, value] of Object.entries(patch || {})) {
        const field = { source: "props", key };
        if (!validateFieldChange(field, value)) {
            return;
        }
    }
    const field = { source: "props", key: Object.keys(patch || {})[0] || "columns" };
    updateSelectedObject(field, {
        props: {
            ...(selectedObject.value.props || {}),
            ...patch,
        },
    });
}
function selectedTableRows(section: any = selectedTableSection.value): any {
    const key = section === "footer" ? "footerData" : "sampleData";
    const rows = selectedObject.value?.props?.[key];
    return Array.isArray(rows) ? rows : [];
}
function tableSelectionCell(): any {
    const selection = selectedTableCells.value[0];
    if (!selection)
        return null;
    return selectedTableRows(selection.section)?.[selection.rowIndex]?.[selection.colField] ?? null;
}
function selectedTableCellStyleValue(key: any, fallback: any = ""): any {
    const value = tableCellStyleValue(tableSelectionCell())[key];
    return value == null || value === "" ? fallback : value;
}
function selectedTableCellNumberStyleValue(key: any): any {
    const raw = selectedTableCellStyleValue(key, "");
    const numeric = Number.parseFloat(raw);
    return Number.isFinite(numeric) ? numeric : 12;
}
function selectedTableCellTextValue(): any {
    return String(tableCellTextValue(tableSelectionCell()) ?? "");
}
function selectedTableCellHasCurrentColumnSummary(): any {
    const selection = selectedTableCells.value[0];
    return Boolean(selection && toTableCellDescriptor(tableSelectionCell()).field === selection.colField);
}
function updateSelectedFooterText(value: any): any {
    if (selectedTableSection.value !== "footer")
        return;
    let rows = selectedTableRows("footer");
    selectedTableCells.value.forEach((cell: any): any => {
        rows = updateTableCellValue(rows, selectedObject.value?.props?.columns, cell.rowIndex, cell.colField, String(value ?? ""));
    });
    commitTableOperation({ footerData: rows }, "编辑表脚单元格");
}
function setSelectedFooterSummary(enabled: any): any {
    if (selectedTableSection.value !== "footer")
        return;
    let rows = selectedTableRows("footer");
    selectedTableCells.value.forEach((selection: any): any => {
        rows = updateTableCellValue(rows, selectedObject.value?.props?.columns, selection.rowIndex, selection.colField, tableCellTextValue(rows?.[selection.rowIndex]?.[selection.colField]));
        const cell = toTableCellDescriptor(rows[selection.rowIndex][selection.colField]);
        if (enabled) {
            rows[selection.rowIndex][selection.colField] = { ...cell, field: selection.colField };
            return;
        }
        delete cell.field;
        rows[selection.rowIndex][selection.colField] = Object.keys(cell).length === 1 && Object.hasOwn(cell, "value") ? cell.value : cell;
    });
    commitTableOperation({ footerData: rows }, "设置表脚汇总字段");
}
function commitTableOperation(patch: any, label: any): any {
    const object = selectedObject.value;
    if (!object || object.locked) {
        PdMessage.warning("当前表格已锁定，请先解除锁定后再编辑。");
        return false;
    }
    const command = createUpdateObjectPropsCommand(documentStore, object.id, {
        props: { ...(object.props || {}), ...(patch || {}) },
    });
    if (!command)
        return false;
    command.label = label;
    executeEditorCommand(historyStore, command);
    return true;
}
function selectionDataKey(): any {
    return selectedTableSection.value === "footer" ? "footerData" : "sampleData";
}
function applySelectedTableCellStyle(style: any): any {
    if (!selectedTableCells.value.length)
        return;
    const key = selectionDataKey();
    const result = applyTableCellStylePatch(selectedTableRows(), selectedObject.value?.props?.columns, selectedTableCells.value, style);
    if (result.changed)
        commitTableOperation({ [key]: result.rows }, "设置单元格样式");
}
function mergeSelectedTableCells(): any {
    const key = selectionDataKey();
    const result = mergeTableCellsPatch(selectedTableRows(), selectedObject.value?.props?.columns, selectedTableCells.value);
    if (!result.changed) {
        PdMessage.warning(result.reason || "请选择一个连续的单元格区域。");
        return;
    }
    commitTableOperation({ [key]: result.rows }, "合并表格单元格");
}
function splitSelectedTableCells(): any {
    const key = selectionDataKey();
    let rows = selectedTableRows();
    let changed = false;
    const processed = new Set();
    selectedTableCells.value.forEach((cell: any): any => {
        const cellKey = `${cell.rowIndex}:${cell.colField}`;
        if (processed.has(cellKey))
            return;
        processed.add(cellKey);
        const result = splitTableCellPatch(rows, selectedObject.value?.props?.columns, cell.rowIndex, cell.colField);
        rows = result.rows;
        changed ||= result.changed;
    });
    if (!changed) {
        PdMessage.warning("所选单元格没有合并区域可拆分。");
        return;
    }
    commitTableOperation({ [key]: rows }, "拆分表格单元格");
}
function insertSelectedTableRow(): any {
    const key = selectionDataKey();
    const rowIndex = Math.max(...selectedTableCells.value.map((cell: any): any => cell.rowIndex), -1) + 1;
    const result = insertTableRowAt(selectedTableRows(), selectedObject.value?.props?.columns, rowIndex, selectedObject.value?.props?.rowHeights, selectedTableSection.value);
    commitTableOperation({ [key]: result.rows, rowHeights: result.rowHeights }, "插入表格行");
}
function removeSelectedTableRows(): any {
    const key = selectionDataKey();
    let rows = selectedTableRows();
    let rowHeights = selectedObject.value?.props?.rowHeights;
    const indexes = [...new Set(selectedTableCells.value.map((cell: any): any => cell.rowIndex))].sort((a: any, b: any): any => b - a);
    let changed = false;
    indexes.forEach((rowIndex: any): any => {
        const result = removeTableRowAt(rows, selectedObject.value?.props?.columns, rowIndex, rowHeights, selectedTableSection.value);
        rows = result.rows;
        rowHeights = result.rowHeights;
        changed ||= result.changed;
    });
    if (changed) {
        selectionStore.clearTableSelection(selectedObject.value?.id);
        commitTableOperation({ [key]: rows, rowHeights }, "删除表格行");
    }
}
function insertSelectedTableColumn(): any {
    const columns = selectedObject.value?.props?.columns || [];
    const indexes = selectedTableCells.value
        .map((cell: any): any => columns.findIndex((column: any): any => column?.key === cell.colField))
        .filter((index: any): any => index >= 0);
    const index = (indexes.length ? Math.max(...indexes) : columns.length - 1) + 1;
    const result = insertTableColumnAt(columns, selectedTableRows("body"), selectedTableRows("footer"), index);
    if (commitTableOperation({ columns: result.columns, sampleData: result.sampleData, footerData: result.footerData }, "插入表格列")) {
        selectionStore.setTableSelection(selectedObject.value?.id, [{ rowIndex: selectedTableCells.value[0]?.rowIndex || 0, colField: result.columns[result.index]?.key, section: selectedTableSection.value }], selectedTableSection.value);
    }
}
function removeSelectedTableColumns(): any {
    let columns = selectedObject.value?.props?.columns || [];
    let sampleData = selectedTableRows("body");
    let footerData = selectedTableRows("footer");
    const indexes = [...new Set(selectedTableCells.value
            .map((cell: any): any => columns.findIndex((column: any): any => column?.key === cell.colField))
            .filter((index: any): any => index >= 0))].sort((a: any, b: any): any => b - a);
    let changed = false;
    indexes.forEach((index: any): any => {
        const result = removeTableColumnAt(columns, sampleData, footerData, index);
        columns = result.columns;
        sampleData = result.sampleData;
        footerData = result.footerData;
        changed ||= result.changed;
    });
    if (!changed) {
        PdMessage.warning("表格至少需要保留一列。");
        return;
    }
    selectionStore.clearTableSelection(selectedObject.value?.id);
    commitTableOperation({ columns, sampleData, footerData }, "删除表格列");
}
function normalizeTableColumn(column: any, index: any): any {
    const width = Number(column?.width);
    return {
        key: typeof column?.key === "string" && column.key.trim()
            ? column.key
            : `field${index + 1}`,
        valuePath: typeof column?.valuePath === "string" && column.valuePath.trim()
            ? column.valuePath
            : typeof column?.key === "string" && column.key.trim()
                ? column.key
                : `field${index + 1}`,
        title: typeof column?.title === "string" && column.title.trim()
            ? column.title
            : `列 ${index + 1}`,
        width: Number.isFinite(width) ? width : 100,
        align: column?.align === "center" || column?.align === "right" ? column.align : "left",
        ...(column?.formatter && typeof column.formatter === "object" ? { formatter: column.formatter } : {}),
    };
}
function tableColumnsValue(field: any): any {
    const columns = getFieldValue(field);
    if (!Array.isArray(columns)) {
        return [];
    }
    return columns.map((column: any, index: any): any => normalizeTableColumn(column, index));
}
function setTableColumns(field: any, columns: any): any {
    setTableObjectProps({
        [field.key]: columns.map((column: any, index: any): any => normalizeTableColumn(column, index)),
    });
}
function nextTableColumnKey(columns: any): any {
    const existingKeys = new Set(columns.map((column: any): any => column.key));
    let index = columns.length + 1;
    while (existingKeys.has(`field${index}`)) {
        index += 1;
    }
    return `field${index}`;
}
function mapTableData(data: any, transform: any): any {
    if (Array.isArray(data)) {
        return data.map((item: any): any => (item && typeof item === "object" ? transform(item) : item));
    }
    if (data && typeof data === "object") {
        return transform(data);
    }
    return data;
}
function renameTableDataKey(data: any, oldKey: any, newKey: any): any {
    if (!oldKey || oldKey === newKey) {
        return data;
    }
    return mapTableData(data, (item: any): any => {
        const nextItem = { ...item };
        nextItem[newKey] = item[oldKey] ?? "";
        delete nextItem[oldKey];
        return nextItem;
    });
}
function removeTableDataKey(data: any, key: any): any {
    if (!key) {
        return data;
    }
    return mapTableData(data, (item: any): any => {
        const nextItem = { ...item };
        delete nextItem[key];
        return nextItem;
    });
}
function appendTableDataKey(data: any, key: any): any {
    if (!key) {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map((item: any): any => ({
            ...(item && typeof item === "object" ? item : {}),
            [key]: item?.[key] ?? "",
        }));
    }
    if (data && typeof data === "object") {
        return {
            ...data,
            [key]: data[key] ?? "",
        };
    }
    return data;
}
function addTableColumn(field: any): any {
    const columns = tableColumnsValue(field);
    const result = insertTableColumnAt(columns, selectedObject.value?.props?.sampleData, selectedObject.value?.props?.footerData, columns.length);
    setTableObjectProps({
        columns: result.columns,
        sampleData: result.sampleData,
        footerData: result.footerData,
    });
}
function updateTableColumn(field: any, index: any, prop: any, value: any): any {
    const columns = tableColumnsValue(field);
    const currentColumn = columns[index];
    if (!currentColumn) {
        return;
    }
    let nextValue = value;
    if (prop === "width") {
        nextValue = Number.isFinite(value) ? value : currentColumn.width;
    }
    if (prop === "align") {
        nextValue = value === "center" || value === "right" ? value : "left";
    }
    if (prop === "key" || prop === "title") {
        nextValue = value == null ? "" : String(value);
    }
    if (prop === "key") {
        const candidateKey = nextValue.trim() || `field${index + 1}`;
        const duplicated = columns.some((column: any, columnIndex: any): any => columnIndex !== index && column.key === candidateKey);
        if (duplicated) {
            PdMessage.error("字段 key 不能重复");
            return;
        }
        nextValue = candidateKey;
    }
    const nextColumns = columns.map((column: any, columnIndex: any): any => columnIndex === index ? normalizeTableColumn({ ...column, [prop]: nextValue }, columnIndex) : column);
    if (prop === "key") {
        const renamed = renameTableColumnPatch(columns, selectedObject.value?.props?.sampleData, selectedObject.value?.props?.footerData, index, nextValue, nextColumns[index].title);
        if (renamed?.error) {
            PdMessage.error(renamed.error);
            return;
        }
        if (renamed)
            setTableObjectProps(renamed);
        return;
    }
    setTableColumns(field, nextColumns);
}
function updateTableColumnFormatter(field: any, index: any, key: any, value: any): any {
    const columns = tableColumnsValue(field);
    const currentColumn = columns[index];
    if (!currentColumn) {
        return;
    }
    const currentFormatter = currentColumn.formatter && typeof currentColumn.formatter === "object" ? currentColumn.formatter : {};
    const nextFormatter = { ...currentFormatter, [key]: value };
    const nextColumn = { ...currentColumn };
    if (key === "type" && !value) {
        delete nextColumn.formatter;
    }
    else {
        nextColumn.formatter = nextFormatter;
    }
    const nextColumns = columns.map((column: any, columnIndex: any): any => columnIndex === index ? normalizeTableColumn(nextColumn, columnIndex) : column);
    setTableColumns(field, nextColumns);
}
function moveTableColumn(field: any, index: any, offset: any): any {
    const columns = tableColumnsValue(field);
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= columns.length) {
        return;
    }
    const nextColumns = [...columns];
    [nextColumns[index], nextColumns[targetIndex]] = [nextColumns[targetIndex], nextColumns[index]];
    setTableColumns(field, nextColumns);
}
function removeTableColumn(field: any, index: any): any {
    const columns = tableColumnsValue(field);
    if (columns.length <= 1) {
        PdMessage.warning("表格至少需要保留一列。");
        return;
    }
    const result = removeTableColumnAt(columns, selectedObject.value?.props?.sampleData, selectedObject.value?.props?.footerData, index);
    setTableObjectProps({
        columns: result.columns,
        sampleData: result.sampleData,
        footerData: result.footerData,
    });
}
function normalizeTableSampleRow(row: any, columns: any): any {
    const source = row && typeof row === "object" ? row : {};
    return columns.reduce((result: any, column: any): any => {
        result[column.key] = source[column.key] == null ? "" : source[column.key];
        return result;
    }, {});
}
function normalizeTableSampleData(data: any, columns: any): any {
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row: any): any => normalizeTableSampleRow(row, columns));
}
function tableSampleRowsValue(field: any): any {
    const rows = getFieldValue(field);
    const columns = tableColumnsValue(tableColumnsField);
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows.map((row: any): any => normalizeTableSampleRow(row, columns));
}
function tableSampleCellValue(row: any, key: any): any {
    return String(tableCellTextValue(row?.[key]) ?? "");
}
function createEmptyTableSampleRow(columns: any): any {
    return columns.reduce((result: any, column: any): any => {
        result[column.key] = "";
        return result;
    }, {});
}
function addTableSampleRow(field: any): any {
    const columns = tableColumnsValue(tableColumnsField);
    if (!columns.length) {
        return;
    }
    setFieldValue(field, [...tableSampleRowsValue(field), createEmptyTableSampleRow(columns)]);
}
function updateTableSampleCell(field: any, rowIndex: any, key: any, value: any): any {
    setFieldValue(field, updateTableCellValue(tableSampleRowsValue(field), tableColumnsValue(tableColumnsField), rowIndex, key, value == null ? "" : String(value)));
}
function removeTableSampleRow(field: any, rowIndex: any): any {
    setFieldValue(field, tableSampleRowsValue(field).filter((_: any, index: any): any => index !== rowIndex));
}
function normalizeTableFooterCell(cell: any): any {
    if (cell && typeof cell === "object" && !Array.isArray(cell)) {
        return {
            ...cell,
        };
    }
    return cell == null ? "" : String(cell);
}
function normalizeTableFooterRow(data: any, columns: any): any {
    const source = data && typeof data === "object" ? data : {};
    return columns.reduce((result: any, column: any): any => {
        result[column.key] = normalizeTableFooterCell(source[column.key]);
        return result;
    }, {});
}
function normalizeTableFooterData(data: any, columns: any): any {
    if (Array.isArray(data)) {
        return data.map((row: any): any => normalizeTableFooterRow(row, columns));
    }
    if (data && typeof data === "object" && Object.keys(data).length) {
        return [normalizeTableFooterRow(data, columns)];
    }
    return [];
}
function tableFooterRowsValue(field: any): any {
    const source = getFieldValue(field);
    const columns = tableColumnsValue(tableColumnsField);
    if (!columns.length) {
        return [];
    }
    if (Array.isArray(source)) {
        return source.map((row: any): any => normalizeTableFooterRow(row, columns));
    }
    if (source && typeof source === "object" && Object.keys(source).length) {
        return [normalizeTableFooterRow(source, columns)];
    }
    return [];
}
function tableFooterCellDisplayValue(cell: any): any {
    if (cell && typeof cell === "object" && !Array.isArray(cell)) {
        if (cell.result != null && cell.result !== "") {
            return String(cell.result);
        }
        if (cell.value != null && cell.value !== "") {
            return String(cell.value);
        }
        if (cell.field != null && cell.field !== "") {
            return String(cell.field);
        }
    }
    return cell == null ? "" : String(cell);
}
function tableFooterCellValue(field: any, rowIndex: any, key: any): any {
    const row = tableFooterRowsValue(field)[rowIndex];
    return tableFooterCellDisplayValue(row?.[key]);
}
function tableFooterCellToken(field: any, rowIndex: any, key: any): any {
    const cell = tableFooterRowsValue(field)[rowIndex]?.[key];
    return cell && typeof cell === "object" && !Array.isArray(cell) && cell.field ? String(cell.field) : "";
}
function createEmptyTableFooterRow(columns: any): any {
    return columns.reduce((result: any, column: any): any => {
        result[column.key] = "";
        return result;
    }, {});
}
function addTableFooterRow(field: any): any {
    const columns = tableColumnsValue(tableColumnsField);
    if (!columns.length) {
        return;
    }
    setFieldValue(field, [...tableFooterRowsValue(field), createEmptyTableFooterRow(columns)]);
}
function updateTableFooterCell(field: any, rowIndex: any, key: any, value: any): any {
    const rows = tableFooterRowsValue(field);
    const currentCell = rows[rowIndex]?.[key];
    const nextText = value == null ? "" : String(value);
    const nextCell = currentCell && typeof currentCell === "object" && !Array.isArray(currentCell)
        ? {
            ...currentCell,
            result: nextText,
            value: currentCell.field ? currentCell.value ?? "" : nextText,
        }
        : nextText;
    const nextRows = rows.map((row: any, index: any): any => (index === rowIndex ? { ...row, [key]: nextCell } : row));
    setFieldValue(field, nextRows);
}
function removeTableFooterRow(field: any, rowIndex: any): any {
    setFieldValue(field, tableFooterRowsValue(field).filter((_: any, index: any): any => index !== rowIndex));
}
function resetTableFooter(field: any): any {
    setFieldValue(field, []);
}
function multiLabelCellCount(): any {
    if (selectedObject.value?.type !== "multiLabel") {
        return 0;
    }
    const rows = Math.max(1, Number(selectedObject.value?.props?.rows) || 1);
    const cols = Math.max(1, Number(selectedObject.value?.props?.cols) || 1);
    return rows * cols;
}
function normalizeMultiLabelSampleItem(item: any, index: any): any {
    const source = item && typeof item === "object" ? item : {};
    return {
        title: source.title == null ? "" : String(source.title),
        code: source.code == null ? "" : String(source.code),
        detail: source.detail == null ? "" : String(source.detail),
    };
}
function normalizeMultiLabelSampleData(data: any, total: any = multiLabelCellCount()): any {
    const source = Array.isArray(data) ? data : [];
    const count = Math.max(1, total || 1);
    return source.slice(0, count).map((item: any, index: any): any => normalizeMultiLabelSampleItem(item, index));
}
function multiLabelSampleDataValue(field: any): any {
    return normalizeMultiLabelSampleData(getFieldValue(field));
}
function multiLabelCellCoordinate(index: any): any {
    const rows = Math.max(1, Number(selectedObject.value?.props?.rows) || 1);
    const cols = Math.max(1, Number(selectedObject.value?.props?.cols) || 1);
    const direction = selectedObject.value?.props?.direction === "column" ? "column" : "row";
    if (direction === "column") {
        const row = (index % rows) + 1;
        const col = Math.floor(index / rows) + 1;
        return `R${row} C${col}`;
    }
    const row = Math.floor(index / cols) + 1;
    const col = (index % cols) + 1;
    return `R${row} C${col}`;
}
function setMultiLabelSampleData(data: any): any {
    if (selectedObject.value?.type !== "multiLabel") {
        return;
    }
    updateSelectedObject({ source: "props", key: "sampleData" }, {
        props: {
            ...(selectedObject.value.props || {}),
            sampleData: normalizeMultiLabelSampleData(data),
        },
    });
}
function updateMultiLabelSampleCell(field: any, index: any, key: any, value: any): any {
    const nextData = multiLabelSampleDataValue(field).map((item: any, itemIndex: any): any => itemIndex === index ? { ...item, [key]: value == null ? "" : String(value) } : item);
    setMultiLabelSampleData(nextData);
}
function normalizeFieldValue(field: any, value: any): any {
    if (field.valueType !== "json") {
        return value;
    }
    if (typeof value !== "string") {
        return value;
    }
    const source = value.trim();
    if (!source) {
        return Array.isArray(getFieldValue(field)) ? [] : {};
    }
    try {
        return JSON.parse(source);
    }
    catch (error: any) {
        PdMessage.error(`${field.label} 不是有效 JSON`);
        return Symbol.for("invalid-json");
    }
}
function fieldError(field: any): any {
    return getFieldError(fieldErrors.value, field);
}
function setFieldError(field: any, message: any = ""): any {
    const key = fieldErrorKey(field);
    if (!key) {
        return;
    }
    const next = { ...fieldErrors.value };
    if (message) {
        next[key] = message;
    }
    else {
        delete next[key];
    }
    fieldErrors.value = next;
}
function validateFieldChange(field: any, value: any): any {
    if (!field) {
        return false;
    }
    const message = validateElementProperty(selectedObject.value?.type, field.source, field.key, value);
    setFieldError(field, message || "");
    return !message;
}
function endPropertyEditSession(): any {
    if (propertyEditTimer) {
        clearTimeout(propertyEditTimer);
        propertyEditTimer = null;
    }
    propertyEditSession.value = null;
}
function schedulePropertyEditSessionEnd(): any {
    if (propertyEditTimer) {
        clearTimeout(propertyEditTimer);
    }
    propertyEditTimer = setTimeout(endPropertyEditSession, 600);
}
function propertyEditKey(objectId: any, field: any): any {
    return `${objectId}:${field?.source || "root"}:${field?.key || "property"}`;
}
function isLockSafePatch(patch: any): any {
    const patchKeys = Object.keys(patch || {});
    return patchKeys.length > 0 && patchKeys.every((key: any): any => ["locked", "visible", "printable"].includes(key));
}
function updateSelectedObject(field: any, patch: any): any {
    const object = selectedObject.value;
    if (!object) {
        return false;
    }
    if (object.locked && !isLockSafePatch(patch)) {
        setFieldError(field, "当前元素已锁定，请先解除锁定后再编辑。");
        PdMessage.warning("当前元素已锁定，请先解除锁定后再编辑。");
        return false;
    }
    const key = propertyEditKey(object.id, field);
    const session = propertyEditSession.value;
    if (session?.key === key && historyStore.undoStack.at(-1) === session.command) {
        const updated = documentStore.updateObjectProps(object.id, patch);
        if (!updated) {
            setFieldError(field, "当前元素已锁定，请先解除锁定后再编辑。");
            PdMessage.warning("当前元素已锁定，请先解除锁定后再编辑。");
            return false;
        }
        session.command.setPatch(patch);
        schedulePropertyEditSessionEnd();
        return true;
    }
    endPropertyEditSession();
    const command = createUpdateObjectPropsCommand(documentStore, object.id, patch);
    if (!command) {
        return false;
    }
    executeEditorCommand(historyStore, command);
    propertyEditSession.value = { key, command };
    schedulePropertyEditSessionEnd();
    return true;
}
function setRootValue(key: any, value: any): any {
    if (!selectedObject.value) {
        return;
    }
    const field = { source: "root", key };
    if (!validateFieldChange(field, value)) {
        return;
    }
    updateSelectedObject(field, buildRootUpdatePayload(selectedObject.value, key, value));
}
function setFieldValue(field: any, value: any): any {
    if (!selectedObject.value) {
        return;
    }
    const objectId = selectedObject.value.id;
    const normalizedValue = normalizeFieldValue(field, value);
    if (normalizedValue === Symbol.for("invalid-json")) {
        return;
    }
    if (!validateFieldChange(field, normalizedValue)) {
        return;
    }
    if (field.source === "root") {
        updateSelectedObject(field, buildRootUpdatePayload(selectedObject.value, field.key, normalizedValue));
        return;
    }
    if (field.source === "style") {
        updateSelectedObject(field, {
            style: {
                ...(selectedObject.value.style || {}),
                [field.key]: normalizedValue,
            },
        });
        return;
    }
    if (field.source === "props") {
        if (selectedObject.value.type === "multiLabel") {
            const nextProps = {
                ...(selectedObject.value.props || {}),
                [field.key]: normalizedValue,
            };
            if (field.key === "rows" || field.key === "cols") {
                const total = Math.max(1, Number(nextProps.rows) || 1) * Math.max(1, Number(nextProps.cols) || 1);
                nextProps.sampleData = normalizeMultiLabelSampleData(nextProps.sampleData, total);
            }
            else if (field.key === "sampleData") {
                nextProps.sampleData = normalizeMultiLabelSampleData(normalizedValue);
            }
            updateSelectedObject(field, {
                props: nextProps,
            });
            return;
        }
        updateSelectedObject(field, {
            props: {
                ...(selectedObject.value.props || {}),
                [field.key]: normalizedValue,
            },
        });
        return;
    }
    if (field.source === "editorHints") {
        updateSelectedObject(field, {
            editorHints: {
                ...(selectedObject.value.editorHints || {}),
                [field.key]: normalizedValue,
            },
        });
    }
}
async function runFieldAction(action: any): Promise<any> {
    if (!selectedObject.value) {
        return;
    }
    const objectId = selectedObject.value.id;
    switch (action) {
        case "bringForward":
        case "sendBackward":
        case "bringToFront":
        case "sendToBack":
            documentStore.reorderObject(objectId, action);
            break;
        case "deleteElement":
            if (executeDeleteSelectedObjects([objectId])) {
                selectionStore.clearSelection();
            }
            else {
                PdMessage.warning("当前元素已锁定，无法删除。");
            }
            break;
        case "saveAsTemplate":
            try {
                const { value } = await PdMessageBox.prompt("输入元素预设名称", "保存为元素预设", {
                    inputValue: selectedObject.value.name || "元素预设",
                    inputPattern: /\S/,
                    inputErrorMessage: "请输入预设名称",
                });
                await presetRepository.create({ name: value, element: selectedObject.value });
                PdMessage.success("元素预设已保存，可从顶部“预设”打开并插入。");
            }
            catch (error: any) {
                if (error !== "cancel" && error !== "close") {
                    PdMessage.error(error?.message || "保存元素预设失败");
                }
            }
            break;
        default:
            break;
    }
}
function executeDeleteSelectedObjects(objectIds: any): any {
    const command = createRemoveObjectsCommand(documentStore, objectIds);
    if (!command) {
        return false;
    }
    executeEditorCommand(historyStore, command);
    return true;
}
onBeforeUnmount((): any => {
    endPropertyEditSession();
});
</script>

<style scoped lang="scss">
.element-properties-panel {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow: auto;
  background: #ffffff;
}

.element-properties-panel__multi {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.element-properties-panel__summary,
.element-properties-panel__fallback,
.element-properties-panel__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: var(--pd-panel-bg);
}

.element-properties-panel__summary-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.element-properties-panel__type-tag {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  white-space: nowrap;
}

.element-properties-panel__summary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--pd-muted);
  font-size: 12px;
}

.element-properties-panel__summary-hint {
  margin: 0;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.element-properties-panel__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.element-properties-panel__tab {
  height: 30px;
  border: 1px solid var(--pd-border);
  background: #ffffff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
}

.element-properties-panel__tab.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.element-properties-panel__sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.element-properties-panel__section-head h3 {
  margin: 0;
  color: var(--pd-strong);
  font-size: 13px;
  font-weight: 600;
}

.element-properties-panel__section-body {
  display: grid;
  gap: 12px;
}

.element-properties-panel__section-body.is-stack {
  grid-template-columns: minmax(0, 1fr);
}

.element-properties-panel__section-body.is-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.element-properties-panel__section-body.is-actions-2x2 {
  grid-template-columns: minmax(0, 1fr);
}

.element-properties-panel__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.element-properties-panel__field--switch {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.element-properties-panel__field span,
.element-properties-panel__fallback p {
  font-size: 12px;
  color: #374151;
}

.element-properties-panel__field-error {
  color: #dc2626;
  font-size: 11px;
  line-height: 1.4;
}

.element-properties-panel__field.is-readonly span {
  color: var(--pd-muted);
}

.element-properties-panel__readonly {
  min-height: 32px;
  padding: 7px 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  color: #374151;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
}

.element-properties-panel__action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.element-properties-panel__action-button,
.element-properties-panel__section-button {
  min-height: 34px;
  border: 1px solid var(--pd-border);
  background: #ffffff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
}

.element-properties-panel__section-button.is-danger {
  border-color: #fecaca;
  color: #dc2626;
  background: #fff5f5;
}

.element-properties-panel__button-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-properties-panel__fallback strong {
  font-size: 13px;
  color: var(--pd-strong);
}

.element-properties-panel__fallback p {
  margin: 0;
  line-height: 1.7;
  color: var(--pd-muted);
}

.element-properties-panel__color {
  width: 100%;
  height: 32px;
  border: 1px solid var(--pd-border);
  background: #ffffff;
}

.element-properties-panel__image-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-properties-panel__upload-button {
  margin-top: 2px;
}

.element-properties-panel__file-input {
  display: none;
}

.element-properties-panel__field-help {
  margin-top: -2px;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
  color: var(--pd-subtle);
}

.element-properties-panel__color-row,
.element-properties-panel__copy-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.element-properties-panel__code-card,
.element-properties-panel__advanced-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: #ffffff;
}

.element-properties-panel__code-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--pd-strong);
}

.element-properties-panel__code-card-head strong {
  color: var(--pd-subtle);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.element-properties-panel__code-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-properties-panel__code-preview {
  min-height: 96px;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  background: linear-gradient(180deg, #fff, #fbfdff);
  color: #0f172a;
  font-family: "Cascadia Code", "Consolas", "SFMono-Regular", monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}

.element-properties-panel__image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  padding: 8px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.element-properties-panel__image-preview img {
  display: block;
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
}

.element-properties-panel__table-columns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-properties-panel__table-columns-hint {
  padding: 8px 10px;
  border: 1px dashed var(--pd-border);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.element-properties-panel__table-column-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: #fcfcfd;
}

.element-properties-panel__table-column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.element-properties-panel__table-column-head strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.element-properties-panel__table-column-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.element-properties-panel__table-column-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.element-properties-panel__table-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-properties-panel__table-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-properties-panel__multi-label-data {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-properties-panel__table-rows-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-properties-panel__table-footer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.element-properties-panel__multi-label-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.element-properties-panel__multi-label-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: #fcfcfd;
}

.element-properties-panel__multi-label-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.element-properties-panel__multi-label-card-head strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.element-properties-panel__multi-label-card-head span {
  color: var(--pd-muted);
  font-size: 11px;
}

.element-properties-panel__multi-label-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-properties-panel__table-rows-head,
.element-properties-panel__table-rows-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr)) 72px;
  gap: 8px;
  align-items: start;
}

.element-properties-panel__table-rows-head-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 32px;
  padding: 6px 8px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  color: #374151;
  font-size: 12px;
}

.element-properties-panel__table-rows-head-cell small {
  color: var(--pd-muted);
  font-size: 11px;
}

.element-properties-panel__table-rows-head-cell.is-actions {
  align-items: center;
}

.element-properties-panel__table-empty-state {
  padding: 12px;
  border: 1px dashed var(--pd-border);
  border-radius: 6px;
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  text-align: center;
}

.element-properties-panel__mini-button {
  min-height: 26px;
  padding: 0 8px;
  border: 1px solid var(--pd-border);
  border-radius: 4px;
  background: #ffffff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
}

.element-properties-panel__mini-button.is-danger {
  border-color: #fecaca;
  color: #dc2626;
  background: #fff5f5;
}

.element-properties-panel__mini-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.element-properties-panel--table {
  gap: 0;
  padding: 0 0 12px;
}

.element-properties-panel--table .element-properties-panel__tabs {
  position: sticky;
  top: 0;
  z-index: 1;
  gap: 0;
  padding: 0 10px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.element-properties-panel--table .element-properties-panel__tab {
  height: 40px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
}

.element-properties-panel--table .element-properties-panel__tab.is-active {
  border-color: #2563eb;
  background: transparent;
  color: #2563eb;
}

.element-properties-panel--table .element-properties-panel__sections {
  gap: 0;
  padding: 10px 12px;
}

.element-properties-panel--table .element-properties-panel__section {
  gap: 12px;
  padding: 14px 0;
  border: 0;
  border-bottom: 1px solid #eef2f7;
  background: transparent;
}

.element-properties-panel--table .element-properties-panel__section:last-child {
  border-bottom: 0;
}

.element-properties-panel--table .element-properties-panel__section-head h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.element-properties-panel--table .element-properties-panel__field span {
  color: #4b5563;
}

.element-properties-panel--table .element-properties-panel__button-list {
  padding-top: 8px;
}

.element-properties-panel--table .element-properties-panel__section-button {
  min-height: 34px;
  border-radius: 6px;
}

.element-properties-panel :deep(.pd-input-number),
.element-properties-panel :deep(.pd-input),
.element-properties-panel :deep(.pd-select) {
  width: 100%;
}

.element-properties-panel :deep(.pd-input-number),
.element-properties-panel :deep(.pd-input),
.element-properties-panel :deep(.pd-select) {
  border-radius: var(--pd-radius-control);
}

.element-properties-panel__code-input :deep(.pd-input__control--textarea) {
  font-family: "Cascadia Code", "Consolas", "SFMono-Regular", monospace;
  line-height: 1.5;
}

.element-properties-panel--table :deep(.pd-input-number),
.element-properties-panel--table :deep(.pd-input),
.element-properties-panel--table :deep(.pd-select) {
  border-color: #d1d5db;
}
</style>


