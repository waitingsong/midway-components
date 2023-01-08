/* eslint-disable @typescript-eslint/no-explicit-any */
import { customDecoratorFactory } from '@mwcp/share'

import { METHOD_KEY_Cacheable, METHOD_KEY_CacheEvict, METHOD_KEY_CachePut } from '../config'
import { CacheableArgs, MethodType } from '../types'


/**
 * 声明式缓存装饰器
 * Declarative Cacheable Decorator
 */
export function Cacheable<M extends MethodType | undefined = undefined>(
  options?: Partial<CacheableArgs<M>>,
): MethodDecorator & ClassDecorator {

  return customDecoratorFactory<CacheableArgs<M>>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    enableClassDecorator: true,
    classIgnoreIfMethodDecortaorKeys: [
      METHOD_KEY_CacheEvict,
      METHOD_KEY_CachePut,
    ],
  })
}

