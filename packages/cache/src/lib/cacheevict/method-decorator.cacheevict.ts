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
  REQUEST_OBJ_CTX_KEY,
  attachClassMetadata,
} from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'

import { METHOD_KEY_CacheEvict } from '../config'
import { Config, CacheEvictArgs, DecoratorMetaData } from '../types'

import { decoratorExecutor } from './helper.cacheevict'
import { DecoratorExecutorOptions } from './types.cacheevict'


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
    (options: MetaDataType) => ({
      around: (joinPoint: JoinPoint) => aroundFactoryEvict(
        joinPoint,
        options,
        config,
        cacheManager,
      ),
    }),
  )
}


async function aroundFactoryEvict(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
  config: Config,
  cacheManager: CacheManager,
): Promise<unknown> {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')
  assert(config, 'config is undefined')

  // 装饰器所在的实例
  const instance = joinPoint.target

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext
  assert(webContext, 'webContext is undefined')

  const {
    cacheName: cacheNameArg,
    key: keyArg,
    beforeInvocation,
    condition,
  } = metaDataOptions.metadata
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const className = (instance.constructor?.name ?? metaDataOptions.target.name) as string
  const funcName = joinPoint.methodName as string
  assert(className, 'className is undefined')
  assert(funcName, 'funcName is undefined')

  const cacheName = cacheNameArg ?? `${className}.${funcName}`
  const key = keyArg

  const opts: DecoratorExecutorOptions = {
    beforeInvocation: !! beforeInvocation,
    cacheManager,
    cacheName,
    condition,
    key,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    method: joinPoint.proceed,
    methodArgs: joinPoint.args,
    webContext,
  }
  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat = await decoratorExecutor(opts)
  return dat
}

interface MetaDataType {
  /** 装饰器所在的实例 */
  target: new (...args: unknown[]) => unknown
  propertyName: string
  metadata: Partial<CacheEvictArgs>
}

