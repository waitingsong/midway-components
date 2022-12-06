import { customDecoratorFactory } from '@mwcp/share'

import { CacheableArgs, MethodType } from '../types'

import { classDecoratorPatcher } from './class.cacheable'
import { methodDecoratorPatcher } from './method.cacheable'


/**
 * 声明式缓存装饰器
 * Declarative Cacheable Decorator
 */
export function Cacheable<M extends MethodType | undefined = undefined>(
  options?: Partial<CacheableArgs<M>>,
): MethodDecorator & ClassDecorator {

  return customDecoratorFactory<CacheableArgs<M>, M>(
    options,
    classDecoratorPatcher,
    methodDecoratorPatcher,
  )
}

