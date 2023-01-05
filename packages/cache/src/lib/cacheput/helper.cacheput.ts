import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'

import { initCachePutArgs, initConfig } from '../config'
import { processEx } from '../exception'
import {
  computerConditionValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  retrieveMethodDecoratorArgs,
  saveData,
} from '../helper'
import { CacheableArgs, CachedResponse, DecoratorExecutorOptions } from '../types'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<CacheableArgs>,
): Promise<unknown> {

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const webContext = options.instance[REQUEST_OBJ_CTX_KEY] as WebContext
  assert(webContext, 'webContext is undefined')

  const cacheManager = options.cacheManager ?? await webContext.requestContext.getAsync(CacheManager)
  assert(cacheManager, 'CacheManager is undefined')

  const { cacheOptions: cacheOptionsArgs } = options

  const methodMetaDataArgs = retrieveMethodDecoratorArgs<CacheableArgs>(options.instance, options.methodName)
  const cacheOptions: CacheableArgs = {
    ...initCachePutArgs,
    ...cacheOptionsArgs,
    ...methodMetaDataArgs,
  }
  options.cacheOptions = cacheOptions

  const opts: GenCacheKeyOptions = {
    ...cacheOptions,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    webContext,
  }
  const cacheKey = genCacheKey(opts)

  try {
    const { method, methodArgs } = options
    const resp = await method(...methodArgs)

    const cvalue = computerConditionValue({
      ...options,
      methodResult: resp,
    })
    const enableCache = typeof cvalue === 'boolean' ? cvalue : await cvalue
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const ttl = cacheOptions.ttl ?? initConfig.options.ttl

    if (enableCache) {
      await saveData(cacheManager, cacheKey, resp, ttl)
    }

    if (typeof resp === 'object' && resp) {
      const resp2 = genDataWithCacheMeta(resp as CachedResponse, opts, ttl)
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

