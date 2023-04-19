/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'
// import { isAsyncFunction } from 'node:util/types'

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
import deepmerge from 'deepmerge'

import type { Context as WebContext } from '../types.js'

import { methodHasDecorated, setImplToFalseIfDecoratedWithBothClassAndMethod } from './custom-decorator.helper.js'
import type {
  AopCallbackInputArgsType,
  AroundFactoryParamBase,
  CustomClassDecoratorParam,
  CustomDecoratorFactoryParam,
  CustomMethodDecoratorParam,
  DecoratorExecutorParamBase,
  FnDecoratorExecutor,
  DecoratorMetaData,
  RegisterDecoratorHandlerParam,
  InstanceOfDecorator,
} from './custom-decorator.types.js'


export function customDecoratorFactory<TDecoratorParam extends {}>(
  options: CustomDecoratorFactoryParam<TDecoratorParam>,
): MethodDecorator & ClassDecorator {


  const DecoratorFactory = (
    target: {},
    propertyName?: string,
    descriptor?: PropertyDescriptor,
  ): PropertyDescriptor | Function | void => {

    assert(target, 'target is undefined')

    const { enableClassDecorator } = options

    if (typeof target === 'function') { // Class Decorator, target is class constructor
      if (! enableClassDecorator) { return }

      const { decoratorArgs, decoratorKey } = options
      assert(decoratorKey, 'decoratorKey is undefined')
      assert(typeof descriptor === 'undefined', 'descriptor is not undefined')

      return regClassDecorator({
        decoratorKey,
        target,
        args: decoratorArgs,
        ignoreIfMethodDecortaorKeys: options.classIgnoreIfMethodDecortaorKeys,
      })
    }

    if (typeof target === 'object') { // Method Decorator, target is class instance
      const { decoratorKey, decoratorArgs } = options

      assert(decoratorKey, 'decoratorKey is undefined')
      assert(target, 'target is undefined')
      assert(propertyName, 'propertyName is undefined')
      assert(descriptor, 'descriptor is undefined')

      // descriptor.value is the method being decorated
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

      const obj = target as InstanceOfDecorator

      regMethodDecorator({
        decoratorKey,
        target: obj,
        propertyName,
        args: decoratorArgs,
        method: descriptor.value,
        ignoreIfMethodDecortaorKeys: options.methodIgnoreIfMethodDecortaorKeys,
      })
      return descriptor
    }

    assert(false, 'Invalid decorator usage')
  }

  // @ts-ignore
  return DecoratorFactory
}


export function regMethodDecorator<TDecoratorParam extends {}>(
  options: CustomMethodDecoratorParam<TDecoratorParam>,
): void {

  const {
    decoratorKey,
    decoratedType,
    args,
    target,
    propertyName,
    method,
    ignoreIfMethodDecortaorKeys,
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

  // const foo1 = getClassMetadata<DecoratorMetaData[] | undefined>(INJECT_CUSTOM_METHOD, target)
  // console.log({ foo1 })
  attachClassMetadata(
    INJECT_CUSTOM_METHOD,
    data,
    target,
  )
  // const foo2 = getClassMetadata<DecoratorMetaData[] | undefined>(INJECT_CUSTOM_METHOD, target)
  // console.log({ foo2 })
}


export function regClassDecorator<TDecoratorParam extends {}>(
  options: CustomClassDecoratorParam<TDecoratorParam>,
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

function decoratorClassMethodsOnPrototype<TDecoratorParam extends {}>(
  options: CustomClassDecoratorParam<TDecoratorParam>,
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


export function registerDecoratorHandler<TDecoratorParam extends {} = any>(
  options: RegisterDecoratorHandlerParam<TDecoratorParam>,
  aroundFactoryOptions: AroundFactoryParamBase,
): void {

  const {
    decoratorKey,
    decoratorService,
    fnDecoratorExecutor,
    fnGenDecoratorExecutorParam,
  } = options

  assert(decoratorKey, 'decoratorKey is required')
  assert(decoratorService, 'decoratorService is required')

  let executor = fnDecoratorExecutor
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! fnDecoratorExecutor && typeof options['decoratorExecutor'] === 'function') {
    // @ts-ignore
    executor = options['decoratorExecutor']
  }
  else {
    assert(typeof fnDecoratorExecutor === 'function', 'fnDecoratorExecutor is required')
  }

  let genDecoratorExecutorParam = fnGenDecoratorExecutorParam
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! fnGenDecoratorExecutorParam && typeof options['genDecoratorExecutorParam'] === 'function') {
    // @ts-ignore
    genDecoratorExecutorParam = options['genDecoratorExecutorParam']
  }

  decoratorService.registerMethodHandler(
    decoratorKey,
    aopCallbackInputOptions => ({
      around: (joinPoint: JoinPoint) => {
        const baseOpts = {
          ...aroundFactoryOptions,
          decoratorKey,
        }

        const opts2 = genDecoratorExecutorOptionsCommon<TDecoratorParam>(
          joinPoint,
          aopCallbackInputOptions,
          baseOpts,
        )
        const opts3 = typeof genDecoratorExecutorParam === 'function'
          ? genDecoratorExecutorParam(opts2)
          : opts2

        if (typeof opts3.methodIsAsyncFunction === 'undefined') {
          opts3.methodIsAsyncFunction = !! joinPoint.proceedIsAsyncFunction
        }

        if (opts3.methodIsAsyncFunction === true) {
          const ret = run(
            executor,
            opts3,
          )
          return ret
        }

        const ret = runSync(
          executor,
          opts3,
        )
        return ret
      },
    }),
  )

}


async function run<TDecoratorParam extends {} = {}>(
  decoratorExecutor: FnDecoratorExecutor,
  options: DecoratorExecutorParamBase<TDecoratorParam>,
): Promise<unknown> {

  // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
  const dat = await decoratorExecutor(options)
  return dat
}

function runSync<TDecoratorParam extends {} = {}>(
  decoratorExecutor: FnDecoratorExecutor,
  options: DecoratorExecutorParamBase<TDecoratorParam>,
): unknown {

  const dat = decoratorExecutor(options)
  return dat
}


export function genDecoratorExecutorOptionsCommon<TDecoratorParam extends {} = {}>(
  joinPoint: JoinPoint,
  aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorParam>,
  baseOptions: Partial<DecoratorExecutorParamBase<TDecoratorParam>> = {},
): DecoratorExecutorParamBase<TDecoratorParam> {

  assert(baseOptions, 'baseOptions is required')
  assert(typeof baseOptions === 'object', 'baseOptions is not object')
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

  const decoratorKey = baseOptions.decoratorKey ?? ''
  assert(decoratorKey, 'decoratorKey is undefined')
  const argsFromClassDecorator = getClassMetadata(decoratorKey, instance) as Partial<TDecoratorParam> | undefined
  const argsFromMethodDecorator = aopCallbackInputOptions.metadata
  const mergedDecoratorParam = deepmerge.all([
    argsFromClassDecorator ?? {},
    argsFromMethodDecorator,
  ])

  const opts: DecoratorExecutorParamBase<TDecoratorParam> = {
    ...baseOptions,
    argsFromClassDecorator,
    argsFromMethodDecorator,
    // @ts-expect-error
    mergedDecoratorParam,
    decoratorKey,
    instance: target,
    instanceName: callerClass,
    method: func,
    // index:0 may webcontext
    methodArgs: args,
    methodName: callerMethod,
    methodIsAsyncFunction: !! joinPoint.proceedIsAsyncFunction,
    webContext,
  }

  return opts
}
