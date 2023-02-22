import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'

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

  const webContext = options.instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  const cacheManager = options.cacheManager ?? await webContext.requestContext.getAsync(CacheManager)
  assert(cacheManager, 'CacheManager is undefined')

  const {
    argsFromClassDecorator,
    argsFromMethodDecorator,
  } = options

  const cacheOptions: CacheableArgs = {
    ...initCacheableArgs,
    ...argsFromClassDecorator,
    ...argsFromMethodDecorator,
  }
  options.argsFromMethodDecorator = cacheOptions

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

    // const cacheResp = enableCache
    //   ? await getData(cacheManager, cacheKey)
    //   : void 0
    let cacheResp: CachedResponse | undefined = void 0
    if (enableCache) {
      const traceService = await webContext.requestContext.getAsync(TraceService)
      cacheResp = await getData(cacheManager, cacheKey, traceService)
    }

    if (typeof cacheResp !== 'undefined') {
      const resp = genDataWithCacheMeta(cacheResp as CachedResponse, opts)
      return resp
    }

    const { method, methodArgs } = options
    const resp = await method(...methodArgs)

    const ttl = await computerTTLValue(resp as CachedResponse, options)
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


