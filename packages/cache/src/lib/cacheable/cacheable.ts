import { customDecoratorFactory } from '@mwcp/share'

import { CacheableArgs } from '../types'

import { classDecoratorPatcher } from './class-decorator.cacheable'
import { methodDecoratorPatcher } from './method-decorator.cacheable'


/**
 * 声明式缓存装饰器
 * Declarative Cacheable Decorator
 */
export function Cacheable(options?: Partial<CacheableArgs>): MethodDecorator & ClassDecorator {
  return customDecoratorFactory<CacheableArgs>(
    options,
    classDecoratorPatcher,
    methodDecoratorPatcher,
  )
}

