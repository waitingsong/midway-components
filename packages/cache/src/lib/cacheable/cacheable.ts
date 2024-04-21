import { customDecoratorFactory } from '@mwcp/share'
import type { MethodType } from '@waiting/shared-types'

import {
  METHOD_KEY_Cacheable,
  METHOD_KEY_CacheEvict,
  METHOD_KEY_CachePut,
  METHOD_KEY_Transactional,
} from '../config.js'
import { CacheableArgs } from '../types.js'

import { DecoratorHandlerCacheable } from './cacheable.handler.js'


export const cacheableClassIgnoreIfMethodDecoratorKeys = [
  METHOD_KEY_CacheEvict,
  METHOD_KEY_CachePut,
  METHOD_KEY_Transactional,
]
export const cacheableMethodIgnoreIfMethodDecoratorKeys = [METHOD_KEY_Transactional]

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

