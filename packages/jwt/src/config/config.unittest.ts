
import { initialJwtMiddlewareConfig } from '../lib/config'

import { JwtConfig } from '~/lib'


export const jwtConfig: JwtConfig = {
  secret: '123456abc',
}

export const jwtMiddlewareConfig = {
  ...initialJwtMiddlewareConfig,
}

