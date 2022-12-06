/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { CacheManager } from '@midwayjs/cache'
import {
  INJECT_CUSTOM_METHOD,
  Provide,
  REQUEST_OBJ_CTX_KEY,
  getClassMetadata,
  saveClassMetadata,
  saveModule,
} from '@midwayjs/core'
import { Context as WebContext, methodHasDecorated } from '@mwcp/share'

import { CLASS_KEY_Cacheable, METHOD_KEY_CacheEvict } from '../config'
import { Config, CacheableArgs, DecoratorMetaData } from '../types'

import {
  decoratorExecutor,
  retrieveMethodDecoratorArgs,
} from './helper.cacheable'
import { DecoratorExecutorOptions } from './types.cacheable'


export function classDecoratorPatcher(
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: Function,
  args?: Partial<CacheableArgs>,
): void {

  // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
  saveModule(CLASS_KEY_Cacheable, target)

  // 保存一些元数据信息，任意你希望存的东西
  saveClassMetadata(
    CLASS_KEY_Cacheable,
    args,
    target,
  )
  // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
  // Scope(ScopeEnum.Request)(target)

  const target2 = wrapClassMethodOnPrototype(target, args)

  // 调用一下 Provide 装饰器，这样用户的 class 可以省略写 @Provide() 装饰器了
  Provide()(target2)
}

function wrapClassMethodOnPrototype(
  target: any,
  options?: Partial<CacheableArgs>,
): any {

  if (! target.prototype) {
    return target
  }

  const metadataArr: DecoratorMetaData[] | undefined = getClassMetadata(INJECT_CUSTOM_METHOD, target)

  const prot = target.prototype as unknown
  for (const key of Object.getOwnPropertyNames(prot)) {
    if (key === 'constructor') { continue }
    if (methodHasDecorated(METHOD_KEY_CacheEvict, key, metadataArr)) {
      continue
    }

    const descriptor = Object.getOwnPropertyDescriptor(prot, key)
    if (typeof descriptor?.value === 'function') {
      if (descriptor.value.constructor.name !== 'AsyncFunction') { continue }

      const targetMethodName = `__decorator_orig_${key}`
      if (typeof target.prototype[targetMethodName] === 'function') { continue }

      Object.defineProperty(target.prototype, targetMethodName, {
        value: descriptor.value,
      })

      const wrappedClassDecoratedMethod = async function(this: unknown, ...args: unknown[]): Promise<unknown> {
        // return target.prototype[targetMethodName].apply(this, args)
        const method = target.prototype[targetMethodName].bind(this) as Method
        const resp = await classDecoratorExecuctor(
          this,
          method,
          key,
          args,
          options,
        )
        return resp
      }
      Object.defineProperty(wrappedClassDecoratedMethod, 'name', {
        writable: true,
        value: key,
      })
      target.prototype[key] = wrappedClassDecoratedMethod
    }
  }

  return target
}

async function classDecoratorExecuctor(
  instance: any,
  method: Method,
  methodName: string,
  methodArgs: unknown[],
  options?: Partial<CacheableArgs>,
): Promise<unknown> {

  assert(instance, 'instance is required')
  assert(methodName, 'methodName is required')

  const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext
  assert(webContext, 'webContext is undefined on this')

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const config = webContext?.app?.getConfig
    ? webContext.app.getConfig('cacheConfig') as Config | undefined
    : void 0

  const className = instance.constructor?.name as string
  assert(className, 'this.constructor.name is undefined')

  const methodMetaDataArgs: CacheableArgs | undefined = retrieveMethodDecoratorArgs(instance, methodName)

  const cacheName = methodMetaDataArgs?.cacheName ?? `${className}.${methodName}`
  const key = methodMetaDataArgs?.key
  const ttl = methodMetaDataArgs?.ttl ?? options?.ttl ?? config?.options.ttl
  const condition = methodMetaDataArgs?.condition ?? options?.condition
  const cacheManager = await webContext.requestContext.getAsync(CacheManager)

  const opts: DecoratorExecutorOptions = {
    cacheManager,
    cacheName,
    condition,
    key,
    ttl,
    method,
    methodArgs,
    webContext,
  }
  const dat = await decoratorExecutor(opts)
  return dat
}

type Method = (...args: unknown[]) => Promise<unknown>

