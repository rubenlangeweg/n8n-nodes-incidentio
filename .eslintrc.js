module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['plugin:n8n-nodes-base/community'],
  rules: {
    'n8n-nodes-base/node-param-placeholder-miscased-id': 'off',
  },
};
