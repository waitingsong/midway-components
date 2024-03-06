import assert from 'assert'

import { initCachePutArgs } from '../config.js'
import { processEx } from '../exception.js'
import {
  computerConditionValue,
  computerTTLValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  saveData,
} from '../helper.js'
import { CacheableArgs, CachedResponse, DecoratorExecutorOptions } from '../types.js'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<CacheableArgs>,
): Promise<unknown> {

  const {
    webContext,
    cachingFactory,
    cachingInstanceId,
    mergedDecoratorParam,
  } = options

  assert(webContext, 'webContext is undefined')

  const cacheOptions: CacheableArgs = {
    ...initCachePutArgs,
    ...mergedDecoratorParam,
  }

  const opts2: GenCacheKeyOptions = {
    ...cacheOptions,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    webContext,
  }
  const cacheKey = genCacheKey(opts2)

  try {
    const opts3 = {
      ...options,
      mergedDecoratorParam: cacheOptions,
    }
    const { method, methodArgs } = opts3
    const resp = await method(...methodArgs)

    const cvalue = computerConditionValue({
      ...opts3,
      methodResult: resp,
    })

    const enableCache = typeof cvalue === 'boolean' ? cvalue : await cvalue
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const ttl = await computerTTLValue(resp as CachedResponse, opts3)
    const caching = cachingFactory.get(cachingInstanceId)

    let cacheResp: CachedResponse | undefined = void 0
    if (enableCache && ttl > 0) {
      cacheResp = await saveData(caching, cacheKey, resp, ttl)
    }

    if (typeof cacheResp !== 'undefined') {
      const resp2 = genDataWithCacheMeta(cacheResp, opts2, ttl)
      return resp2
    }

    return resp
  }
  catch (error) {
    return processEx({
      error,
      cacheKey,
    })
  }
}
