import { customDecoratorFactory } from '@mwcp/share'

import { CacheEvictArgs, MethodType } from '../types'

import { methodDecoratorPatcher } from './method-decorator.cacheevict'


/**
 * 声明式缓存装饰器
 * Declarative CacheEvict Decorator
 */
export function CacheEvict<M extends MethodType | undefined = undefined>(
  options?: Partial<CacheEvictArgs<M>>,
): MethodDecorator & ClassDecorator {

  return customDecoratorFactory<CacheEvictArgs<M>, M>(
    options,
    void 0, // not support class decorator
    methodDecoratorPatcher,
  )
}

