import assert from 'assert'

import { initCacheableArgs } from '../config.js'
import { processEx } from '../exception.js'
import {
  computerReadConditionValue,
  computerTTLValue,
  computerWriteConditionValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  getData,
  saveData,
} from '../helper.js'
import { CachedResponse, CacheableArgs, DecoratorExecutorOptions } from '../types.js'


export async function decoratorExecutor(options: DecoratorExecutorOptions<CacheableArgs<undefined>>): Promise<unknown> {

  const {
    webContext,
    cachingFactory,
    cachingInstanceId,
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

    const tmp = computerReadConditionValue(opts4)
    const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const caching = cachingFactory.get(cachingInstanceId)

    let cacheResp: CachedResponse | undefined = void 0
    if (enableCache && cacheKey) {
      cacheResp = await getData(caching, cacheKey, opts4.traceService)
    }

    if (typeof cacheResp !== 'undefined') {
      const resp = genDataWithCacheMeta(cacheResp, opts2)
      return resp
    }

    const { method, methodArgs, methodIsAsyncFunction } = opts4
    assert(methodIsAsyncFunction, 'decorated method must be async function')

    const resp = await method(...methodArgs)
    const ttl = await computerTTLValue(resp as CachedResponse, opts4)

    const tmp2 = computerWriteConditionValue(opts4)
    const enableCache2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
    assert(typeof enableCache2 === 'boolean', 'write condition must return boolean')
    if (enableCache2 && cacheKey && ttl > 0 && typeof resp !== 'undefined') {
      await saveData(caching, cacheKey, resp, ttl)
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


