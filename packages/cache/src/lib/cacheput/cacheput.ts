import { customDecoratorFactory } from '@mwcp/share'

import { METHOD_KEY_CachePut, METHOD_KEY_Transactional } from '../config'
import { CacheableArgs, MethodType } from '../types'


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
    methodIgnoreIfMethodDecortaorKeys: [METHOD_KEY_Transactional],
  })

}

