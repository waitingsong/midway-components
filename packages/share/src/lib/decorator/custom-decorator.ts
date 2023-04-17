/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import {
  INJECT_CUSTOM_METHOD,
  JoinPoint,
  attachClassMetadata,
  getClassMetadata,
  saveClassMetadata,
  saveModule,
  Provide,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'

import type { Context as WebContext } from '../index.js'

import { methodHasDecorated, setImplToFalseIfDecoratedWithBothClassAndMethod } from './custom-decorator.helper.js'
import {

  AopCallbackInputArgsType,
  AroundFactoryOptions,
  AroundFactoryOptionsBase,
  CustomClassDecoratorOptions,
  CustomDecoratorFactoryOptions,
  CustomMethodDecoratorOptions,
  DecoratorExecutorOptionsBase,
  DecoratorExecutorFn,
  DecoratorMetaData,
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
        throw new Error(`Only method can be decorated with decorator "${decoratorKey}",
        target: ${target.constructor.name},
        ${propertyName} is not a method}`)
      }

      // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (descriptor.value.constructor.name !== 'AsyncFunction') {
      //   throw new Error(`Only async method can be decorated with decorator "${decoratorKey}"
      //   target: ${target.constructor.name}, propertyName: ${propertyName}`)
      // }

      return methodDecoratorPatcher({
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


function methodDecoratorPatcher<TDecoratorArgs extends {}>(
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
  if (ignoreIfMethodDecortaorKeys?.length) {
    const arr = getClassMetadata<DecoratorMetaData[] | undefined>(INJECT_CUSTOM_METHOD, target)
    if (arr?.length) {
      for (const key of ignoreIfMethodDecortaorKeys) {
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
  // void foo2
  return descriptor
}


function classDecoratorPatcher<TDecoratorArgs extends {}>(
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
      if (! isAsyncFunction(descriptor.value)) { continue }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // if (descriptor.value.constructor.name !== 'AsyncFunction') { continue }

      methodDecoratorPatcher<TDecoratorArgs>({
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
      around: (joinPoint: JoinPoint) => {
        const opts: AroundFactoryOptions<TDecoratorArgs> = {
          ...aroundFactoryOptions,
          decoratorKey,
          aopCallbackInputOptions,
          joinPoint,
        }
        const opts2: DecoratorExecutorOptionsBase<TDecoratorArgs> = genDecoratorExecutorOptionsFn(opts)

        if (typeof opts2.methodIsAsyncFunction === 'undefined') {
          opts2.methodIsAsyncFunction = !! joinPoint.proceedIsAsyncFunction
        }

        if (opts2.methodIsAsyncFunction === true) {
          const ret = aroundFactory(
            decoratorExecutor,
            opts2,
          )
          return ret
        }

        const ret = aroundFactorySync(
          decoratorExecutor,
          opts2,
        )
        return ret
      },
    }),
  )

}


async function aroundFactory<TDecoratorArgs extends {} = {}>(
  decoratorExecutor: DecoratorExecutorFn,
  options: DecoratorExecutorOptionsBase<TDecoratorArgs>,
): Promise<unknown> {

  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat = await decoratorExecutor(options)
  return dat
}

function aroundFactorySync<TDecoratorArgs extends {} = {}>(
  decoratorExecutor: DecoratorExecutorFn,
  options: DecoratorExecutorOptionsBase<TDecoratorArgs>,
): unknown {

  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat: unknown = decoratorExecutor(options)
  return dat
}


export function genDecoratorExecutorOptionsBase<TDecoratorArgs extends {} = {}>(
  joinPoint: JoinPoint,
  aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorArgs>,
  baseOptions: Partial<DecoratorExecutorOptionsBase<TDecoratorArgs>> = {},
): DecoratorExecutorOptionsBase<TDecoratorArgs> {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  const instance = joinPoint.target
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = baseOptions.webContext ?? instance[REQUEST_OBJ_CTX_KEY] as WebContext | undefined

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const callerClass = instance.constructor?.name ?? aopCallbackInputOptions.target.name ?? ''
  const callerMethod = joinPoint.methodName
  const { args, target } = joinPoint

  // const func = joinPoint.proceed.bind(joinPoint.target)
  const func = joinPoint.proceed.bind(void 0)

  assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

  const opts: DecoratorExecutorOptionsBase<TDecoratorArgs> = {
    argsFromClassDecorator: void 0,
    argsFromMethodDecorator: void 0,
    decoratorKey: baseOptions.decoratorKey ?? '',
    config: baseOptions.config ?? void 0,
    instance: target,
    instanceName: callerClass,
    method: func,
    // index:0 may webcontext
    methodArgs: args,
    methodName: callerMethod,
    methodIsAsyncFunction: !! joinPoint.proceedIsAsyncFunction,
    webApp: baseOptions.webApp ?? void 0,
    webContext,
  }
  return opts
}
