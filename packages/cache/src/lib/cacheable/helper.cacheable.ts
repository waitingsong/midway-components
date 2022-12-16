import assert from 'assert'

import { INJECT_CUSTOM_METHOD, getClassMetadata } from '@midwayjs/core'

import { initConfig } from '../config'
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
      const tmp = computerConditionValue(inputOpts)
      const enableCache = typeof tmp === 'boolean' ? tmp : await tmp
      assert(typeof enableCache === 'boolean', 'condition must return boolean')

      return { inputOpts, enableCache }
    })
    .then(async ({ inputOpts, enableCache }) => {
      const cacheResp = enableCache
        ? await getData(inputOpts.cacheManager, cacheKey)
        : void 0
      return { inputOpts, enableCache, cacheResp }
    })
    .then(async ({ inputOpts, enableCache, cacheResp }) => {
      if (typeof cacheResp !== 'undefined') {
        const resp = genDataWithCacheMeta(cacheResp as CachedResponse, inputOpts, inputOpts.ttl)
        return resp
      }

      const { cacheManager, method, methodArgs } = inputOpts
      const resp = await method(...methodArgs)

      if (enableCache && typeof resp !== 'undefined') {
        const ttl = typeof inputOpts.ttl === 'number' ? inputOpts.ttl : initConfig.options.ttl
        await saveData(cacheManager, cacheKey, resp, ttl)
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
