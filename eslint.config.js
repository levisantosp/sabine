import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    '**/test*',
    'dist',
    'scripts',
    'prisma.config.js'
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  { 
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  {
    rules: {
      indent: ['error', 2, {
        ignoredNodes: ['CallExpression > MemberExpression'],
        SwitchCase: 1
      }],
      quotes: ['error', 'single'],
      'keyword-spacing': ['error', {
        before: true,
        after: true,
        overrides: {
          if: { after: false },
          for: { after: false },
          while: { after: false },
          switch: { after: false },
        }
      }],
      'space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'never'
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off'
    }
  }
])