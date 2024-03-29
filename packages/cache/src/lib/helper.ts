import assert from 'node:assert'
import { createHash } from 'node:crypto'

import { CachingFactory, MidwayUnionCache } from '@midwayjs/cache-manager'
import {
  // INJECT_CUSTOM_METHOD,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'
import { AbstractTraceService, OtelConfigKey } from '@mwcp/otel'
import { DecoratorExecutorParamBase, PagingDTO, Context as WebContext } from '@mwcp/share'

import { initCacheableArgs, initCacheEvictArgs, initCacheManagerOptions } from './config.js'
import {
  CacheableArgs,
  CachedResponse,
  CacheEvictArgs,
  CacheTTLFn,
  Config,
  ConfigKey,
  DataWithCacheMeta,
  DecoratorExecutorOptions,
} from './types.js'


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
      return cacheName // without tailing `:`

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

export function genCacheKeyFromPagingDTO(options: PagingDTO): string {
  assert(options, 'options PagingDTO is undefined')
  assert(options.page >= 1, 'PagingDTO.page must be greater than or equal to 1')
  assert(options.pageSize >= 1, 'PagingDTO.pageSize must be greater than or equal to 1')

  let key = `${options.page}-${options.pageSize}-`
  if (options.orderBy && options.orderBy.length > 0) {
    key += JSON.stringify(options.orderBy)
  }
  return key
}

export interface HashedCacheKey {
  cacheKey: string
  cacheKeyHash: string | undefined
}
export function hashCacheKey(key: string, activeLength = 48): HashedCacheKey {
  assert(key && key.length > 0, 'key is empty')

  const ret: HashedCacheKey = { cacheKey: key, cacheKeyHash: void 0 }
  if (key.length <= activeLength) {
    return ret
  }
  const md5 = createHash('md5')
  const hash = md5.update(key).digest('hex')

  const str = key.split('.').at(0)
  const input = str && str.length < 16
    ? str
    : key.slice(0, 15)

  ret.cacheKeyHash = `${input}.${hash}`
  return ret
}

export function genDataWithCacheMeta<T>(
  result: CachedResponse<T>,
  options: GenCacheKeyOptions,
  defaultTTL = initCacheManagerOptions.options.ttl,
): DataWithCacheMeta<T> {

  const data = result.value
  if (typeof data !== 'object' || ! data) {
    return data as DataWithCacheMeta<T>
  }

  const { CacheMetaType } = result
  const value = {
    cacheKey: genCacheKey(options),
    ttl: CacheMetaType?.ttl ?? defaultTTL,
  }
  Object.defineProperty(data, ConfigKey.CacheMetaType, {
    configurable: true, // must be true due to multiple set and object reference
    value,
  })
  return data as DataWithCacheMeta<T>
}


export async function saveData<T>(
  caching: MidwayUnionCache,
  cacheKey: string,
  result: T,
  /** In Second */
  ttl: number,
): Promise<CachedResponse<T>> {

  const keys = hashCacheKey(cacheKey)

  const data: CachedResponse<T> = {
    CacheMetaType: {
      ...keys,
      ttl,
    },
    value: result,
  }
  await caching.set(keys.cacheKeyHash ?? keys.cacheKey, data, ttl * 1000)
  return data
}

export async function deleteData(caching: MidwayUnionCache, cacheKey: string): Promise<void> {
  const keys = hashCacheKey(cacheKey)
  await caching.del(keys.cacheKeyHash ?? keys.cacheKey)
}

export async function getData<T = unknown>(
  caching: MidwayUnionCache,
  cacheKey: string,
  traceService?: AbstractTraceService | undefined,
): Promise<CachedResponse<T>> {

  const keys = hashCacheKey(cacheKey)

  const ret = await caching.get(keys.cacheKeyHash ?? keys.cacheKey)
  // @ts-expect-error
  if (traceService?.isStarted && ret?.CacheMetaType) {
    traceService.addEvent(void 0, {
      event: 'cache.hit',
      library: '@mwcp/cache',
      // @ts-expect-error
      CacheMetaType: JSON.stringify(ret.CacheMetaType),
    })
  }
  return ret as Promise<CachedResponse<T>>
}

export function computerConditionValue(options: DecoratorExecutorOptions<CacheableArgs | CacheEvictArgs>): boolean | Promise<boolean> {

  const { mergedDecoratorParam: cacheOptions } = options
  assert(cacheOptions, 'cacheOptions is undefined within computerConditionValue()')

  const webContext = options.instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  switch (typeof cacheOptions.condition) {
    case 'undefined':
      return true

    case 'boolean':
      return cacheOptions.condition

    case 'function': {
      const fn = cacheOptions.condition as (...args: unknown[]) => boolean | Promise<boolean>
      return fn.call(
        webContext,
        options.methodArgs,
        options.methodResult,
      )
    }

    default:
      throw new Error(`Invalid condition type: ${typeof cacheOptions.condition}`)
  }
}

export function computerTTLValue(
  result: CachedResponse<unknown>,
  options: DecoratorExecutorOptions<CacheableArgs>,
): number | Promise<number> {

  const { mergedDecoratorParam: cacheOptions } = options
  assert(cacheOptions, 'cacheOptions is undefined within computerTTLValue()')

  const webContext = options.instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  let ttl = 10 // second

  switch (typeof cacheOptions.ttl) {
    case 'undefined':
      ttl = +initCacheManagerOptions.options.ttl
      break

    case 'number':
      ttl = Number.isNaN(cacheOptions.ttl) ? ttl : +cacheOptions.ttl
      break

    case 'function': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = cacheOptions.ttl as CacheTTLFn<any>
      return fn.call(
        webContext,
        options.methodArgs,
        result,
      )
    }

    default:
      throw new Error(`Invalid ttl type: ${typeof cacheOptions.ttl}`)
  }

  assert(typeof ttl === 'number', 'ttl is not a number')
  assert(ttl >= 0, 'ttl must be greater than or equal to 0')
  return ttl
}

export function genDecoratorExecutorOptions(options: DecoratorExecutorParamBase<CacheableArgs | CacheEvictArgs>): DecoratorExecutorOptions<CacheableArgs | CacheEvictArgs> {

  const {
    webApp,
    webContext,
    decoratorKey,
    instance,
    method,
    methodName,
    mergedDecoratorParam,
    instanceName,
  } = options

  assert(webApp, 'webApp is undefined')
  assert(webContext, 'webContext is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')
  assert(instance, 'options.instance is undefined')
  assert(typeof method === 'function', 'options.method is not function')
  assert(instanceName, 'instanceName is undefined')
  assert(methodName, 'methodName is undefined')

  const configManagerConfig = webApp.getConfig(ConfigKey.config) as Config
  assert(configManagerConfig, 'cacheManager config is undefined')

  const cacheOptions: CacheableArgs = {
    ...initCacheableArgs,
    ...initCacheEvictArgs,
    ...mergedDecoratorParam,
  }
  // @FIXME
  // if (typeof cacheOptions.ttl === 'undefined') {
  //   cacheOptions.ttl = configManagerConfig.options.ttl
  // }

  if (typeof cacheOptions.cacheName === 'undefined' || ! cacheOptions.cacheName) {
    const cacheName = `${instanceName}.${methodName}`
    cacheOptions.cacheName = cacheName
  }

  const { cachingFactory } = options
  assert(cachingFactory, 'midway cachingFactory is undefined')
  const traceService = webContext[`_${OtelConfigKey.componentName}`] as AbstractTraceService | undefined

  const ret: DecoratorExecutorOptions<CacheableArgs | CacheEvictArgs> = {
    ...options,
    cachingFactory: cachingFactory as CachingFactory,
    config: configManagerConfig,
    mergedDecoratorParam: cacheOptions,
    traceService,
  }
  return ret
}

