import assert from 'assert'

import { initConfig } from '../config'
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

  return Promise.resolve(options)
    .then(async (inputOpts) => {
      const { cacheManager, method, methodArgs } = inputOpts
      const resp = await method(...methodArgs)

      const cvalue = computerConditionValue({
        ...inputOpts,
        methodResult: resp,
      })
      const enableCache = typeof cvalue === 'boolean' ? cvalue : await cvalue
      assert(typeof enableCache === 'boolean', 'condition must return boolean')
      if (enableCache) {
        const ttl = typeof inputOpts.ttl === 'number' ? inputOpts.ttl : initConfig.options.ttl
        await saveData(cacheManager, cacheKey, resp, ttl)
      }

      if (typeof resp === 'object' && resp) {
        const resp2 = genDataWithCacheMeta(resp as CachedResponse, inputOpts, inputOpts.ttl)
        return resp2
      }

      return resp
    })
    .catch((error: unknown) => processEx({
      cacheKey,
      error,
    }))
}

interface ProcessExOptions {
  cacheKey: string
  error: unknown
}

function processEx(options: ProcessExOptions): Promise<never> {
  const { cacheKey, error } = options

  console.error('cache error', error)
  const ex2Msg = error instanceof Error
    ? error.message
    : typeof error === 'string' ? error : JSON.stringify(error)

  const ex3 = new Error(`cache error with key: "${cacheKey}" >
  message: ${ex2Msg}`, { cause: error })
  return Promise.reject(ex3)
}

