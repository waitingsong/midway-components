import { customDecoratorFactory } from '##/index.js'


export const METHOD_KEY_Cacheable = 'decorator:method_key_cacheable_test'

export function Cacheable(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory<CacheableArgs>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    enableClassDecorator: true,
  })
}

export interface CacheableArgs {
  cacheName: string | undefined
  ttl: number | undefined
}

export class Test {

  @Cacheable({
    cacheName: 'test',
    ttl: 10,
  })
  _simple() {
    return 'simple'
  }

}


export class Test2 {

  _simple() {
    return 'simple'
  }

}
