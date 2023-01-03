import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { INJECT_CUSTOM_METHOD, getClassMetadata } from '@midwayjs/core'

import { initConfig } from '../config'
import { processEx } from '../exception'
import {
  computerConditionValue,
  genCacheKey,
  GenCacheKeyOptions,
  genDataWithCacheMeta,
  getData,
  saveData,
} from '../helper'
import { CachedResponse, CacheableArgs, DecoratorMetaData } from '../types'

import { DecoratorExecutorOptions } from './types.cacheable'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions,
): Promise<unknown> {

  const cacheManager = options.cacheManager
    // ?? await options.webContext.app.getApplicationContext().getAsync(CacheManager)
    ?? await options.webContext.requestContext.getAsync(CacheManager)
  assert(cacheManager, 'CacheManager is undefined')

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
    const tmp = computerConditionValue(options)
    const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableCache === 'boolean', 'condition must return boolean')

    const cacheResp = enableCache
      ? await getData(cacheManager, cacheKey)
      : void 0

    const ttl = typeof options.ttl === 'number' ? options.ttl : initConfig.options.ttl

    if (typeof cacheResp !== 'undefined') {
      const resp = genDataWithCacheMeta(cacheResp as CachedResponse, options, ttl)
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



export function retrieveMethodDecoratorArgs(
  target: unknown,
  methodName: string,
): CacheableArgs | undefined {

  const metaDataArr = getClassMetadata(
    INJECT_CUSTOM_METHOD,
    target,
  ) as DecoratorMetaData<CacheableArgs | undefined>[] | undefined
  if (! metaDataArr?.length) { return }

  for (const row of metaDataArr) {
    if (row.propertyName === methodName) {
      return row.metadata
    }
  }
}
