module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb-typescript', 'prettier', 'plugin:import/recommended', 'plugin:import/typescript'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['import', 'simple-import-sort', 'react-hooks', 'react'],
  ignorePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx', 'setupTests.ts'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
    'import/extensions': ['.ts', '.tsx', '.js', '.jsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never', // не требует .ts для TS файлов
        tsx: 'never', // не требует .tsx для TSX файлов
        js: 'never',
        jsx: 'never',
      },
    ],
    'import/no-unresolved': 'off',
    'simple-import-sort/exports': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Packages. react related packages come first.
          ['^react', '^redux', '^@?\\w'],
          ['App|index'],
          ['^(@/contexts)(/.*|$)', '^(@/hooks)(/.*|$)', '^(@/lib)(/.*|$)', '^(@/services)(/.*|$)', '^(@/types)(/.*|$)'],

          ['^(@/components)(/.*|$)'],

          // Side effect imports.
          ['^\\u0000'],
          // Parent imports. Like ..
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and .
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^(\\./styled/?)((/.*|$))', '^(\\./types/?)((/.*|$))'],
        ],
      },
    ],
    'react/jsx-filename-extension': 'off',
    'import/newline-after-import': 'error',
    'import/no-default-export': 'off',
    'import/no-named-as-default': 'off',
    'no-param-reassign': ['error', { props: false }],
    'react/require-default-props': 'off',
    'react/prop-types': 0,
    'react/jsx-curly-brace-presence': 'error',
    'require-default-props': 'off',
    'no-use-before-define': 'off',
    'prefer-destructuring': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    curly: ['warn', 'all'],
    'no-nested-ternary': 2,
    'array-bracket-spacing': 'warn',
    'brace-style': ['warn', '1tbs'],
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'arrow-body-style': 'warn',
    'no-restricted-imports': [
      'error',
      {
        name: 'react-router-dom',
        importNames: ['matchPath'],
        message: 'Use matchPathWithBasename from core-ui instead.',
      },
    ],
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
    ],
  },
};
