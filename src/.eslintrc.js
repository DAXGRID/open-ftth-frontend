module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'], // Extending React-specific rules
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Enable JSX parsing
    },
    ecmaVersion: 12, // Use ECMAScript 2021
    sourceType: 'module', // Use ES modules
  },
  plugins: ['react'], // Enable React-specific plugins
  rules: {
    'no-unused-vars': 'error',
    'react/react-in-jsx-scope': 'off', // Not needed we are using React 17+
  },
};
