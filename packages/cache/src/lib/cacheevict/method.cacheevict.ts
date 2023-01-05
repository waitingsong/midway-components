/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'assert'

import { CacheManager } from '@midwayjs/cache'
import {
  INJECT_CUSTOM_METHOD,
  JoinPoint,
  MidwayDecoratorService,
  attachClassMetadata,
} from '@midwayjs/core'
import { DecoratorMetaData } from '@mwcp/share'

import { METHOD_KEY_CacheEvict } from '../config'
import { genDecoratorExecutorOptions } from '../helper'
import type { Config, CacheEvictArgs, MetaDataType, DecoratorExecutorOptions } from '../types'

import { decoratorExecutor } from './helper.cacheevict'


export function methodDecoratorPatcher<T>(
  target: {},
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>,
  metadata?: Partial<CacheEvictArgs>,
): TypedPropertyDescriptor<T> {

  assert(descriptor, 'descriptor is undefined')
  const data: DecoratorMetaData = {
    propertyName,
    key: METHOD_KEY_CacheEvict,
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


export function registerMethodHandlerEvict(
  decoratorService: MidwayDecoratorService,
  config: Config,
  cacheManager: CacheManager,
): void {

  decoratorService.registerMethodHandler(
    METHOD_KEY_CacheEvict,
    (options: MetaDataType<CacheEvictArgs>) => ({
      around: async (joinPoint: JoinPoint) => {
        const ret = await aroundFactoryEvict(
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


async function aroundFactoryEvict(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType<CacheEvictArgs>,
  config: Config,
  cacheManager: CacheManager,
): Promise<unknown> {

  const opts: DecoratorExecutorOptions<CacheEvictArgs> = genDecoratorExecutorOptions(
    joinPoint,
    metaDataOptions,
    config,
    cacheManager,
  )
  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat = await decoratorExecutor(opts)
  return dat
}

