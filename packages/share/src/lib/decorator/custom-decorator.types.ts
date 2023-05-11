/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  MethodDecoratorOptions,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'
import type { Span } from '@opentelemetry/api'
import { MethodType } from '@waiting/shared-types'

import { Application, Context } from '../types.js'


/** 装饰器所在的实例 */
export type InstanceOfDecorator = (new (...args: unknown[]) => unknown) & {
  /** web context */
  [REQUEST_OBJ_CTX_KEY]?: Context,
}
export type DecoratedType = 'class' | 'method'
export interface DecoratedTypeMeta {
  /** 装饰器应用类型(不可枚举) */
  decoratedType?: DecoratedType
}

export type DecoratorMetaDataPayload<TDecoratorParam extends {} = {}>
= TDecoratorParam & DecoratedTypeMeta

export interface DecoratorMetaData<T extends {} = {}> {
  propertyName: string
  /** decorator key */
  key: string
  metadata: DecoratorMetaDataPayload<T>
  options: MethodDecoratorOptions | undefined
}
export type Method = (...args: unknown[]) => unknown | Promise<unknown>

export interface AroundFactoryParamBase {
  webApp: Application
  [key: string]: unknown
}

export interface DecoratorExecutorParamBase<
  TDecoratorParam extends {} = {}
> extends AroundFactoryParamBase {

  argsFromClassDecorator: Partial<DecoratorMetaDataPayload<TDecoratorParam>> | undefined
  argsFromMethodDecorator: Partial<DecoratorMetaDataPayload<TDecoratorParam>> | undefined
  /** Merged from argsFromClassDecorator and argsFromMethodDecorator */
  mergedDecoratorParam: DecoratorMetaDataPayload<TDecoratorParam> | undefined
  decoratorKey: string
  /** 装饰器所在类实例 */
  instance: InstanceOfDecorator
  /** Caller Class name */
  instanceName: string
  method: Method
  methodArgs: unknown[]
  methodName: string
  methodResult?: unknown
  methodIsAsyncFunction?: boolean
  webContext?: Context | undefined
  span?: Span | undefined
}

export type FnDecoratorExecutor = (options: any) => unknown
export type FnDecoratorExecutorAsync = (options: any) => Promise<unknown>


export interface CustomClassDecoratorParam<TDecoratorParam extends {}> {
  decoratorKey: string
  target: Function
  args: Partial<TDecoratorParam> | undefined
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * Always contains the decoratorKey
   * @description class has decorator @Cacheable, method has decorator @CacheEvict,
   *  then the method will be decorated by @Cacheable but with impl:false.
   */
  ignoreIfMethodDecortaorKeys?: string[] | undefined
}
export type CustomClassDecorator<TDecoratorParam extends {} = any> = (
  options: CustomClassDecoratorParam<TDecoratorParam>,
) => void

export interface CustomMethodDecoratorParam<TDecoratorParam extends {}> {
  /**
   * @example METHOD_KEY_Cacheable
   */
  decoratorKey: string
  decoratorType?: string
  args: Partial<TDecoratorParam> | undefined
  target: InstanceOfDecorator | Function
  propertyName: string
  // descriptor: PropertyDescriptor
  method: MethodType
  decoratedType?: 'method' | 'class'
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * @description method has decorators @Transactional and @Cacheable
   *  pass [METHOD_KEY_Cacheable], then the method decorated by @Cacheable with impl:false.
   */
  ignoreIfMethodDecortaorKeys?: string[] | undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomMethodDecorator<TDecoratorParam extends {} = any> = (
  options: CustomMethodDecoratorParam<TDecoratorParam>,
) => PropertyDescriptor | void

export interface CustomDecoratorFactoryParam<TDecoratorParam extends {}> {
  /**
   * @example METHOD_KEY_Cacheable
   */
  decoratorKey: string
  decoratorArgs: Partial<TDecoratorParam> | undefined
  /**
   * @default false
   */
  enableClassDecorator: boolean
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * Always contains the decoratorKey
   * @description class has decorator @Cacheable, method has decorator @CacheEvict,
   *  then the method will be decorated by @Cacheable but with impl:false.
   */
  classIgnoreIfMethodDecortaorKeys?: string[]
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * @description method has decorators @Transactional and @Cacheable
   *  pass [METHOD_KEY_Cacheable], then the method decorated by @Cacheable with impl:false.
   */
  methodIgnoreIfMethodDecortaorKeys?: string[]
  before?: FnRegCustomDecorator<TDecoratorParam>
  after?: FnRegCustomDecorator<TDecoratorParam>
}

export type FnRegCustomDecorator<TDecoratorParam extends {}> = (
  target: Object | Function,
  propertyName: PropertyKey,
  descriptor: TypedPropertyDescriptor<any> | undefined,
  options: CustomDecoratorFactoryParam<TDecoratorParam>,
) => void

export interface RegisterDecoratorHandlerParam<TDecoratorParam extends {} = any> {
  /**
   * @example 'decorator:cacheable'
   */
  decoratorKey: string
  decoratorService: MidwayDecoratorService
  /**
   * false means not support async function being decorated
   */
  fnDecoratorExecutorAsync: FnDecoratorExecutorAsync | false
  /**
   * - false means not support sync function being decorated
   * - 'bypass' means bypass the decorator
   */
  fnDecoratorExecutorSync: FnDecoratorExecutor | false | 'bypass'
  fnGenDecoratorExecutorParam: FnGenDecoratorExecutorParam<TDecoratorParam> | void | null
  [key: string]: unknown
}


export type FnGenDecoratorExecutorParam<T extends {} = any>
= (options: DecoratorExecutorParamBase<T>) => DecoratorExecutorParamBase<T>


export interface AopCallbackInputArgsType<TDecoratorParam extends {} = {}> {
  /** 装饰器所在的类原型 */
  target: Function
  propertyName: string
  metadata: DecoratorMetaDataPayload<TDecoratorParam>
}


