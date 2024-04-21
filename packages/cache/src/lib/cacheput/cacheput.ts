import { customDecoratorFactory } from '@mwcp/share'
import type { MethodType } from '@waiting/shared-types'

import { METHOD_KEY_CachePut, METHOD_KEY_Transactional } from '../config.js'
import { CacheableArgs } from '../types.js'

import { DecoratorHandlerCachePut } from './cacheput.decorator-handler.js'


/**
 * 声明式缓存装饰器
 * Declarative CachePut Decorator
 * @description
 * - Not support class
 * - Not support sync method
 * @returns MethodDecorator | ClassDecorator
 */
export function CachePut<M extends MethodType | undefined = undefined>(options?: Partial<CacheableArgs<M>>) {

  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_CachePut,
    enableClassDecorator: false,
    methodIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Transactional],
    decoratorHandlerClass: DecoratorHandlerCachePut,
  })

}

