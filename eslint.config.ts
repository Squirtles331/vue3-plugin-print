import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    stylistic: true,
    typescript: true,
    vue: true,
    ignores: ['.tmp/**', 'openspec/**'],
  },
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'prefer-promise-reject-errors': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'style/max-statements-per-line': 'off',
      'style/no-mixed-operators': 'off',
      'ts/ban-ts-comment': ['error', {
        'ts-check': true,
        'ts-expect-error': true,
        'ts-ignore': true,
        'ts-nocheck': true,
      }],
      'ts/no-explicit-any': 'error',
      'ts/explicit-function-return-type': 'off',
      'ts/no-use-before-define': 'off',
      'unused-imports/no-unused-vars': 'off',
      'vue/custom-event-name-casing': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/prop-name-casing': 'off',
      'vue/require-default-prop': 'off',
    },
  },
)
