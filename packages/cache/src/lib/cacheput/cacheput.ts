import { customDecoratorFactory } from '@mwcp/share'

import { CacheableArgs, MethodType } from '../types'

import { methodDecoratorPatcher } from './method.cacheput'


/**
 * 声明式缓存装饰器
 * Declarative CachePut Decorator
 */
export function CachePut<M extends MethodType | undefined = undefined>(
  options?: Partial<CacheableArgs<M>>,
): MethodDecorator & ClassDecorator {

  return customDecoratorFactory<CacheableArgs<M>, M>(
    options,
    void 0,
    methodDecoratorPatcher,
  )
}

