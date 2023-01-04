/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert'

import type { CacheManager } from '@midwayjs/cache'
import { JoinPoint, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'

import type { DecoratorExecutorOptions as ExecutorOptionsCacheable } from './cacheable/types.cacheable'
import type { DecoratorExecutorOptions as ExecutorOptionsCacheEvict } from './cacheevict/types.cacheevict'
import type { DecoratorExecutorOptions as ExecutorOptionsCachePut } from './cacheput/types.cacheput'
import { initConfig } from './config'
import {
  CacheableArgs,
  CachedResponse,
  Config,
  ConfigKey,
  DataWithCacheMeta,
  MetaDataType,
} from './types'


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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        options.methodResult,
      )

    default:
      throw new Error(`Invalid condition type: ${typeof options.condition}`)
  }
}

interface ExecutorOptionsCacheCommon {
  cacheName: string | undefined
  key: any
  beforeInvocation: boolean
  ttl: any
  condition: any
  method: (...args: unknown[]) => unknown
  methodArgs: unknown[]
  methodResult?: any
  webContext: WebContext
}

export function genDecoratorExecutorOptions(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType<ExecutorOptionsCacheCommon>,
  config: Config,
  cacheManager: CacheManager,
): ExecutorOptionsCacheCommon {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = joinPoint.target

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext
  assert(webContext, 'webContext is undefined')

  const {
    cacheName: cacheNameArg,
    key: keyArg,
    ttl: ttlArg,
    beforeInvocation,
    condition,
  } = metaDataOptions.metadata
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const className = (instance.constructor?.name ?? metaDataOptions.target.name) as string
  const funcName = joinPoint.methodName as string
  assert(className, 'className is undefined')
  assert(funcName, 'funcName is undefined')

  const cacheName = cacheNameArg ?? `${className}.${funcName}`
  const key = keyArg
  const ttl = ttlArg ?? config.options.ttl

  const ret = {
    beforeInvocation: !! beforeInvocation,
    cacheManager,
    cacheName,
    key,
    ttl,
    condition,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    method: joinPoint.proceed,
    methodArgs: joinPoint.args,
    webContext,
  }
  return ret
}

