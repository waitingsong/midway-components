import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { INJECT_CUSTOM_METHOD, getClassMetadata } from '@midwayjs/core'

import { processEx } from '../exception'
import { computerConditionValue, deleteData, genCacheKey, GenCacheKeyOptions } from '../helper'
import { CacheEvictArgs, DecoratorMetaData } from '../types'

import { DecoratorExecutorOptions } from './types.cacheevict'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions,
): Promise<unknown> {

  const cacheManager = options.cacheManager
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
    const enableEvict = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableEvict === 'boolean', 'condition must return boolean')

    if (enableEvict && options.beforeInvocation) {
      await deleteData(cacheManager, cacheKey)
    }

    const { method, methodArgs } = options
    const resp = await method(...methodArgs)

    if (! options.beforeInvocation) {
      if (enableEvict) {
        await deleteData(cacheManager, cacheKey)
      }
      else {
        const ps: DecoratorExecutorOptions = {
          ...options,
          methodResult: resp,
        }
        const tmp2 = computerConditionValue(ps)
        const enableEvict2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
        assert(typeof enableEvict2 === 'boolean', 'condition must return boolean')
        if (enableEvict2) {
        // re-generate cache key, because CacheConditionFn use result of method
          const opts2: GenCacheKeyOptions = {
            ...opts,
            methodResult: resp,
          }
          const cacheKey2 = genCacheKey(opts2)
          await deleteData(cacheManager, cacheKey2)
        }
      }
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
): CacheEvictArgs | undefined {

  const metaDataArr = getClassMetadata(
    INJECT_CUSTOM_METHOD,
    target,
  ) as DecoratorMetaData<CacheEvictArgs | undefined>[] | undefined
  if (! metaDataArr?.length) { return }

  for (const row of metaDataArr) {
    if (row.propertyName === methodName) {
      return row.metadata
    }
  }
}
