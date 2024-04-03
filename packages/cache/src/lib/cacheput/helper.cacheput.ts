import assert from 'assert'

import { initCachePutArgs } from '../config.js'
import { processEx } from '../exception.js'
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


export async function decoratorExecutor(options: DecoratorExecutorOptions<CacheableArgs>): Promise<unknown> {

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

    const tmp = computerReadConditionValue({
      ...opts3,
      methodResult: resp,
    })
    const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const ttl = await computerTTLValue(resp as CachedResponse, opts3)
    const caching = cachingFactory.get(cachingInstanceId)

    let cacheResp: CachedResponse | undefined = void 0
    const tmp2 = computerWriteConditionValue(opts3)
    const enableCache2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
    assert(typeof enableCache2 === 'boolean', 'write condition must return boolean')
    if (enableCache2 && cacheKey && ttl > 0) {
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
