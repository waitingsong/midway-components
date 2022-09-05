import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
  initPathArray,
} from '~/lib/config'
import type { Config, MiddlewareConfig } from '~/lib/types'



export const keys = 123456

export const jwtConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
  secret: '123456abc',
}

export const jwtMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  enableMiddleware: true,
  ignore: [...initPathArray],
  options: {
    ...initMiddlewareOptions,
  },
}

