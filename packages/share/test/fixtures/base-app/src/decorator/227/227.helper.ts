import { DecoratorHandler } from '../../decorator-handler.js'
import { customDecoratorFactory } from '../../types/index.js'


export const METHOD_KEY_Cacheable2 = 'decorator:method_key_cacheable2_test'
export const METHOD_KEY_ClassIgnoreIfMethodDecoratorKeys = 'decorator:classIgnoreIfMethodDecoratorKeys'

export function CacheableClassIgnoreIfMethodDecoratorKeys() {
  return customDecoratorFactory({
    decoratorArgs: void 0,
    decoratorKey: METHOD_KEY_ClassIgnoreIfMethodDecoratorKeys,
    classIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Cacheable2],
    decoratorHandlerClass: DecoratorHandler,
  })
}

