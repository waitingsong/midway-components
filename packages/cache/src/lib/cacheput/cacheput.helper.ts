import assert from 'assert'

import { initCachePutArgs } from '../config.js'
import {
  computerReadConditionValue,
  computerTTLValue,
  computerWriteConditionValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  saveData,
} from '../helper.js'
import { CacheableArgs, CachedResponse, DecoratorExecutorOptions } from '../types.js'


export async function before(options: DecoratorExecutorOptions<CacheableArgs<undefined>>): Promise<void> {
  const { webContext, mergedDecoratorParam } = options
  assert(webContext, 'webContext is undefined')

  const mergedDecoratorParam2: CacheableArgs = {
    ...initCachePutArgs,
    ...mergedDecoratorParam,
  }

  const opts2: GenCacheKeyOptions = {
    key: mergedDecoratorParam2.key,
    cacheName: mergedDecoratorParam2.cacheName,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    webContext,
  }
  const cacheKey = genCacheKey(opts2)
  options.mergedDecoratorParam = mergedDecoratorParam2
  options.cacheKey = cacheKey
}

export async function decoratorExecutor(options: DecoratorExecutorOptions<CacheableArgs>): Promise<unknown> {
  const {
    webContext,
    cachingFactory,
    cachingInstanceId,
    cacheKey,
  } = options
  assert(webContext, 'webContext is undefined')

  const { method, methodArgs } = options
  assert(method, 'original method invalid')
  const resp = await method(...methodArgs)
  options.methodResult = resp

  const tmp = computerReadConditionValue(options)
  const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
  assert(typeof enableCache === 'boolean', 'condition must return boolean')

  const ttl = await computerTTLValue(resp as CachedResponse, options)
  const caching = cachingFactory.get(cachingInstanceId)

  let cacheResp: CachedResponse | undefined = void 0
  const tmp2 = computerWriteConditionValue(options)
  const enableCache2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
  assert(typeof enableCache2 === 'boolean', 'write condition must return boolean')
  if (enableCache2 && cacheKey && ttl > 0) {
    cacheResp = await saveData(caching, cacheKey, resp, ttl)
  }

  if (typeof cacheResp === 'undefined') {
    return resp
  }

  const { mergedDecoratorParam } = options
  assert(mergedDecoratorParam, 'mergedDecoratorParam is undefined')
  const opts2: GenCacheKeyOptions = {
    key: mergedDecoratorParam.key,
    cacheName: mergedDecoratorParam.cacheName,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    webContext,
  }
  const resp2 = genDataWithCacheMeta(cacheResp, opts2, ttl)
  return resp2
}
