/** @type {import('eslint').Linter.Config} */
module.exports = [
  {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
      },
    },
  },
  {
    files: ["server.js", "test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        Buffer: "readonly",
      },
    },
  },
  {
    files: ["**/*.js"],
    ignores: ["eslint.config.js", "server.js", "test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        location: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        AbortController: "readonly",
        requestAnimationFrame: "readonly",
        Audio: "readonly",
        localStorage: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
];
