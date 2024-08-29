import assert from 'node:assert'

import { initCacheEvictArgs } from '../config.js'
import { computerWriteConditionValue, deleteData, genCacheKey } from '../helper.js'
import type { GenCacheKeyOptions } from '../helper.js'
import type { CacheEvictArgs, DecoratorExecutorOptions } from '../types.js'


export async function before(options: DecoratorExecutorOptions<CacheEvictArgs>): Promise<void> {
  const {
    instance,
    mergedDecoratorParam,
  } = options

  const mergedDecoratorParam2: CacheEvictArgs = {
    ...initCacheEvictArgs,
    ...mergedDecoratorParam,
  }
  const opts2: GenCacheKeyOptions = {
    ...mergedDecoratorParam2,
    methodArgs: options.methodArgs,
    methodResult: void 0,
    instance,
  }
  const cacheKey = genCacheKey(opts2)
  options.mergedDecoratorParam = mergedDecoratorParam2
  options.cacheKey = cacheKey
}

export async function around(options: DecoratorExecutorOptions<CacheEvictArgs>): Promise<unknown> {
  const {
    instance,
    cachingFactory,
    cachingInstanceId,
    cacheKey,
    mergedDecoratorParam,
  } = options
  assert(mergedDecoratorParam, 'mergedDecoratorParam is undefined')

  const tmp = computerWriteConditionValue(options)
  const enableEvict = typeof tmp === 'boolean' ? tmp : await tmp
  assert(typeof enableEvict === 'boolean', 'condition must return boolean')

  const caching = cachingFactory.get(cachingInstanceId)

  if (enableEvict && cacheKey && mergedDecoratorParam.beforeInvocation) {
    await deleteData(caching, cacheKey)
  }

  const { method, methodArgs, methodIsAsyncFunction } = options
  assert(methodIsAsyncFunction, 'decorated method must be async function')
  assert(method, 'original method invalid')
  const resp = await method(...methodArgs) // execute method
  options.methodResult = resp

  if (mergedDecoratorParam.beforeInvocation) {
    return resp
  }

  if (enableEvict && cacheKey) {
    await deleteData(caching, cacheKey)
  }
  else {
    const tmp2 = computerWriteConditionValue(options)
    const enableEvict2 = typeof tmp2 === 'boolean' ? tmp2 : await tmp2
    assert(typeof enableEvict2 === 'boolean', 'condition must return boolean')
    if (enableEvict2) {
      // re-generate cache key, because CacheConditionFn use result of method
      const opts2: GenCacheKeyOptions = {
        ...options.mergedDecoratorParam as CacheEvictArgs,
        methodArgs: options.methodArgs,
        methodResult: options.methodResult,
        instance,
      }
      const cacheKey2 = genCacheKey(opts2)
      cacheKey2 && await deleteData(caching, cacheKey2)
    }
  }

  return resp
}

