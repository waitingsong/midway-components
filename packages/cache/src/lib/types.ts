/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from '@mwcp/share'
import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'


export enum ConfigKey {
  config = 'cacheConfig',
  middlewareConfig = 'cacheMiddlewareConfig',
  namespace = 'cache',
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


/**
 * @param ctx Koa context
 * @param args Arguments of the method
 */
export type KeyGenerator = (
  this: Context,
  /** Arguments of the method */
  args: any[] | any
) => string

export type CacheConditionFn = (
  this: Context,
  /** Arguments of the method */
  args: any[] | any
) => boolean | Promise<boolean>


export interface CacheMetaType {
  readonly cacheKey?: string
  readonly ttl?: number
}

export type DataWithCacheMeta<T = unknown> = T extends object
  ? T & { CacheMetaType?: CacheMetaType }
  : T

export interface CachedResponse<T = unknown> {
  CacheMetaType?: CacheMetaType
  value: T
}

export interface CacheableArgs {
  /**
   * Name of the cache set
   * @default `${className}.${methodName}`
   */
  cacheName: string | undefined
  key: string | number | bigint | KeyGenerator | undefined
  /**
   * time to live in seconds
   * @default 10(sec)
   */
  ttl: number | undefined
  /**
   * Returns false to skip cache
   * @default undefined - always cache
   */
  condition: CacheConditionFn | boolean | undefined
}

export interface CacheEvictArgs {
  /**
   * Name of the cache set
   * @default `${className}.${methodName}`
   */
  cacheName: string | undefined
  key: string | number | bigint | KeyGenerator | undefined
  /**
   * @default false
   */
  beforeInvocation: boolean
  /**
   * Returns false to skip evict
   * @default undefined - always evict
   */
  condition: CacheConditionFn | boolean | undefined
}


export interface DecoratorMetaData <T = unknown> {
  propertyName: string
  key: string
  metadata: T
  impl: boolean
}

