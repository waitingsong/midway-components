/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  MethodDecoratorOptions,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'
import { MethodTypeUnknown } from '@waiting/shared-types'

import { Application, Context } from '../types.js'


/**
 * @docs https://midwayjs.org/docs/aspect
 * @description
 * - Must exports with package
 * - Must decorated by `@Singleton` or `@Provide` , it actually is a `Singleton` class
 * - Can inject config by `@Config`
 * - Can inject `Singleton` scope Class
 * - Can NOT inject `Request` scope Class
 */
export class DecoratorHandlerBase {
  readonly app: Application
  /**
   * @Note It runs at most once in the lifecycle of each request
   * If return type is Promise, then decorated method must be async function
   */
  genExecutorParam?(options: DecoratorExecutorParamBase): DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase>
  /**
   * @Caution It's necessary to run original method in `around` method manually,
   * the return value of original method is set to `options.methodResult`
   */
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  before?(options: DecoratorExecutorParamBase): void
  around?(options: DecoratorExecutorParamBase): unknown
  /**
   * Can return Error, it will be set to `options.error`
   */
  afterReturn?(options: DecoratorExecutorParamBase): unknown
  afterThrow?(options: DecoratorExecutorParamBase): void
  after?(options: DecoratorExecutorParamBase): void
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
  /**
   * Running at register stage
   */
  beforeRegister?: FnRegCustomDecorator<TDecoratorParam>
  /**
   * Running at register stage
   */
  afterRegister?: FnRegCustomDecorator<TDecoratorParam>
  decoratorHandlerClass: typeof DecoratorHandlerBase
}

export interface DecoratorExecutorParamBase<TDecoratorParam extends object = object> {
  argsFromClassDecorator: DecoratorMetaDataPayload<Partial<TDecoratorParam>> | undefined
  argsFromMethodDecorator: DecoratorMetaDataPayload<Partial<TDecoratorParam>> | undefined
  /** Merged from argsFromClassDecorator and argsFromMethodDecorator */
  mergedDecoratorParam: DecoratorMetaDataPayload<TDecoratorParam> | undefined
  decoratorKey: string
  decoratorHandlerClassName: string
  /** 装饰器所在类实例(包括注入对象) */
  instance: ClzInstance
  /** Caller Class name */
  instanceName: string
  /**
   * undefined when afterReturn, afterThrow, after
   */
  method: MethodTypeUnknown | undefined
  methodArgs: unknown[]
  methodName: string
  methodResult?: unknown
  error?: Error | undefined
  methodIsAsyncFunction?: boolean
  webApp: Application
  webContext: Context | undefined
}

/**
 * 装饰器所在的（注入）实例
 * - InstanceWithDecorator.constructor === ClassWithDecorator
 */
export interface ClzInstance {
  /** web context */
  [REQUEST_OBJ_CTX_KEY]?: Context
  [key: string]: any
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

