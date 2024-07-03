import eslint from 'typescript-eslint'

import srcConfig from '@waiting/eslint-config'
import testConfig from '@waiting/eslint-config/test'
import { genCurrentDirname, genModuleAbsolutePathIfExists } from '@waiting/shared-core'


const projectDir = genCurrentDirname(import.meta.url)

const srcRules = {
  'import/no-extraneous-dependencies': [0, {
    devDependencies: false,
    optionalDependencies: false,
    bundledDependencies: false,
    packageDir: [
      '.',
      await genModuleAbsolutePathIfExists(projectDir, 'node_modules/@waiting/shared-core') ?? '.',
      await genModuleAbsolutePathIfExists(projectDir, 'node_modules/@mwcp/share') ?? '.',
    ],
  }],
  '@typescript-eslint/no-dynamic-delete': 0,
}
const testRules = {
  '@typescript-eslint/no-explicit-any': 0,
  '@typescript-eslint/dot-notation': 0,
  '@typescript-eslint/no-unsafe-assignment': 0,
}

const languageOptions = {
  parserOptions: {
    // project: 'tsconfig.eslint.json',
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.eslint.json'],
    tsconfigRootDir: import.meta.dirname,
  },
}

export default eslint.config(
  {
    files: ['packages/*/src/**/*.ts', 'src/**/*.ts', 'packages/*/demo/**/*.mts' , 'packages/*/demo/**/*.ts'],
    extends: [
      ...srcConfig,
    ],
    rules: srcRules,
    languageOptions,
  },
  {
    files: ['packages/*/test/**/*.ts', 'test/**/*.ts'],
    extends: [
      ...testConfig,
    ],
    rules: testRules,
    languageOptions,
  }
)

