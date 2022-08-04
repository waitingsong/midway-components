import { Config, MiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
  initPathArray,
} from '../lib/config'


export const jwtConfig: Config = {
  ...initialConfig,
}

export const jwtMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [...initPathArray],
  options: {
    ...initMiddlewareOptions,
  },
}

