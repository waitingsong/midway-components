import { initPathArray } from '@mwcp/jwt'

import { AppConfig } from '~/index'


const jwtIgnoreArr = [
  ...initPathArray,
  '/hello',
  '/_base/hello',
]
export const jwtMiddlewareConfig: AppConfig['jwtMiddlewareConfig'] = {
  enableMiddleware: true,
  ignore: jwtIgnoreArr,
}

