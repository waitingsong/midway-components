/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  MethodDecoratorOptions,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'
import type { Span } from '@opentelemetry/api'
import { MethodTypeUnknown } from '@waiting/shared-types'

import { Application, Context, Msg } from '../types.js'


/**
 * @description
 * - Must exports with package
 * - Must decorated by `@Singleton` or `@Provide` , it actually is a `Singleton` class
 * - Can inject config by `@Config`
 * - Can inject `Singleton` scope Class
 * - Can NOT inject `Request` scope Class
 */
export abstract class AbstractDecoratorHandler {
  abstract readonly app: Application
  abstract genExecutorParamAsync(options: DecoratorExecutorParamBase): Promise<DecoratorExecutorParamBase>
  abstract genExecutorParam(options: DecoratorExecutorParamBase): DecoratorExecutorParamBase
  abstract executorAsync(options: any): Promise<unknown>
  abstract executorSync(options: any): unknown
}

/**
 * @description
 * - Must export
 * - Must decorated by `@Singleton` or `@Provide` , it actually is a `Singleton` class
 * - Can inject config by `@Config`
 * - Can inject `Singleton` scope Class
 * - Can NOT inject `Request` scope Class
 */
export class DecoratorHandlerBase extends AbstractDecoratorHandler {
  readonly app: Application

  /**
   * - For Async method (executorAsync) ONLY
   * - Run before `genExecutorParam()`
   * @description the return value will be passed to `executorAsync` only
   */
  async genExecutorParamAsync(options: DecoratorExecutorParamBase): Promise<DecoratorExecutorParamBase> {
    return options
  }

  /**
   * @description the return value will be passed to `executorSync` and `executorAsync`
   */
  genExecutorParam(options: DecoratorExecutorParamBase) {
    return options
  }

  /**
   * You should override this method to implement the decorator logic.
   * Otherwise, it will throw an error, if async method decorated by the Decorator (eg. @Cacheable()).
   */
  async executorAsync(options: any): Promise<unknown> {
    console.error(Msg.DecoratorHandlerExecutorSyncForbidden, options)
    throw new TypeError(Msg.DecoratorHandlerExecutorAsyncForbidden)
  }

  /**
   * You should override this method to implement the decorator logic.
   * Otherwise, it will throw an error, if sync method decorated by the Decorator (eg. @Cacheable()).
   */
  executorSync(options: any): unknown {
    console.error(Msg.DecoratorHandlerExecutorSyncForbidden, options)
    throw new TypeError(Msg.DecoratorHandlerExecutorSyncForbidden)
  }

}

export interface CustomDecoratorFactoryOptions<TDecoratorParam extends object = object> {
  /**
   * @example METHOD_KEY_Cacheable
   */
  decoratorKey: string
  decoratorArgs: Partial<TDecoratorParam> | undefined
  /**
   * @description undefined equals to true
   * @default true
   */
  enableClassDecorator?: boolean | undefined
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * Always contains the decoratorKey
   * @description class has decorator @Cacheable, method has decorator @CacheEvict,
   *  then the method will be decorated by @Cacheable but with impl:false.
   */
  classIgnoreIfMethodDecoratorKeys?: string[]
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * @description method has decorators @Transactional and @Cacheable
   *  pass [METHOD_KEY_Cacheable], then the method decorated by @Cacheable with impl:false.
   */
  methodIgnoreIfMethodDecoratorKeys?: string[]
  before?: FnRegCustomDecorator<TDecoratorParam>
  after?: FnRegCustomDecorator<TDecoratorParam>
  decoratorHandlerClass?: typeof DecoratorHandlerBase
}

export interface DecoratorExecutorParamBase<TDecoratorParam extends object = object> {
  argsFromClassDecorator: DecoratorMetaDataPayload<Partial<TDecoratorParam>> | undefined
  argsFromMethodDecorator: DecoratorMetaDataPayload<Partial<TDecoratorParam>> | undefined
  /** Merged from argsFromClassDecorator and argsFromMethodDecorator */
  mergedDecoratorParam: DecoratorMetaDataPayload<TDecoratorParam> | undefined
  decoratorKey: string
  /** 装饰器所在类实例(包括注入对象) */
  instance: InstanceWithDecorator
  /** Caller Class name */
  instanceName: string
  method: MethodTypeUnknown
  methodArgs: unknown[]
  methodName: string
  methodResult?: unknown
  methodIsAsyncFunction?: boolean
  webApp: Application
  webContext: Context | undefined
  /**
   * @description no trace if false, use current span if undefined
   */
  span?: Span | undefined | false
}


/**
 * 装饰器所在的（注入）实例
 * - InstanceWithDecorator.constructor === ClassWithDecorator
 */
export type InstanceWithDecorator = Function & {
  /** web context */
  [REQUEST_OBJ_CTX_KEY]?: Context,
  [key: string]: any,
}
export type DecoratedType = 'class' | 'method'
export interface DecoratedTypeMeta {
  /** 装饰器应用类型(不可枚举) */
  decoratedType?: DecoratedType | undefined
}

/**
 * 被装饰的类（原型，不包括注入的属性）或者类方法
 * - ClassWithDecorator === InstanceWithDecorator.constructor
 * - function: class constructor
 * - object: class method
 */
export type ClassWithDecorator = object | MethodTypeUnknown

export type DecoratorMetaDataPayload<TDecoratorParam extends object = object>
= TDecoratorParam & DecoratedTypeMeta

export interface DecoratorMetaData<T extends object = object> {
  propertyName: string
  /** decorator key */
  key: string
  /** args */
  metadata: DecoratorMetaDataPayload<T>
  options: MethodDecoratorOptions | undefined
}


export interface RegClassDecoratorOptions<TDecoratorParam extends object> {
  decoratorKey: string
  target: Function
  args: Partial<TDecoratorParam> | PropertyKey | undefined
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey in ignoreIfMethodDecoratorKeys.
   * Always contains the decoratorKey
   * @example class has decorator @Cacheable, method has decorator @CacheEvict,
   *  then the method will be decorated by @Cacheable but with impl:false.
   */
  ignoreIfMethodDecoratorKeys?: string[] | undefined
}
// export type CustomClassDecorator<TDecoratorParam extends {} = any> = (
//   options: CustomClassDecoratorOptions<TDecoratorParam>,
// ) => MethodDecorator & ClassDecorator

export interface RegMethodDecoratorOptions<TDecoratorParam extends object> {
  /**
   * @example METHOD_KEY_Cacheable
   */
  decoratorKey: string
  decoratorType?: string
  args: Partial<TDecoratorParam> | PropertyKey | undefined
  target: ClassWithDecorator
  propertyName: string
  // descriptor: PropertyDescriptor
  method: MethodTypeUnknown
  decoratedType?: 'method' | 'class'
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * @description method has decorators @Transactional and @Cacheable
   *  pass [METHOD_KEY_Cacheable], then the method decorated by @Cacheable with impl:false.
   */
  ignoreIfMethodDecoratorKeys?: string[] | undefined
}
// export type RegMethodDecorator<TDecoratorParam extends object = object> = (
//   options: RegMethodDecoratorOptions<TDecoratorParam>,
// ) => PropertyDescriptor | undefined

export type FnRegCustomDecorator<TDecoratorParam extends object> = (
  target: ClassWithDecorator,
  propertyName: PropertyKey,
  descriptor: TypedPropertyDescriptor<unknown> | undefined,
  options: CustomDecoratorFactoryOptions<TDecoratorParam>,
) => void


export interface AopCallbackInputArgsType<TDecoratorParam extends object = object> {
  /** 装饰器所在的类定义 */
  target: Function
  propertyName: string
  metadata: DecoratorMetaDataPayload<TDecoratorParam>
}

export interface ExecuteDecoratorHandlerRunnerOptions {
  argsFromClassDecorator: DecoratorMetaDataPayload | undefined
  argsFromMethodDecorator: DecoratorMetaDataPayload | undefined
  /** Merged from argsFromClassDecorator and argsFromMethodDecorator */
  mergedDecoratorParam: DecoratorMetaDataPayload | undefined
  decoratorKey: string
  /** 装饰器所在类实例 */
  instance: InstanceWithDecorator
  /** Caller Class name */
  instanceName: string
  methodName: string
  methodIsAsyncFunction: boolean
  webApp: Application

  method: MethodTypeUnknown
  methodArgs: unknown[]
  methodResult?: unknown
  webContext: Context | undefined
}
