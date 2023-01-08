import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'

import { initCacheEvictArgs } from '../config'
import { processEx } from '../exception'
import { computerConditionValue, deleteData, genCacheKey, GenCacheKeyOptions } from '../helper'
import { CacheEvictArgs, DecoratorExecutorOptions } from '../types'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<CacheEvictArgs>,
): Promise<unknown> {

  const webContext = options.instance[REQUEST_OBJ_CTX_KEY]
  assert(webContext, 'webContext is undefined')

  const cacheManager = options.cacheManager ?? await webContext.requestContext.getAsync(CacheManager)
  assert(cacheManager, 'CacheManager is undefined')

  const {
    argsFromClassDecorator,
    argsFromMethodDecorator,
  } = options

  const cacheOptions: CacheEvictArgs = {
    ...initCacheEvictArgs,
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
    const enableEvict = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableEvict === 'boolean', 'condition must return boolean')

    if (enableEvict && cacheOptions.beforeInvocation) {
      await deleteData(cacheManager, cacheKey)
    }

    const { method, methodArgs } = options
    const resp = await method(...methodArgs)

    if (! cacheOptions.beforeInvocation) {
      if (enableEvict) {
        await deleteData(cacheManager, cacheKey)
      }
      else {
        const ps: DecoratorExecutorOptions<CacheEvictArgs> = {
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


