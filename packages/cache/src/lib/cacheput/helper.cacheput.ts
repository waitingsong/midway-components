import assert from 'assert'

import { initConfig } from '../config'
import { processEx } from '../exception'
import {
  computerConditionValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  saveData,
} from '../helper'
import { CachedResponse } from '../types'

import { DecoratorExecutorOptions } from './types.cacheput'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions,
): Promise<unknown> {

  assert(options.cacheManager, 'CacheManager is undefined')

  const opts: GenCacheKeyOptions = {
    cacheName: options.cacheName,
    condition: options.condition,
    key: options.key,
    methodArgs: options.methodArgs,
    methodResult: void 0,
    webContext: options.webContext,
  }
  const cacheKey = genCacheKey(opts)

  try {
    const { cacheManager, method, methodArgs } = options
    const resp = await method(...methodArgs)

    const cvalue = computerConditionValue({
      ...options,
      methodResult: resp,
    })
    const enableCache = typeof cvalue === 'boolean' ? cvalue : await cvalue
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const ttl = typeof options.ttl === 'number' ? options.ttl : initConfig.options.ttl
    if (enableCache) {
      await saveData(cacheManager, cacheKey, resp, ttl)
    }

    if (typeof resp === 'object' && resp) {
      const resp2 = genDataWithCacheMeta(resp as CachedResponse, options, ttl)
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

