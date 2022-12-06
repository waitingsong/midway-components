import assert from 'assert'

import { INJECT_CUSTOM_METHOD, getClassMetadata } from '@midwayjs/core'

import { computerConditionValue, deleteData, genCacheKey, GenCacheKeyOptions } from '../helper'
import { CacheEvictArgs, DecoratorMetaData } from '../types'

import { DecoratorExecutorOptions } from './types.cacheevict'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions,
): Promise<unknown> {

  assert(options.cacheManager, 'CacheManager is undefined')

  const opts: GenCacheKeyOptions = {
    cacheName: options.cacheName,
    condition: options.condition,
    key: options.key,
    methodArgs: options.methodArgs,
    webContext: options.webContext,
  }
  const cacheKey = genCacheKey(opts)

  return Promise.resolve(options)
    .then(async (inputOpts) => {
      const tmp = computerConditionValue(inputOpts)
      const enableEvict = typeof tmp === 'boolean' ? tmp : await tmp
      assert(typeof enableEvict === 'boolean', 'condition must return boolean')

      return { inputOpts, enableEvict }
    })
    .then(async ({ inputOpts, enableEvict }) => {
      if (enableEvict && inputOpts.beforeInvocation) {
        await deleteData(inputOpts.cacheManager, cacheKey)
      }

      const { method, methodArgs } = inputOpts
      const resp = await method(...methodArgs)

      if (enableEvict && ! inputOpts.beforeInvocation) {
        await deleteData(inputOpts.cacheManager, cacheKey)
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
