import deepmerge from 'deepmerge'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export * from './util/common.js'

export {
  genAbsolutePath,
  genCurrentDirname,
  genCurrentFilename,
  genISO8601String,
} from '@waiting/shared-core'

export { deepmerge }


