/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

import {
  methodHasDecorated,
  setImplToFalseIfDecoratedWithBothClassAndMethod,
} from './custom-decorator.helper.js'
import type {
  CustomClassDecoratorParam,
  CustomDecoratorFactoryParam,
  CustomMethodDecoratorParam,
  DecoratorMetaData,
  InstanceOfDecorator,
} from './custom-decorator.types.js'


export function customDecoratorFactory<TDecoratorParam extends {}>(options: CustomDecoratorFactoryParam<TDecoratorParam>): MethodDecorator & ClassDecorator {

  const DecoratorFactory = (
    target: Object | Function,
    propertyName: PropertyKey,
    descriptor?: TypedPropertyDescriptor<any> | undefined,
  ) => { regCustomDecorator(target, propertyName, descriptor, options) }

  // @ts-expect-error
  return DecoratorFactory
}

export function regCustomDecorator<TDecoratorParam extends {}>(
  target: Object | Function,
  propertyName: PropertyKey,
  descriptor: TypedPropertyDescriptor<any> | undefined,
  options: CustomDecoratorFactoryParam<TDecoratorParam>,
): void {

  assert(target, 'target is undefined')

  const beforeAfterOpts: CustomDecoratorFactoryParam<TDecoratorParam> = {
    ...options,
  }
  delete beforeAfterOpts.before
  delete beforeAfterOpts.after

  if (typeof options.before === 'function') {
    options.before(target, propertyName, descriptor, beforeAfterOpts)
  }

  if (typeof target === 'function') { // Class Decorator, target is class constructor
    if (! options.enableClassDecorator) { return }

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
    if (typeof descriptor.value !== 'function') {
      throw new Error(`Only method can be decorated with decorator "${decoratorKey}",
        target: ${target.constructor.name},
        ${propertyName.toString()} is not a method`)
    }

    // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // if (descriptor.value.constructor.name !== 'AsyncFunction') {
    //   throw new Error(`Only async method can be decorated with decorator "${decoratorKey}"
    //   target: ${target.constructor.name}, propertyName: ${propertyName}`)
    // }

    const obj = target as InstanceOfDecorator
    const opts = {
      decoratorKey,
      target: obj,
      propertyName: propertyName.toString(),
      args: decoratorArgs,
      method: descriptor.value,
      ignoreIfMethodDecoratorKeys: options.methodIgnoreIfMethodDecoratorKeys,
    }

    regMethodDecorator(opts)
  }

  if (typeof options.after === 'function') {
    options.after(target, propertyName, descriptor, beforeAfterOpts)
  }

}


function regMethodDecorator<TDecoratorParam extends {} = any>(options: CustomMethodDecoratorParam<TDecoratorParam>): void {

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
  const metadata = args ?? {}
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


function regClassDecorator<TDecoratorParam extends {}>(options: CustomClassDecoratorParam<TDecoratorParam>): void {

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

function decoratorAllClassMethodsOnPrototype<TDecoratorParam extends {}>(options: CustomClassDecoratorParam<TDecoratorParam>): unknown {

  const { target, decoratorKey, args } = options

  if (! target.prototype) {
    return target
  }

  const prot = target.prototype as unknown
  for (const propertyName of Object.getOwnPropertyNames(prot)) {
    if (propertyName === 'constructor') { continue }

    const descriptor = Object.getOwnPropertyDescriptor(prot, propertyName)
    if (! descriptor) { continue }

    if (typeof descriptor.value === 'function') {
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


