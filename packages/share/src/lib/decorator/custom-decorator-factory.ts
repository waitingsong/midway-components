/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'

import {
  INJECT_CUSTOM_METHOD,
  attachClassMetadata,
  getClassMetadata,
  saveClassMetadata,
  saveModule,
  Provide,
} from '@midwayjs/core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import {
  methodHasDecorated,
  setImplToFalseIfDecoratedWithBothClassAndMethod,
} from './custom-decorator.helper.js'
import type {
  DecoratorHandlerBase,
  ClassWithDecorator,
  CustomDecoratorFactoryOptions,
  DecoratorMetaData,
  RegClassDecoratorOptions,
  RegMethodDecoratorOptions,
} from './custom-decorator.types.js'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customDecoratorRegMap = new Map<string, typeof DecoratorHandlerBase>()
export const INJECT_CUSTOM_DecoratorHandlerClass = 'mwcp-share:inject_custom_decorator_handler_class'

/**
 * @description support only one parameter options
 */
export function customDecoratorFactory(options: CustomDecoratorFactoryOptions): MethodDecorator & ClassDecorator {
  assert(typeof options === 'object', 'options is not an object')
  assert(typeof options.decoratorArgs === 'undefined' || typeof options.decoratorArgs === 'object', 'options.decoratorArgs is not an object')

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (options.decoratorHandlerClass) {
    customDecoratorRegMap.set(options.decoratorKey, options.decoratorHandlerClass)
  }

  const DecoratorFactory = (
    target: ClassWithDecorator,
    propertyName: string,
    descriptor?: TypedPropertyDescriptor<unknown> | undefined,
  ) => { regCustomDecorator(target, propertyName, descriptor, options) }

  // @ts-expect-error
  return DecoratorFactory
}

function regCustomDecorator<TDecoratorParam extends object>(
  target: ClassWithDecorator,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<unknown> | undefined,
  options: CustomDecoratorFactoryOptions<TDecoratorParam>,
): void {

  assert(target, 'target is undefined')
  assert(typeof options === 'object', 'options is not an object')

  const beforeAfterOpts: CustomDecoratorFactoryOptions<TDecoratorParam> = {
    ...options,
  }
  delete beforeAfterOpts.beforeRegister
  delete beforeAfterOpts.afterRegister

  if (typeof options.beforeRegister === 'function') {
    options.beforeRegister(target, propertyName, descriptor, beforeAfterOpts)
  }

  if (typeof target === 'function') { // Class Decorator, target is class constructor
    assert(typeof propertyName === 'undefined', 'propertyName is not undefined while Class Decorator')
    assert(
      typeof options.enableClassDecorator === 'undefined' || options.enableClassDecorator,
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `${options.decoratorKey} is not allowed on class ${target.name}.${propertyName}, due to options.enableClassDecorator is false`,
    )

    const { decoratorArgs, decoratorKey } = options
    assert(decoratorKey, 'decoratorKey is undefined')
    assert(typeof descriptor === 'undefined', 'descriptor is not undefined')

    const opts = {
      decoratorKey,
      target,
      args: decoratorArgs,
      ignoreIfMethodDecoratorKeys: options.classIgnoreIfMethodDecoratorKeys,
    }
    regClassDecorator(opts)
  }
  else if (typeof target === 'object') { // Method Decorator, target is class instance
    const { decoratorKey, decoratorArgs } = options

    assert(decoratorKey, 'decoratorKey is undefined')
    assert(target, 'target is undefined')
    assert(propertyName, 'propertyName is undefined')
    assert(descriptor, 'descriptor is undefined')

    // descriptor.value is the method being decorated
    assert(
      typeof descriptor.value === 'function',
      `Only method can be decorated with decorator "${decoratorKey}",
        target: ${target.constructor.name},
        ${propertyName.toString()} is not a method`,
    )

    // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // if (descriptor.value.constructor.name !== 'AsyncFunction') {
    //   throw new Error(`Only async method can be decorated with decorator "${decoratorKey}"
    //   target: ${target.constructor.name}, propertyName: ${propertyName}`)
    // }

    const opts = {
      decoratorKey,
      target,
      propertyName: propertyName.toString(),
      args: decoratorArgs,
      method: descriptor.value as MethodTypeUnknown,
      ignoreIfMethodDecoratorKeys: options.methodIgnoreIfMethodDecoratorKeys,
    }

    regMethodDecorator(opts)
  }
  /* c8 ignore next 3 */
  else {
    throw new Error('invalid target type')
  }

  if (typeof options.afterRegister === 'function') {
    options.afterRegister(target, propertyName, descriptor, beforeAfterOpts)
  }
}


function regMethodDecorator<TDecoratorParam extends object = object>(options: RegMethodDecoratorOptions<TDecoratorParam>): void {
  const {
    decoratorKey,
    decoratedType,
    args,
    target,
    propertyName,
    method,
    ignoreIfMethodDecoratorKeys,
  } = options

  assert(method, 'method is undefined')
  assert(typeof method === 'function', 'method is not a function')
  assert(
    typeof args === 'object' || typeof args === 'undefined',
    'args is not an object or undefined',
  )
  const metadata = args ? { ...args } : {}
  Object.defineProperty(metadata, 'decoratedType', { value: decoratedType ?? 'method' })

  const data: DecoratorMetaData = {
    key: decoratorKey,
    metadata,
    propertyName,
    options: {
      impl: true,
    },
  }
  if (ignoreIfMethodDecoratorKeys?.length) {
    const arr = getClassMetadata<DecoratorMetaData[] | undefined>(INJECT_CUSTOM_METHOD, target)
    if (arr?.length) {
      for (const key of ignoreIfMethodDecoratorKeys) {
        if (methodHasDecorated(key, propertyName, arr, true)) {
          // @ts-expect-error
          data.options.impl = false
        }
      }
    }
  }

  attachClassMetadata(
    INJECT_CUSTOM_METHOD,
    data,
    target,
  )
  // const foo2 = getClassMetadata<DecoratorMetaData[] | undefined>(INJECT_CUSTOM_METHOD, target)
  // console.log({ foo2 })
}


function regClassDecorator<TDecoratorParam extends object>(options: RegClassDecoratorOptions<TDecoratorParam>): void {
  const {
    args,
    decoratorKey,
    target,
    ignoreIfMethodDecoratorKeys,
  } = options

  assert(target)
  assert(decoratorKey)

  // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
  saveModule(decoratorKey, target)

  // 保存一些元数据信息，任意你希望存的东西
  saveClassMetadata(
    decoratorKey,
    args,
    target,
  )
  // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
  // Scope(ScopeEnum.Request)(target)

  decoratorAllClassMethodsOnPrototype(options)
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  setImplToFalseIfDecoratedWithBothClassAndMethod(target, decoratorKey, ignoreIfMethodDecoratorKeys)
  // const foo4 = getClassMetadata(INJECT_CUSTOM_METHOD, target)
  // void foo4

  // 调用一下 Provide 装饰器，这样用户的 class 可以省略写 @Provide() 装饰器了
  Provide()(target)
}

function decoratorAllClassMethodsOnPrototype<TDecoratorParam extends object>(options: RegClassDecoratorOptions<TDecoratorParam>): unknown {
  const { target, decoratorKey, args } = options

  assert(typeof target.prototype === 'object', 'target.prototype is not an object')

  const prot = target.prototype as unknown
  for (const propertyName of Object.getOwnPropertyNames(prot)) {
    if (propertyName === 'constructor') { continue }

    const descriptor = Object.getOwnPropertyDescriptor(prot, propertyName)
    if (typeof descriptor?.value === 'function') {
      // if (! isAsyncFunction(descriptor.value)) { continue }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (descriptor.value.constructor.name !== 'AsyncFunction') { continue }

      regMethodDecorator<TDecoratorParam>({
        target,
        propertyName,
        method: descriptor.value,
        decoratorKey, // METHOD_KEY_Cacheable,
        args,
        decoratedType: 'class',
      })
    }
  }

  return target
}

