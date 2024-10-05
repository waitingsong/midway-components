import { customDecoratorFactory } from '@mwcp/share'
import type { MethodType } from '@waiting/shared-types'

import {
  METHOD_KEY_CacheEvict,
  METHOD_KEY_CachePut,
  METHOD_KEY_Cacheable,
} from '../config.js'
import type { CacheableArgs } from '../types.js'

import { DecoratorHandlerCacheable } from './cacheable.handler.js'


export const cacheableClassIgnoreIfMethodDecoratorKeys = [
  METHOD_KEY_CacheEvict,
  METHOD_KEY_CachePut,
]
export const cacheableMethodIgnoreIfMethodDecoratorKeys = []

/**
 * 声明式缓存装饰器
 * Declarative Cacheable Decorator
 * @description
 * - Support class
 * - Not support sync method
 * @returns MethodDecorator | ClassDecorator
 */
export function Cacheable<M extends MethodType | undefined = undefined>(options?: Partial<CacheableArgs<M>>) {

  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    classIgnoreIfMethodDecoratorKeys: cacheableClassIgnoreIfMethodDecoratorKeys,
    methodIgnoreIfMethodDecoratorKeys: cacheableMethodIgnoreIfMethodDecoratorKeys,
    decoratorHandlerClass: DecoratorHandlerCacheable,
  })
}

