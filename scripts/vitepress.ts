import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const [command, ...argumentsForVitePress] = process.argv.slice(2)

if (!command || !['build', 'dev', 'preview'].includes(command)) {
  throw new Error('Usage: tsx scripts/vitepress.ts <build|dev|preview> [...args]')
}

const environment = {
  ...process.env,
  TS_NODE_PROJECT: resolve('tsconfig.postcss.json'),
}
const vitepressCli = resolve('node_modules', 'vitepress', 'bin', 'vitepress.js')

execFileSync(process.execPath, [
  vitepressCli,
  command,
  'docs',
  '--config',
  'docs/.vitepress/config.ts',
  ...argumentsForVitePress,
], { env: environment, stdio: 'inherit' })
