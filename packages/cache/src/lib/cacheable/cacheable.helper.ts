import assert from 'node:assert'

import { initCacheableArgs } from '../config.js'
// import { processEx } from '../exception.js'
import {
  computerReadConditionValue,
  computerTTLValue,
  computerWriteConditionValue,
  genCacheKey,

  genDataWithCacheMeta,
  getData,
  saveData,
} from '../helper.js'
import type { GenCacheKeyOptions } from '../helper.js'
import type { CacheableArgs, CachedResponse, DecoratorExecutorOptions } from '../types.js'


export async function before(options: DecoratorExecutorOptions<CacheableArgs<undefined>>): Promise<void> {
  const {
    mergedDecoratorParam,
    cachingFactory,
    cachingInstanceId,
    instance,
  } = options

  const mergedDecoratorParam2: CacheableArgs = {
    ...initCacheableArgs,
    ...mergedDecoratorParam,
  }
  const opts2: GenCacheKeyOptions = {
    key: mergedDecoratorParam2.key,
    cacheName: mergedDecoratorParam2.cacheName,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    instance,
  }
  const cacheKey = genCacheKey(opts2)
  options.mergedDecoratorParam = mergedDecoratorParam2
  options.cacheKey = cacheKey

  const tmp = computerReadConditionValue(options)
  const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
  assert(typeof enableCache === 'boolean', 'condition must return boolean')

  let cacheResp: CachedResponse | undefined = void 0
  if (enableCache && cacheKey) {
    const caching = cachingFactory.get(cachingInstanceId)
    cacheResp = await getData(caching, cacheKey, options.traceService, mergedDecoratorParam2.traceLogCacheHit)
  }

  if (typeof cacheResp !== 'undefined') {
    const resp = genDataWithCacheMeta(cacheResp, opts2)
    options.methodResult = resp
  }
}

export async function around(options: DecoratorExecutorOptions<CacheableArgs<undefined>>): Promise<unknown> {
  const {
    cacheKey,
  } = options

  if (options.methodResult) {
    return options.methodResult
  }

  const { method, methodArgs, methodIsAsyncFunction } = options
  assert(methodIsAsyncFunction, 'decorated method must be async function')

  assert(method, 'original method invalid')
  const resp = await method(...methodArgs)
  const ttl = await computerTTLValue(resp as CachedResponse, options)

  const tmp2 = computerWriteConditionValue(options)
  const enableCache2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
  assert(typeof enableCache2 === 'boolean', 'write condition must return boolean')
  if (enableCache2 && cacheKey && ttl > 0 && typeof resp !== 'undefined') {
    const { cachingFactory, cachingInstanceId } = options
    const caching = cachingFactory.get(cachingInstanceId)
    await saveData(caching, cacheKey, resp, ttl)
  }

  return resp
}

