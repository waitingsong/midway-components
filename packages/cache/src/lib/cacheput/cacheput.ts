import { customDecoratorFactory } from '@mwcp/share'

import { METHOD_KEY_CachePut, METHOD_KEY_Transactional } from '../config.js'
import { CacheableArgs, MethodType } from '../types.js'


/**
 * 声明式缓存装饰器
 * Declarative CachePut Decorator
 * @returns MethodDecorator | ClassDecorator
 */
export function CachePut<M extends MethodType | undefined = undefined>(
  options?: Partial<CacheableArgs<M>>,
) {

  return customDecoratorFactory<CacheableArgs<M>>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_CachePut,
    enableClassDecorator: false,
    methodIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Transactional],
  })

}

