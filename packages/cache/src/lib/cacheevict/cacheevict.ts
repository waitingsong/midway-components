import { customDecoratorFactory } from '@mwcp/share'

import { CacheEvictArgs } from '../types'

import { methodDecoratorPatcher } from './method-decorator.cacheevict'


/**
 * 声明式缓存装饰器
 * Declarative Cacheable Decorator
 */
export function CacheEvict(options?: Partial<CacheEvictArgs>): MethodDecorator & ClassDecorator {
  return customDecoratorFactory<CacheEvictArgs>(
    options,
    void 0, // not support class decorator
    methodDecoratorPatcher,
  )
}

