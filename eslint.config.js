import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      // Allow unused vars that start with underscore
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Strict: no explicit any (upgraded from warn)
      '@typescript-eslint/no-explicit-any': 'error',
      // Allow empty functions (sometimes needed for interfaces)
      '@typescript-eslint/no-empty-function': 'off',
      // Complexity limit
      'complexity': ['warn', 15]
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.js']
  }
);
