import assert from 'node:assert'
import { createHash } from 'node:crypto'

import type { CacheManager } from '@midwayjs/cache'
import {
  // INJECT_CUSTOM_METHOD,
  REQUEST_OBJ_CTX_KEY,
  getClassMetadata,
} from '@midwayjs/core'
import type { TraceService } from '@mwcp/otel'
import type {
  AroundFactoryOptions,
  Context as WebContext,
} from '@mwcp/share'

import { initCacheableArgs, initCacheEvictArgs, initConfig } from './config'
import {
  CacheableArgs,
  CachedResponse,
  CacheEvictArgs,
  CacheTTLFn,
  Config,
  ConfigKey,
  DataWithCacheMeta,
  DecoratorExecutorOptions,
} from './types'


const md5 = createHash('md5')

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
  defaultTTL = initConfig.options.ttl,
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
  traceService?: TraceService,
): Promise<CachedResponse<T>> {

  const ret = await cacheManager.get(cacheKey) as CachedResponse<T> | undefined
  if (traceService?.isStarted && ret?.CacheMetaType) {
    traceService.addEvent(void 0, {
      event: 'cache.hit',
      library: '@mwcp/cache',
      CacheMetaType: JSON.stringify(ret.CacheMetaType),
    })
  }
  return ret as CachedResponse<T>
}

export function computerConditionValue(
  options: DecoratorExecutorOptions<CacheableArgs | CacheEvictArgs>,
): boolean | Promise<boolean> {

  const { argsFromMethodDecorator: cacheOptions } = options
  assert(cacheOptions, 'cacheOptions is undefined')

  const webContext = options.instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  switch (typeof cacheOptions['condition']) {
    case 'undefined':
      return true

    case 'boolean':
      return cacheOptions['condition']

    case 'function': {
      const fn = cacheOptions['condition'] as (...args: unknown[]) => boolean | Promise<boolean>
      return fn.call(
        webContext,
        options.methodArgs,
        options.methodResult,
      )
    }

    default:
      throw new Error(`Invalid condition type: ${typeof cacheOptions['condition']}`)
  }
}

export function computerTTLValue(
  result: CachedResponse<unknown>,
  options: DecoratorExecutorOptions<CacheableArgs>,
): number | Promise<number> {

  const { argsFromMethodDecorator: cacheOptions } = options
  assert(cacheOptions, 'cacheOptions is undefined')

  const webContext = options.instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  let ttl = 10

  switch (typeof cacheOptions['ttl']) {
    case 'undefined':
      ttl = +initConfig.options.ttl
      break

    case 'number':
      ttl = Number.isNaN(cacheOptions['ttl']) ? ttl : +cacheOptions['ttl']
      break

    case 'function': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = cacheOptions['ttl'] as CacheTTLFn<any>
      return fn.call(
        webContext,
        options.methodArgs,
        result,
      )
    }

    default:
      throw new Error(`Invalid ttl type: ${typeof cacheOptions['ttl']}`)
  }

  assert(typeof ttl === 'number', 'ttl is not a number')
  assert(ttl >= 0, 'ttl must be greater than or equal to 0')
  return ttl
}

export function genDecoratorExecutorOptions<TDecoratorArgs extends CacheableArgs | CacheEvictArgs>(
  options: AroundFactoryOptions<TDecoratorArgs>,
): DecoratorExecutorOptions<TDecoratorArgs> {

  const {
    decoratorKey,
    joinPoint,
    aopCallbackInputOptions,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config,
    cacheManager,
  } = options
  assert(config, 'config is undefined')
  assert(cacheManager, 'cacheManager is undefined')

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = joinPoint.target
  const funcName = joinPoint.methodName as string
  assert(funcName, 'funcName is undefined')

  const ret = genDecoratorExecutorOptionsCommon<TDecoratorArgs>({
    decoratorKey,
    cacheManager: cacheManager as CacheManager,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    instance,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    method: joinPoint.proceed,
    methodName: funcName,
    methodArgs: joinPoint.args,
    argsFromClassDecorator: void 0,
    argsFromMethodDecorator: aopCallbackInputOptions.metadata,
  })

  return ret
}


export function genDecoratorExecutorOptionsCommon<T extends CacheableArgs | CacheEvictArgs>(
  options: DecoratorExecutorOptions<T>,
): DecoratorExecutorOptions<T> {

  const {
    decoratorKey,
    cacheManager,
    argsFromMethodDecorator,
    config: configArgs,
    instance,
    method,
    methodName,
    methodArgs,
  } = options
  assert(instance, 'options.instance is undefined')
  assert(typeof method === 'function', 'options.method is not funtion')

  const webContext = instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const app = webContext.app ?? instance.app
  assert(app, 'application undefined, may test case not set app to instance')
  const config = (configArgs ?? app.getConfig(ConfigKey.config) ?? initConfig) as Config

  const className = instance.constructor.name
  assert(className, 'instance.constructor.name is undefined')
  assert(methodName, 'methodName is undefined')


  const argsFromClassDecorator = getClassMetadata<T>(decoratorKey, instance)
  // const arr = getClassMetadata<T>(INJECT_CUSTOM_METHOD, instance)
  // void arr

  const cacheOptions: CacheableArgs | CacheEvictArgs = {
    ...initCacheableArgs,
    ...initCacheEvictArgs,
    ttl: config.options.ttl,
    ...argsFromClassDecorator,
    ...argsFromMethodDecorator,
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof cacheOptions.cacheName === 'undefined' || ! cacheOptions.cacheName) {
    const cacheName = `${className}.${methodName}`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    cacheOptions.cacheName = cacheName
  }

  const ret: DecoratorExecutorOptions = {
    decoratorKey,
    cacheManager,
    config,
    argsFromClassDecorator,
    argsFromMethodDecorator: cacheOptions,
    instance,
    method,
    methodArgs,
    methodName,
  }
  return ret as DecoratorExecutorOptions<T>
}

