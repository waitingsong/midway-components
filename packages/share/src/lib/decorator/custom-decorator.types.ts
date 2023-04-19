/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  MethodDecoratorOptions,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'

import { Application, Context } from '../types.js'


/** 装饰器所在的实例 */
export type InstanceOfDecorator = (new (...args: unknown[]) => unknown) & {
  /** web context */
  [REQUEST_OBJ_CTX_KEY]?: Context,
}
export type DecoratedType = 'class' | 'method'
export interface DecoratedTypeMeta {
  decoratedType?: DecoratedType
}

export interface DecoratorMetaData<T = unknown> {
  propertyName: string
  /** decorator key */
  key: string
  metadata: T & DecoratedTypeMeta
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

  argsFromClassDecorator: (Partial<TDecoratorParam> & DecoratedTypeMeta) | undefined
  argsFromMethodDecorator: (Partial<TDecoratorParam> & DecoratedTypeMeta) | undefined
  /** Merged from argsFromClassDecorator and argsFromMethodDecorator */
  mergedDecoratorParam: TDecoratorParam & DecoratedTypeMeta
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
}

export type FnDecoratorExecutor = (options: any) => unknown


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
  descriptor: PropertyDescriptor
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
}


export interface RegisterDecoratorHandlerParam<TDecoratorParam extends {} = any> {
  /**
   * @example 'decorator:cacheable'
   */
  decoratorKey: string
  decoratorService: MidwayDecoratorService
  fnDecoratorExecutor: FnDecoratorExecutor
  fnGenDecoratorExecutorParam: FnGenDecoratorExecutorParam<TDecoratorParam> | void | null
  [key: string]: unknown
}


export type FnGenDecoratorExecutorParam<T extends {} = any>
= (options: DecoratorExecutorParamBase<T>) => DecoratorExecutorParamBase<T>


export interface AopCallbackInputArgsType<TDecoratorParam extends {} = {}> {
  /** 装饰器所在的实例 */
  target: InstanceOfDecorator
  propertyName: string
  metadata: Partial<TDecoratorParam> & DecoratedTypeMeta
}


