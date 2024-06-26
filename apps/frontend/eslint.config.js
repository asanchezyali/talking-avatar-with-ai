import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";

export default {
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,jsx}"],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
        globals: globals.browser,
      },
      ...pluginJs.configs.recommended,
      ...fixupConfigRules(pluginReactConfig),
    },
  ],
  rules: {
    "react/no-unknown-property": "off",
    "no-undef": "error",
    "no-unused-vars": "error",
  },
};
