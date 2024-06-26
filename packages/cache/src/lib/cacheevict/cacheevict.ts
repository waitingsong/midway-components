import { customDecoratorFactory } from '@mwcp/share'
import type { MethodType } from '@waiting/shared-types'

import { METHOD_KEY_CacheEvict } from '../config.js'
import type { CacheEvictArgs } from '../types.js'

import { DecoratorHandlerCacheEvict } from './cacheevict.handler.js'


/**
 * 声明式缓存装饰器
 * Declarative CacheEvict Decorator
 * @description
 * - Not support class
 * - Not support sync method
 * @returns MethodDecorator | ClassDecorator
 */
export function CacheEvict<M extends MethodType | undefined = undefined>(options?: Partial<CacheEvictArgs<M>>) {

  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_CacheEvict,
    enableClassDecorator: false,
    methodIgnoreIfMethodDecoratorKeys: [],
    decoratorHandlerClass: DecoratorHandlerCacheEvict,
  })
}

