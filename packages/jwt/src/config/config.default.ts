import { Config, JwtMiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
} from '../lib/config'


export const jwtConfig: Config = {
  ...initialConfig,
}

export const jwtMiddlewareConfig: JwtMiddlewareConfig = {
  ...initialMiddlewareConfig,
}

