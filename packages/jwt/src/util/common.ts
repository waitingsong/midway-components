import { Application, Context, requestPathMatched } from '@mwcp/share'

import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from '../lib/types'


/**
 * Return true if rules of match and ignore empty
 */
export function matchFunc(ctx?: Context): boolean {
  if (! ctx) {
    return false
  }

  const mwConfig = getMiddlewareConfig(ctx.app)
  return requestPathMatched(ctx.path, mwConfig)
}


export function getComponentConfig<T extends Config = Config>(
  app: Application,
  key: ConfigKey = ConfigKey.config,
): T {

  const config = getConfigFromApp<T>(app, key)
  return config
}

export function getMiddlewareConfig<T extends MiddlewareConfig = MiddlewareConfig>(
  app: Application,
  key: ConfigKey = ConfigKey.middlewareConfig,
): T {

  const config = getConfigFromApp<T>(app, key)
  return config
}

function getConfigFromApp<T>(app: Application, key: ConfigKey): T {
  const config = app.getConfig(key) as T
  return config
}

