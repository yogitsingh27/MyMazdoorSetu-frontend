module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  globals: { structuredClone: 'readonly' },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // Project conventions: no prop-types, JSX text may contain apostrophes, no auto display-name.
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    // Keep unused/empty as warnings so they don't fail the build gate.
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-empty': ['warn', { allowEmptyCatch: true }],
  },
};
