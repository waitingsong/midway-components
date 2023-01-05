import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'

import { initCacheableArgs, initConfig, targetMethodNamePrefix } from '../config'
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

  const targetMethodName = `${targetMethodNamePrefix}${options.methodName}`
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const targetMethodName2: string | undefined = options.method['targetMethodName']
  if (targetMethodName2 && targetMethodName2 !== targetMethodName) {
    // @ts-ignore
    if (typeof options.instance[targetMethodName] === 'function') {
      const msg = `[@mwcp/cache] method "${options.methodName}" is also decorated by @cacheable on class with method "${targetMethodName}",
        it will cause nested calling, code must be refactored to avoid this situation.`
      console.error(msg)
      throw new Error(msg)
    }
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const webContext = options.instance[REQUEST_OBJ_CTX_KEY] as WebContext
  assert(webContext, 'webContext is undefined')

  const cacheManager = options.cacheManager ?? await webContext.requestContext.getAsync(CacheManager)
  assert(cacheManager, 'CacheManager is undefined')

  const { cacheOptions: cacheOptionsArgs } = options
  const methodMetaDataArgs = retrieveMethodDecoratorArgs<CacheableArgs>(options.instance, options.methodName)

  const cacheOptions: CacheableArgs = {
    ...initCacheableArgs,
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


