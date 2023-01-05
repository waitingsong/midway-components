/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'assert'

import type { CacheManager } from '@midwayjs/cache'
import {
  INJECT_CUSTOM_METHOD,
  JoinPoint,
  MidwayDecoratorService,
  attachClassMetadata,
} from '@midwayjs/core'

import { METHOD_KEY_CachePut } from '../config'
import { genDecoratorExecutorOptions } from '../helper'
import type { Config, CacheableArgs, MetaDataType, DecoratorExecutorOptions } from '../types'

import { decoratorExecutor } from './helper.cacheput'


export function methodDecoratorPatcher<T>(
  target: {},
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>,
  metadata?: Partial<CacheableArgs>,
): TypedPropertyDescriptor<T> {

  assert(descriptor, 'descriptor is undefined')
  const data = {
    propertyName,
    key: METHOD_KEY_CachePut,
    metadata: metadata ?? {},
    impl: true,
  }
  attachClassMetadata(
    INJECT_CUSTOM_METHOD,
    data,
    target,
  )
  return descriptor
}


export function registerMethodHandlerPut(
  decoratorService: MidwayDecoratorService,
  config: Config,
  cacheManager: CacheManager,
): void {

  decoratorService.registerMethodHandler(
    METHOD_KEY_CachePut,
    (options: MetaDataType<CacheableArgs>) => ({
      around: async (joinPoint: JoinPoint) => {
        const ret = await aroundFactory(
          joinPoint,
          options,
          config,
          cacheManager,
        )
        return ret
      },
    }),
  )
}


async function aroundFactory(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType<CacheableArgs>,
  config: Config,
  cacheManager: CacheManager,
): Promise<unknown> {

  const opts: DecoratorExecutorOptions = genDecoratorExecutorOptions(
    joinPoint,
    metaDataOptions,
    config,
    cacheManager,
  )
  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat = await decoratorExecutor(opts)
  return dat
}


