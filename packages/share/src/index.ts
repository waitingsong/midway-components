import deepmerge from 'deepmerge'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export * from './util/index.util.js'
export * from './middleware/index.middleware.js'

export {
  genAbsolutePath,
  genCurrentDirname,
  genCurrentFilename,
  genISO8601String,
} from '@waiting/shared-core'
export type { MiddlewarePathPattern } from '@waiting/shared-types'

export { deepmerge }

export { Config as MConfig } from '@midwayjs/core'

