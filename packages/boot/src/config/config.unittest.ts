import { initPathArray } from '@mwcp/jwt'

import { AppConfig } from '##/lib/index.js'


// use for cookie sign key, should change to your own and keep security
export const keys = Math.random().toString()

const jwtIgnoreArr = [
  ...initPathArray,
  '/_info', // https://www.npmjs.com/package/@midwayjs/info
  '/hello',
  '/ip',
  '/test/err',
  '/test/array',
  '/test/blank',
  '/test/empty',
  '/test/fetch',
  '/test/_fetch_target',
  '/test/no_output',
  '/test/sign',
  /debug\/dump\/.*/u,
  /unittest/u,
  '/_boot/hello',
]
export const jwtMiddlewareConfig: AppConfig['jwtMiddlewareConfig'] = {
  enableMiddleware: true,
  ignore: jwtIgnoreArr,
}

