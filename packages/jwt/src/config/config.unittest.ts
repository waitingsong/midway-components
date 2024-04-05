import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
  initPathArray,
} from '##/lib/config.js'
import {
  ConfigKey,
  type Config,
  type MiddlewareConfig,
} from '##/lib/types.js'


export const koa = {
  port: 7002,
}
export const keys = 123456

export const jwtConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
  secret: '123456abc',
}

export const jwtMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  enableMiddleware: true,
  ignore: [
    ...initPathArray,
    `/_${ConfigKey.namespace}/hello`,
    // /\/test\/.*/u, // do not add, this path will be used for unit test
  ],
  options: {
    ...initMiddlewareOptions,
  },
}

