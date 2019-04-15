module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ['prettier'],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    console: "readonly",
    process: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'prettier/prettier': ['error'],
    "no-console": "off"
  }
};