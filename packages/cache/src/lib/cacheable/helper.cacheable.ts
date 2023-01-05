import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'

import { initConfig } from '../config'
import { processEx } from '../exception'
import {
  computerConditionValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  getData,
  retrieveMethodDecoratorArgs,
  saveData,
} from '../helper'
import { CachedResponse, CacheableArgs, DecoratorExecutorOptions } from '../types'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<CacheableArgs>,
): Promise<unknown> {

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const webContext = options.instance[REQUEST_OBJ_CTX_KEY] as WebContext
  assert(webContext, 'webContext is undefined')

  const cacheManager = options.cacheManager ?? await webContext.requestContext.getAsync(CacheManager)
  assert(cacheManager, 'CacheManager is undefined')

  const { cacheOptions } = options

  const methodMetaDataArgs = retrieveMethodDecoratorArgs<CacheableArgs>(options.instance, options.methodName)
  if (typeof methodMetaDataArgs?.ttl === 'number') {
    cacheOptions.ttl = methodMetaDataArgs.ttl
  }
  if (typeof methodMetaDataArgs?.condition !== 'undefined') {
    cacheOptions.condition = methodMetaDataArgs.condition
  }

  const opts: GenCacheKeyOptions = {
    ...cacheOptions,
    methodArgs: options.methodArgs,
    methodResult: options.methodResult,
    webContext,
  }
  const cacheKey = genCacheKey(opts)

  try {
    const tmp = computerConditionValue(options)
    const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const cacheResp = enableCache
      ? await getData(cacheManager, cacheKey)
      : void 0

    const ttl = cacheOptions.ttl ?? initConfig.options.ttl

    if (typeof cacheResp !== 'undefined') {
      const resp = genDataWithCacheMeta(cacheResp as CachedResponse, opts, ttl)
      return resp
    }

    const { method, methodArgs } = options
    const resp = await method(...methodArgs)

    if (enableCache && typeof resp !== 'undefined') {
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


