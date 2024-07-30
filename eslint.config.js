const globals = require('globals')
const pluginJs = require('@eslint/js')
const prettier = require('eslint-plugin-prettier')

module.exports = [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      'no-empty': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'log/', 'public/'],
  },
]
