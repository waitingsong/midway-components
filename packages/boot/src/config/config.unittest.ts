import { initPathArray } from '@mwcp/jwt'

import { AppConfig } from '~/index'


const jwtIgnoreArr = [
  ...initPathArray,
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
  '/_base/hello',
]
export const jwtMiddlewareConfig: AppConfig['jwtMiddlewareConfig'] = {
  enableMiddleware: true,
  ignore: jwtIgnoreArr,
}

