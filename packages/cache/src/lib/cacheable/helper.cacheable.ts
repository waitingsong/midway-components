import assert from 'assert'

import { initCacheableArgs } from '../config'
import { processEx } from '../exception'
import {
  computerConditionValue,
  computerTTLValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  getData,
  saveData,
} from '../helper'
import { CachedResponse, CacheableArgs, DecoratorExecutorOptions } from '../types'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<CacheableArgs>,
): Promise<unknown> {

  const {
    webContext,
    cacheManager,
    mergedDecoratorParam,
  } = options

  assert(webContext, 'webContext is undefined')

  const cacheOptions: CacheableArgs = {
    ...initCacheableArgs,
    ...mergedDecoratorParam,
  }
  const opts2 = {
    ...options,
    mergedDecoratorParam: cacheOptions,
  }

  const opts3: GenCacheKeyOptions = {
    ...cacheOptions,
    methodArgs: opts2.methodArgs,
    methodResult: opts2.methodResult,
    webContext,
  }
  const cacheKey = genCacheKey(opts3)

  try {
    const tmp = computerConditionValue(opts2)
    const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    // const cacheResp = enableCache
    //   ? await getData(cacheManager, cacheKey)
    //   : void 0
    let cacheResp: CachedResponse | undefined = void 0
    if (enableCache) {
      cacheResp = await getData(cacheManager, cacheKey, opts2.traceService)
    }

    if (typeof cacheResp !== 'undefined') {
      const resp = genDataWithCacheMeta(cacheResp as CachedResponse, opts3)
      return resp
    }

    const { method, methodArgs, methodIsAsyncFunction } = opts2
    assert(methodIsAsyncFunction, 'decorated method must be async function')

    const resp = await method(...methodArgs)

    const ttl = await computerTTLValue(resp as CachedResponse, opts2)
    if (enableCache && ttl > 0 && typeof resp !== 'undefined') {
      await saveData(cacheManager, cacheKey, resp, ttl)
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


