/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CachingFactory, CacheManagerOptions } from '@midwayjs/cache-manager'
import type { AbstractTraceService } from '@mwcp/otel'
import {
  Context,
  DecoratorExecutorParamBase,
} from '@mwcp/share'
import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'


export enum ConfigKey {
  namespace = 'cache',
  config = 'cacheManager',
  middlewareConfig = 'cacheMiddlewareConfig',
  componentName = 'cacheComponent',
  CacheMetaType = 'CacheMetaType',
}

export enum Msg {
  hello = 'hello world',
  AuthFailed = 'Authentication Failed',
}

export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>

export interface Config {
  enableDefaultRoute: boolean
  clients: Record<string, CacheManagerOptions>
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type MethodType = (...input: any[]) => (any | Promise<any>)

/**
 * @param ctx Koa context
 * @param args Arguments of the method
 * @param result Result of the method. Only for using `@CacheEvict`
 * @returns if undefined, there is no tailing ":" in cacheName
 */
export type KeyGenerator<M extends MethodType | undefined = undefined> = (
  this: Context,
  /** Arguments of the method */
  args: M extends MethodType ? Parameters<M> : any,
  /**
   * Result of the method(). Only for using `@CacheEvict`
   * - value always be undefined if `beforeInvocation`is true
   */
  result: M extends MethodType ? Awaited<ReturnType<M>> : undefined
) => string | undefined | false // undefined/false means skip cache

export type CacheConditionFn<M extends MethodType | undefined = undefined> = (
  this: Context,
  /** Arguments of the method */
  args: M extends MethodType ? Parameters<M> : any,
  /**
   * Result of the method.
   * - Value valid Only when `@CacheEvict` and `beforeInvocation` is false
   * - always undefined when `@Cacheable` and `@CachePut`
   */
  result: M extends MethodType ? Awaited<ReturnType<M>> | undefined : undefined
) => boolean | Promise<boolean>


export type CacheTTLFn<M extends MethodType | undefined = undefined> = (
  this: Context,
  /** Arguments of the method */
  args: M extends MethodType ? Parameters<M> : any,
  /**
   * Result of the method. Only for using `@CacheEvict`
   * - value always be undefined if `beforeInvocation`is true
   */
  result: M extends MethodType ? Awaited<ReturnType<M>> | undefined : undefined
) => number | Promise<number>

export interface CacheMetaType {
  readonly cacheKey?: string
  readonly cacheKeyHash?: string | undefined
  readonly ttl?: number
}

export type DataWithCacheMeta<T = unknown> = T extends object
  ? T & { CacheMetaType?: CacheMetaType }
  : T

export interface CachedResponse<T = unknown> {
  CacheMetaType?: CacheMetaType
  value: T
}

export interface CacheableArgs<M extends MethodType | undefined = undefined> {
  /**
   * Name of the cache set
   * @default `${className}.${methodName}`
   */
  cacheName: string | undefined
  /**
   * value will be appended to cacheName
   */
  key: string | number | bigint | KeyGenerator<M> | undefined
  /**
   * time to live in seconds
   * @default 10(sec)
   */
  ttl: number | undefined | CacheTTLFn<M>
  /**
   * false/undefined to skip cache
   * @default undefined - always cache
   */
  condition: CacheConditionFn<M> | boolean | undefined
  /**
   * @default 'default'
   */
  instanceId?: string | undefined
}

export interface CacheEvictArgs<M extends MethodType | undefined = undefined> {
  /**
   * Name of the cache set
   * @default `${className}.${methodName}`
   */
  cacheName: string | undefined
  key: string | number | bigint | KeyGenerator<M> | undefined
  /**
   * @default false
   */
  beforeInvocation: boolean
  /**
   * Returns false to skip evict
   * @default undefined - always evict
   */
  condition: CacheConditionFn<M> | boolean | undefined
  /**
   * @default 'default'
   */
  instanceId?: string | undefined
}


export type Method = (...args: unknown[]) => Promise<unknown>

export interface DecoratorExecutorOptions<T extends CacheableArgs | CacheEvictArgs = any>
  extends DecoratorExecutorParamBase<T> {

  traceService: AbstractTraceService | undefined
  cachingFactory: CachingFactory
  config: Config
  /**
   * @default 'default'
   */
  cachingInstanceId?: string | undefined
}

