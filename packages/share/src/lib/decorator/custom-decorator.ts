/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'

import {
  INJECT_CUSTOM_METHOD,
  JoinPoint,
  attachClassMetadata,
  getClassMetadata,
  saveClassMetadata,
  saveModule,
  Provide,
} from '@midwayjs/core'

import { methodHasDecorated, setImplToFalseIfDecoratedWithBothClassAndMethod } from './custom-decorator.helper.js'
import {
  AroundFactoryOptions,
  AroundFactoryOptionsBase,
  CustomClassDecoratorOptions,
  CustomDecoratorFactoryOptions,
  CustomMethodDecoratorOptions,
  DecoratorExecutorOptionsBase,
  DecoratorExecutorFn,
  DecoratorMetaData,
  GenDecoratorExecutorOptionsFn,
  RegisterDecoratorHandlerOptions,
} from './custom-decorator.types.js'


export function customDecoratorFactory<TDecoratorArgs extends {}>(
  options: CustomDecoratorFactoryOptions<TDecoratorArgs>,
): MethodDecorator & ClassDecorator {

  const { enableClassDecorator } = options

  const DecoratorFactory = (
    target: {},
    propertyName?: string,
    descriptor?: PropertyDescriptor,
  ): PropertyDescriptor | Function | void => {

    assert(target, 'target is undefined')

    if (typeof target === 'function') { // Class Decorator
      if (! enableClassDecorator) { return }

      const { decoratorArgs, decoratorKey } = options
      assert(decoratorKey, 'decoratorKey is undefined')

      return classDecoratorPatcher({
        decoratorKey,
        target,
        args: decoratorArgs,
        ignoreIfMethodDecortaorKeys: options.classIgnoreIfMethodDecortaorKeys,
      })
    }

    if (typeof target === 'object') { // Method Decorator
      const { decoratorKey, decoratorArgs } = options

      assert(decoratorKey, 'decoratorKey is undefined')
      assert(target, 'target is undefined')
      assert(propertyName, 'propertyName is undefined')
      assert(descriptor, 'descriptor is undefined')

      if (typeof descriptor.value !== 'function') {
        throw new Error('Only method can be decorated with @Cacheable decorator')
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (descriptor.value.constructor.name !== 'AsyncFunction') {
        throw new Error('Only async method can be decorated with @Cacheable decorator')
      }

      return descriptorDecoratorPatcher({
        decoratorKey,
        target,
        propertyName,
        descriptor,
        args: decoratorArgs,
        ignoreIfMethodDecortaorKeys: options.methodIgnoreIfMethodDecortaorKeys,
      })
    }

    assert(false, 'Invalid decorator usage')
  }

  // @ts-ignore
  return DecoratorFactory
}


export function descriptorDecoratorPatcher<TDecoratorArgs extends {}>(
  options: CustomMethodDecoratorOptions<TDecoratorArgs>,
): PropertyDescriptor {

  const {
    decoratorKey,
    decoratedType,
    args,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    target,
    propertyName,
    descriptor,
    ignoreIfMethodDecortaorKeys,
  } = options

  assert(descriptor, 'descriptor is undefined')
  assert(typeof args === 'object' || typeof args === 'undefined', 'args is not an object or undefined')
  const metadata = args ?? {}
  Object.defineProperty(metadata, 'decoratedType', { value: decoratedType ?? 'method' })

  const data = {
    key: decoratorKey,
    metadata,
    propertyName,
    impl: true,
  }
  if (ignoreIfMethodDecortaorKeys?.length) {
    const arr = getClassMetadata<DecoratorMetaData[] | undefined>(INJECT_CUSTOM_METHOD, target)
    if (arr?.length) {
      for (const key of ignoreIfMethodDecortaorKeys) {
        if (methodHasDecorated(key, propertyName, arr, true)) {
          data.impl = false
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
  // void foo2
  return descriptor
}


export function classDecoratorPatcher<TDecoratorArgs extends {}>(
  options: CustomClassDecoratorOptions<TDecoratorArgs>,
): void {

  const {
    args,
    decoratorKey,
    target,
    ignoreIfMethodDecortaorKeys,
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

  decoratorClassMethodsOnPrototype(options)
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  setImplToFalseIfDecoratedWithBothClassAndMethod(target, decoratorKey, ignoreIfMethodDecortaorKeys)
  // const foo4 = getClassMetadata(INJECT_CUSTOM_METHOD, target)
  // void foo4

  // 调用一下 Provide 装饰器，这样用户的 class 可以省略写 @Provide() 装饰器了
  Provide()(target)
}

function decoratorClassMethodsOnPrototype<TDecoratorArgs extends {}>(
  options: CustomClassDecoratorOptions<TDecoratorArgs>,
): unknown {

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (descriptor.value.constructor.name !== 'AsyncFunction') { continue }

      descriptorDecoratorPatcher<TDecoratorArgs>({
        target,
        propertyName,
        descriptor,
        decoratorKey, // METHOD_KEY_Cacheable,
        args,
        decoratedType: 'class',
      })
    }
  }

  return target
}


export function registerDecoratorHandler<TDecoratorArgs extends {} = {}>(
  options: RegisterDecoratorHandlerOptions<TDecoratorArgs>,
  aroundFactoryOptions: AroundFactoryOptionsBase,
): void {

  const {
    decoratorKey,
    decoratorService,
    decoratorExecutor,
    genDecoratorExecutorOptionsFn,
  } = options

  assert(decoratorKey, 'decoratorKey is required')
  assert(decoratorService, 'decoratorService is required')
  assert(typeof decoratorExecutor === 'function', 'decoratorExecutor is required')
  assert(typeof genDecoratorExecutorOptionsFn === 'function', 'genDecoratorExecutorOptionsFn is required')

  decoratorService.registerMethodHandler(
    decoratorKey,
    aopCallbackInputOptions => ({
      around: async (joinPoint: JoinPoint) => {
        const opts = {
          ...aroundFactoryOptions,
          decoratorKey,
          aopCallbackInputOptions,
          joinPoint,
        }
        const ret = await aroundFactory(
          decoratorExecutor,
          genDecoratorExecutorOptionsFn,
          opts,
        )
        return ret
      },
    }),
  )
}


async function aroundFactory<TDecoratorArgs extends {} = {}>(
  decoratorExecutor: DecoratorExecutorFn,
  genDecoratorExecutorOptionsFn: GenDecoratorExecutorOptionsFn<TDecoratorArgs>,
  options: AroundFactoryOptions<TDecoratorArgs>,
): Promise<unknown> {

  assert(typeof decoratorExecutor === 'function', 'decoratorExecutor is not function')
  assert(typeof genDecoratorExecutorOptionsFn === 'function', 'genDecoratorExecutorOptionsFn is not function')

  const opts: DecoratorExecutorOptionsBase<TDecoratorArgs> = genDecoratorExecutorOptionsFn(options)
  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat = await decoratorExecutor(opts)
  return dat
}
