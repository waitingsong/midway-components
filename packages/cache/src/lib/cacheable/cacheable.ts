import { customDecoratorFactory } from '@mwcp/share'

import {
  METHOD_KEY_Cacheable,
  METHOD_KEY_CacheEvict,
  METHOD_KEY_CachePut,
  METHOD_KEY_Transactional,
} from '../config.js'
import { CacheableArgs, MethodType } from '../types.js'


export const cacheableClassIgnoreIfMethodDecoratorKeys = [
  METHOD_KEY_CacheEvict,
  METHOD_KEY_CachePut,
  METHOD_KEY_Transactional,
]
export const cacheableMethodIgnoreIfMethodDecoratorKeys = [METHOD_KEY_Transactional]

/**
 * 声明式缓存装饰器
 * Declarative Cacheable Decorator
 * @returns MethodDecorator | ClassDecorator
 */
export function Cacheable<M extends MethodType | void>(
  options?: Partial<CacheableArgs<M>>,
) {

  return customDecoratorFactory<CacheableArgs<M>>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    enableClassDecorator: true,
    classIgnoreIfMethodDecoratorKeys: cacheableClassIgnoreIfMethodDecoratorKeys,
    methodIgnoreIfMethodDecoratorKeys: cacheableMethodIgnoreIfMethodDecoratorKeys,
  })
}

