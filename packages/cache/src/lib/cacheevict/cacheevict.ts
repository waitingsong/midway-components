import { customDecoratorFactory } from '@mwcp/share'

import { METHOD_KEY_CacheEvict, METHOD_KEY_Transactional } from '../config.js'
import { CacheEvictArgs, MethodType } from '../types.js'


/**
 * 声明式缓存装饰器
 * Declarative CacheEvict Decorator
 * @returns MethodDecorator | ClassDecorator
 */
export function CacheEvict<M extends MethodType | undefined = undefined>(options?: Partial<CacheEvictArgs<M>>) {

  return customDecoratorFactory<CacheEvictArgs<M>>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_CacheEvict,
    enableClassDecorator: false,
    methodIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Transactional],
  })
}

