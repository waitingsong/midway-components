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
  getClassMetadata,
} from '@midwayjs/core'

import { CLASS_KEY_Cacheable, METHOD_KEY_Cacheable } from '../config'
import { genDecoratorExecutorOptions } from '../helper'
import type { Config, CacheableArgs, MetaDataType } from '../types'

import { decoratorExecutor } from './helper.cacheable'
import type { DecoratorExecutorOptions } from './types.cacheable'


export function methodDecoratorPatcher<T>(
  target: {},
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>,
  metadata?: Partial<CacheableArgs>,
): TypedPropertyDescriptor<T> {

  assert(descriptor, 'descriptor is undefined')
  const data = {
    propertyName,
    key: METHOD_KEY_Cacheable,
    metadata: metadata ?? {},
    impl: true,
  }
  attachClassMetadata(
    INJECT_CUSTOM_METHOD,
    data,
    target,
  )
  // const foo = getClassMetadata(INJECT_CUSTOM_METHOD, target)
  // void foo
  return descriptor
}


export function registerMethodHandler(
  decoratorService: MidwayDecoratorService,
  config: Config,
  cacheManager: CacheManager,
): void {

  decoratorService.registerMethodHandler(
    METHOD_KEY_Cacheable,
    (options: MetaDataType<CacheableArgs>) => ({
      around: (joinPoint: JoinPoint) => aroundFactory(
        joinPoint,
        options,
        config,
        cacheManager,
      ),
    }),
  )
}


async function aroundFactory(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType<CacheableArgs>,
  config: Config,
  cacheManager: CacheManager,
): Promise<unknown> {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  const instance = joinPoint.target
  const classMetaData = getClassMetadata(CLASS_KEY_Cacheable, instance)
  if (classMetaData) {
    const ret = await joinPoint.proceed(...joinPoint.args) // must await for call stack
    return ret
  }

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

