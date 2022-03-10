import { isPathMatchRules } from '@waiting/shared-core'

import { Config, MiddlewareConfig } from '../index'
import {
  ConfigKey,
  initialMiddlewareConfig,
  initialConfig,
  initMiddlewareOptions,
} from '../lib/config'

import { Application, Context } from '~/interface'


/**
 * Return true if rules of match and ignore empty
 */
export function matchFunc(ctx?: Context): boolean {
  if (! ctx) {
    return false
  }

  const mwConfig = getMiddlewareConfigFromApp(ctx.app)
  const { enableMiddleware, match, ignore } = mwConfig

  if (! enableMiddleware) {
    return false
  }

  if (Array.isArray(ignore) && ignore.length) {
    const matched = isPathMatchRules(ctx.path, ignore)
    return ! matched
  }
  else if (Array.isArray(match) && match.length) {
    const matched = isPathMatchRules(ctx.path, ignore)
    return matched
  }
  else {
    return true
  }
}


export function getConfigFromApp<T = Config>(
  app: Application,
  key: ConfigKey = ConfigKey.config,
): T {

  const pConfig = getConfig<Partial<T>>(app, key)
  const config = mergeConfig<T>(pConfig)
  return config
}

export function getMiddlewareConfigFromApp<T = MiddlewareConfig>(
  app: Application,
  key: ConfigKey = ConfigKey.middlewareConfig,
): T {

  const pConfig = getConfig<Partial<T>>(app, key)
  const config = mergeMiddlewareConfig<T>(pConfig)
  return config
}

export function getConfig<T>(app: Application, key: ConfigKey): T {
  const config = app.getConfig(key) as T
  return config
}


export function mergeConfig<T = Config>(input?: Partial<Config>): T {
  const ret: T = {
    ...initialConfig,
    ...input,
  }
  return ret
}

export function mergeMiddlewareConfig<T = MiddlewareConfig>(input?: Partial<MiddlewareConfig>): T {
  if (! input) {
    // return { ...initialMiddlewareConfig }
    const mwConfig: T = {
      ...initialMiddlewareConfig,
      options: {
        ...initMiddlewareOptions,
      },
    }
    return mwConfig
    // return {
    //   ...initialMiddlewareConfig,
    //   ...jwtMiddlewareConfig,
    // }
  }

  const enableMiddleware = typeof input.enableMiddleware === 'boolean'
    ? input.enableMiddleware
    : initialMiddlewareConfig.enableMiddleware

  const { match, ignore } = input
  if (Array.isArray(match) && match.length) {
    const ret = {
      enableMiddleware,
      match,
    }
    return ret
  }
  else if (Array.isArray(ignore) && ignore.length) {
    const ret = {
      enableMiddleware,
      ignore,
    }
    return ret
  }
  else {
    const ret = {
      enableMiddleware,
      ignore: initialMiddlewareConfig.ignore,
    }
    return ret
  }
}

