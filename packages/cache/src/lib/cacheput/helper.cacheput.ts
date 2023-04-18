import assert from 'assert'

import { initCachePutArgs } from '../config'
import { processEx } from '../exception'
import {
  computerConditionValue,
  computerTTLValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  saveData,
} from '../helper'
import { CacheableArgs, CachedResponse, DecoratorExecutorOptions } from '../types'


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
    ...initCachePutArgs,
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
    const { method, methodArgs } = opts2
    const resp = await method(...methodArgs)

    const cvalue = computerConditionValue({
      ...opts2,
      methodResult: resp,
    })
    const enableCache = typeof cvalue === 'boolean' ? cvalue : await cvalue
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const ttl = await computerTTLValue(resp as CachedResponse, opts2)

    if (enableCache && ttl > 0) {
      await saveData(cacheManager, cacheKey, resp, ttl)
    }

    if (typeof resp === 'object' && resp) {
      const resp2 = genDataWithCacheMeta(resp as CachedResponse, opts3, ttl)
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

