import { customDecoratorFactory } from '@mwcp/share'

import { METHOD_KEY_CacheEvict } from '../config'
import { CacheEvictArgs, MethodType } from '../types'


/**
 * 声明式缓存装饰器
 * Declarative CacheEvict Decorator
 */
export function CacheEvict<M extends MethodType | undefined = undefined>(
  options?: Partial<CacheEvictArgs<M>>,
): MethodDecorator & ClassDecorator {

  return customDecoratorFactory<CacheEvictArgs<M>>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_CacheEvict,
    enableClassDecorator: false,
  })
}

