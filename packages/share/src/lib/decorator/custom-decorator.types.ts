/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  JoinPoint,
  MethodDecoratorOptions,
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'

import { Context } from '../types.js'


/** 装饰器所在的实例 */
export type InstanceOfDecorator = (new (...args: unknown[]) => unknown) & {
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
export type Method = (...args: unknown[]) => Promise<unknown>
export interface DecoratorExecutorOptionsBase<TDecoratorArgs extends {} = {}> {
  argsFromClassDecorator: (Partial<TDecoratorArgs> & DecoratedTypeMeta) | undefined
  argsFromMethodDecorator: (Partial<TDecoratorArgs> & DecoratedTypeMeta) | undefined
  decoratorKey: string
  config: any
  /** 装饰器所在类实例 */
  instance: InstanceOfDecorator
  method: Method
  methodArgs: unknown[]
  methodName: string
  methodResult?: unknown
  methodIsAsyncFunction?: boolean
  [key: string]: unknown
}

export type DecoratorExecutorFn<TDecoratorArgs extends {} = {}> = (
  options: DecoratorExecutorOptionsBase<TDecoratorArgs>,
) => Promise<unknown> | unknown


export interface CustomClassDecoratorOptions<TDecoratorArgs extends {}> {
  decoratorKey: string
  target: Function
  args: Partial<TDecoratorArgs> | undefined
  /**
   * meta.impl will set to false if the method is decorated with the decoratorKey.
   * Always contains the decoratorKey
   * @description class has decorator @Cacheable, method has decorator @CacheEvict,
   *  then the method will be decorated by @Cacheable but with impl:false.
   */
  ignoreIfMethodDecortaorKeys?: string[] | undefined
}
export type CustomClassDecorator<TDecoratorArgs extends {} = any> = (
  options: CustomClassDecoratorOptions<TDecoratorArgs>,
) => void

export interface CustomMethodDecoratorOptions<TDecoratorArgs extends {}> {
  /**
   * @example METHOD_KEY_Cacheable
   */
  decoratorKey: string
  decoratorType?: string
  args: Partial<TDecoratorArgs> | undefined
  target: any
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
export type CustomMethodDecorator<TDecoratorArgs extends {} = any> = (
  options: CustomMethodDecoratorOptions<TDecoratorArgs>,
) => PropertyDescriptor | void

export interface CustomDecoratorFactoryOptions<TDecoratorArgs extends {}> {
  /**
   * @example METHOD_KEY_Cacheable
   */
  decoratorKey: string
  decoratorArgs: Partial<TDecoratorArgs> | undefined
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


export interface RegisterDecoratorHandlerOptions<TDecoratorArgs extends {} = {}> {
  /**
   * @example 'decorator:cacheable'
   */
  decoratorKey: string
  decoratorService: MidwayDecoratorService
  decoratorExecutor: DecoratorExecutorFn<TDecoratorArgs>
  genDecoratorExecutorOptionsFn: GenDecoratorExecutorOptionsFn<TDecoratorArgs>
  [key: string]: unknown
}

export type AroundFactory<TDecoratorArgs extends {} = {}> = (
  options: AroundFactoryOptions<TDecoratorArgs>,
) => Promise<unknown>

export interface AroundFactoryOptionsBase {
  config: any
  [key: string]: unknown
}
export interface AroundFactoryOptions<TDecoratorArgs extends {} = {}>
  extends AroundFactoryOptionsBase {

  /**
   * @example METHOD_KEY_Cacaeable
   */
  decoratorKey: string
  aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorArgs>
  joinPoint: JoinPoint
}

export type GenDecoratorExecutorOptionsFn<TDecoratorArgs extends {} = {}> = (
  options: AroundFactoryOptions<TDecoratorArgs>,
) => DecoratorExecutorOptionsBase<TDecoratorArgs>

export interface AopCallbackInputArgsType<TDecoratorArgs extends {} = {}> {
  /** 装饰器所在的实例 */
  target: InstanceOfDecorator
  propertyName: string
  metadata: Partial<TDecoratorArgs> & DecoratedTypeMeta
}


