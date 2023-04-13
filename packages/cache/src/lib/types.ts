/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CacheManager } from '@midwayjs/cache'
import {
  Context,
  DecoratorExecutorOptionsBase,
} from '@mwcp/share'
import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'


export enum ConfigKey {
  config = 'cacheConfig',
  middlewareConfig = 'cacheMiddlewareConfig',
  namespace = 'cache',
  componentName = 'cacheComponent',
  CacheMetaType = 'CacheMetaType',
}


export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>

export interface Config {
  /**
   * @default 'memory'
   * @link https://github.com/node-cache-manager/node-cache-manager#store-engines
   */
  store: unknown
  options: {
    /**
     * @default 512
     */
    max: number,
    /**
     * time to live in seconds
     * @default 10(sec)
     */
    ttl: number,
  }
}

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
) => string | undefined

export type CacheConditionFn<M extends MethodType | undefined = undefined> = (
  this: Context,
  /** Arguments of the method */
  args: M extends MethodType ? Parameters<M> : any,
  /**
   * Result of the method. Only for using `@CacheEvict`
   * - value always be undefined if `beforeInvocation`is true
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
  key: string | number | bigint | KeyGenerator<M> | undefined
  /**
   * time to live in seconds
   * @default 10(sec)
   */
  ttl: number | undefined | CacheTTLFn<M>
  /**
   * Returns false to skip cache
   * @default undefined - always cache
   */
  condition: CacheConditionFn<M> | boolean | undefined
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
}


export type Method = (...args: unknown[]) => Promise<unknown>

export interface DecoratorExecutorOptions<T extends CacheableArgs | CacheEvictArgs = any>
  extends DecoratorExecutorOptionsBase<T> {

  cacheManager?: CacheManager | undefined
  config: Config | undefined
}

