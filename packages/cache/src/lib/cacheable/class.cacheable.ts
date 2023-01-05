/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import {
  INJECT_CUSTOM_METHOD,
  Provide,
  getClassMetadata,
  saveClassMetadata,
  saveModule,
} from '@midwayjs/core'
import { DecoratorMetaData, methodHasDecorated } from '@mwcp/share'

import { CLASS_KEY_Cacheable, METHOD_KEY_CacheEvict, METHOD_KEY_CachePut, targetMethodNamePrefix } from '../config'
import { genDecoratorExecutorOptionsCommon } from '../helper'
import { CacheableArgs, DecoratorExecutorOptions, MethodType } from '../types'

import { decoratorExecutor } from './helper.cacheable'


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

  const metadataArr: DecoratorMetaData<CacheableArgs>[] | undefined = getClassMetadata(INJECT_CUSTOM_METHOD, target)

  const prot = target.prototype as unknown
  for (const key of Object.getOwnPropertyNames(prot)) {
    if (key === 'constructor') { continue }

    if (methodHasDecorated(METHOD_KEY_CacheEvict, key, metadataArr)) {
      continue
    }
    else if (methodHasDecorated(METHOD_KEY_CachePut, key, metadataArr)) {
      continue
    }
    // void else

    const descriptor = Object.getOwnPropertyDescriptor(prot, key)
    if (typeof descriptor?.value === 'function') {
      if (descriptor.value.constructor.name !== 'AsyncFunction') { continue }

      const methodName = key
      const targetMethodName = `${targetMethodNamePrefix}${methodName}`
      if (typeof target.prototype[targetMethodName] === 'function') { continue }

      Object.defineProperty(target.prototype, targetMethodName, {
        value: descriptor.value,
      })

      const wrappedClassDecoratedMethod = async function(this: unknown, ...args: unknown[]): Promise<unknown> {
        // return target.prototype[targetMethodName].apply(this, args)
        const method = target.prototype[targetMethodName].bind(this) as MethodType
        Object.defineProperty(method, 'targetMethodName', {
          enumerable: true,
          value: targetMethodName,
        })
        Object.defineProperty(method, 'origMethodName', {
          enumerable: true,
          value: methodName,
        })

        const resp = await classDecoratorExecuctor(
          this,
          method,
          methodName,
          args,
          options,
        )
        return resp
      }
      Object.defineProperty(wrappedClassDecoratedMethod, 'name', {
        enumerable: true,
        writable: true,
        value: methodName,
      })
      Object.defineProperty(wrappedClassDecoratedMethod, 'targetMethodName', {
        enumerable: true,
        value: targetMethodName,
      })

      target.prototype[key] = wrappedClassDecoratedMethod
    }
  }

  return target
}

async function classDecoratorExecuctor(
  instance: any,
  method: MethodType,
  methodName: string,
  methodArgs: unknown[],
  options?: Partial<CacheableArgs>,
): Promise<unknown> {

  assert(instance, 'instance is required')
  assert(methodName, 'methodName is required')

  const opts: DecoratorExecutorOptions<CacheableArgs> = genDecoratorExecutorOptionsCommon({
    instance,
    method,
    methodArgs,
    methodName,
    cacheOptions: options,
  })
  const dat = await decoratorExecutor(opts)
  return dat
}


