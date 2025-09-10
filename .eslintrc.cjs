module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint','security'],
  extends: ['eslint:recommended','plugin:@typescript-eslint/recommended','plugin:security/recommended','prettier'],
  ignorePatterns: ['.next','dist','node_modules','*.config.*','**/*.d.ts'],
  rules: { 'security/detect-object-injection': 'off' }
};
