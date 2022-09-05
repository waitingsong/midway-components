import { NetworkInterfaceInfo, networkInterfaces } from 'os'

import { Application, Context, requestPathMatched } from '@mwcp/share'

import {
  initialMiddlewareConfig,
  initialConfig,
  initMiddlewareOptions,
} from '../lib/config'
import { Config, ConfigKey, MiddlewareConfig } from '../lib/types'


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

  const pConfig = getConfigFromApp<T>(app, key)
  const config = mergeConfig<T>(pConfig)
  return config
}

export function getMiddlewareConfig<T extends MiddlewareConfig = MiddlewareConfig>(
  app: Application,
  key: ConfigKey = ConfigKey.middlewareConfig,
): T {

  const pConfig = getConfigFromApp<T>(app, key)
  const config = mergeMiddlewareConfig<T>(pConfig)
  return config
}

function getConfigFromApp<T>(app: Application, key: ConfigKey): T {
  const config = app.getConfig(key) as T
  return config
}


export function mergeConfig<T extends Config = Config>(input?: Partial<Config>): T {
  const ret: T = {
    ...initialConfig,
    ...input,
  } as T
  return ret
}

export function mergeMiddlewareConfig<T extends MiddlewareConfig = MiddlewareConfig>(input?: T): T {
  const ret = {
    ...initialMiddlewareConfig,
    options: {
      ...initMiddlewareOptions,
    },
  } as T

  if (! input) {
    return ret
  }

  if (typeof input.enableMiddleware === 'boolean') {
    ret.enableMiddleware = input.enableMiddleware
  }

  const { match, ignore } = input
  if (Array.isArray(match) && match.length) {
    ret.match = match
  }
  else if (Array.isArray(ignore) && ignore.length) {
    ret.ignore = ignore
  }

  const { options } = input
  if (typeof options !== 'undefined') {
    const opts = {
      ...initMiddlewareOptions,
      ...options,
    }
    ret.options = opts
  }

  return ret
}


/**
 * 获取网络信息，不包括回环地址信息
 */
export function retrieveExternalNetWorkInfo(): NetworkInterfaceInfo[] {
  return Object.entries(networkInterfaces()).reduce(
    (acc: NetworkInterfaceInfo[], curr) => {
      const [, nets] = curr
      /* istanbul ignore if */
      if (! nets) {
        return acc
      }
      nets.forEach((net) => {
        // Skip over internal (i.e. 127.0.0.1) addresses
        if (! net.internal) {
          acc.push(net)
        }
      })
      return acc
    },
    [],
  )
}

export const netInfo = retrieveExternalNetWorkInfo()

