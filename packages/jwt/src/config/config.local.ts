
import { initialConfig } from '##/lib/config.js'
import { Config } from '##/lib/types.js'


export const keys = 123456

export const jwtConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
}

