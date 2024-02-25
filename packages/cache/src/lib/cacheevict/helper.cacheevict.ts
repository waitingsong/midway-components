import assert from 'assert'

import { initCacheEvictArgs } from '../config.js'
import { processEx } from '../exception.js'
import { computerConditionValue, deleteData, genCacheKey, GenCacheKeyOptions } from '../helper.js'
import { CacheEvictArgs, DecoratorExecutorOptions } from '../types.js'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<CacheEvictArgs>,
): Promise<unknown> {

  const {
    webContext,
    cachingFactory,
    cachingInstanceId,
    mergedDecoratorParam,
  } = options

  assert(webContext, 'webContext is undefined')

  const cacheOptions: CacheEvictArgs = {
    ...initCacheEvictArgs,
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

    const tmp = computerConditionValue(opts3)
    const enableEvict = typeof tmp === 'boolean' ? tmp : await tmp
    assert(typeof enableEvict === 'boolean', 'condition must return boolean')

    const caching = cachingFactory.get(cachingInstanceId)

    if (enableEvict && cacheOptions.beforeInvocation) {
      await deleteData(caching, cacheKey)
    }

    const { method, methodArgs, methodIsAsyncFunction } = opts3
    assert(methodIsAsyncFunction, 'decorated method must be async function')
    const resp = await method(...methodArgs)

    if (! cacheOptions.beforeInvocation) {
      if (enableEvict) {
        await deleteData(caching, cacheKey)
      }
      else {
        const ps: DecoratorExecutorOptions<CacheEvictArgs> = {
          ...opts3,
          methodResult: resp,
        }
        const tmp2 = computerConditionValue(ps)
        const enableEvict2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
        assert(typeof enableEvict2 === 'boolean', 'condition must return boolean')
        if (enableEvict2) {
        // re-generate cache key, because CacheConditionFn use result of method
          const opts4: GenCacheKeyOptions = {
            ...opts2,
            methodResult: resp,
          }
          const cacheKey2 = genCacheKey(opts4)
          await deleteData(caching, cacheKey2)
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


