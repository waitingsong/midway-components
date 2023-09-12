import assert from 'assert'

import { initCacheableArgs } from '../config.js'
import { processEx } from '../exception.js'
import {
  computerConditionValue,
  computerTTLValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  getData,
  saveData,
} from '../helper.js'
import { CachedResponse, CacheableArgs, DecoratorExecutorOptions } from '../types.js'


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
  const opts2: GenCacheKeyOptions = {
    ...cacheOptions,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    webContext,
  }
  const cacheKey = genCacheKey(opts2)

  try {
    const opts4 = {
      ...options,
      mergedDecoratorParam: cacheOptions,
    }

    const tmp = computerConditionValue(opts4)
    const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    let cacheResp: CachedResponse | undefined = void 0
    if (enableCache) {
      cacheResp = await getData(cacheManager, cacheKey, opts4.traceService)
    }

    if (typeof cacheResp !== 'undefined') {
      const resp = genDataWithCacheMeta(cacheResp as CachedResponse, opts2)
      return resp
    }

    const { method, methodArgs, methodIsAsyncFunction } = opts4
    assert(methodIsAsyncFunction, 'decorated method must be async function')

    const resp = await method(...methodArgs)

    const ttl = await computerTTLValue(resp as CachedResponse, opts4)
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


