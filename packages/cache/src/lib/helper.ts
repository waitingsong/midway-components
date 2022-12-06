import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import type { Context as WebContext } from '@mwcp/share'

import { DecoratorExecutorOptions as ExecutorOptionsCacheable } from './cacheable/types.cacheable'
import { DecoratorExecutorOptions as ExecutorOptionsCacheEvict } from './cacheevict/types.cacheevict'
import { DecoratorExecutorOptions as ExecutorOptionsCachePut } from './cacheput/types.cacheput'
import { initConfig } from './config'
import { CachedResponse, ConfigKey, CacheableArgs, DataWithCacheMeta } from './types'


export interface GenCacheKeyOptions extends Omit<CacheableArgs, 'ttl'> {
  webContext: WebContext
  methodArgs: unknown[]
  methodResult?: unknown
}

export function genCacheKey(options: GenCacheKeyOptions): string {
  const { key, cacheName, webContext, methodArgs, methodResult } = options
  assert(cacheName, 'cacheName is undefined')

  switch (typeof key) {
    case 'string':
      return `${cacheName}:${key}`

    case 'number':
      return `${cacheName}:${key.toString()}`

    case 'bigint':
      return `${cacheName}:${key.toString()}`

    case 'undefined':
      return `${cacheName}` // without tailing `:`

    case 'function': {
      // @ts-expect-error
      const keyStr = key.call(webContext, methodArgs, methodResult)
      assert(
        typeof keyStr === 'string' || typeof keyStr === 'undefined',
        'keyGenerator function must return a string or undefined',
      )
      return typeof keyStr === 'string'
        ? `${cacheName}:${keyStr}`
        : cacheName
    }

    default:
      return cacheName
  }
}

export function genDataWithCacheMeta<T>(
  result: CachedResponse<T>,
  options: GenCacheKeyOptions,
  ttl = initConfig.options.ttl,
): DataWithCacheMeta<T> {

  const data = result.value
  if (typeof data !== 'object' || ! data) {
    return data as DataWithCacheMeta<T>
  }

  const value = {
    cacheKey: genCacheKey(options),
    ttl,
  }
  Object.defineProperty(data, ConfigKey.CacheMetaType, {
    configurable: true, // must be true due to multiple set and object reference
    value,
  })
  return data as DataWithCacheMeta<T>
}


export async function saveData<T>(
  cacheManager: CacheManager,
  cacheKey: string,
  result: T,
  ttl: number,
): Promise<CachedResponse<T>> {

  const data: CachedResponse<T> = {
    CacheMetaType: {
      cacheKey,
      ttl,
    },
    value: result,
  }
  return cacheManager.set(cacheKey, data, { ttl })
}

export async function deleteData(cacheManager: CacheManager, cacheKey: string): Promise<void> {
  await cacheManager.del(cacheKey)
}

export async function getData<T = unknown>(
  cacheManager: CacheManager,
  cacheKey: string,
): Promise<CachedResponse<T>> {

  return cacheManager.get(cacheKey)
}

export function computerConditionValue(
  options: ExecutorOptionsCacheable | ExecutorOptionsCacheEvict | ExecutorOptionsCachePut,
): boolean | Promise<boolean> {

  switch (typeof options.condition) {
    case 'undefined':
      return true

    case 'boolean':
      return options.condition

    case 'function':
      return options.condition.call(
        options.webContext,
        options.methodArgs,
        // @ts-expect-error
        options.methodResult,
      )

    default:
      throw new Error(`Invalid condition type: ${typeof options.condition}`)
  }
}

