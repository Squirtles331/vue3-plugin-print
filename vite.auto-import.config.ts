import AutoImport from 'unplugin-auto-import/vite'

export function createAutoImportPlugin() {
  return AutoImport({
    imports: ['vue', 'pinia'],
    dts: './auto-imports.d.ts',
    dtsMode: 'overwrite',
    eslintrc: {
      enabled: false,
    },
  })
}
