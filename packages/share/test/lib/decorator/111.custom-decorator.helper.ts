import { customDecoratorFactory } from '##/index.js'


export const METHOD_KEY_Cacheable = 'decorator:method_key_cacheable_test'
export const ttl = 20

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

export const cacheableArgs: CacheableArgs = {
  cacheName: 'test',
  ttl: 10,
}

export class Test {

  @Cacheable(cacheableArgs)
  async _simple(): Promise<string> {
    return 'simple'
  }

}


export class Test2 {

  _simple() {
    return 'simple'
  }

}

@Cacheable({ })
export class TestClass {

  _simple() {
    return 'simple'
  }

}


@Cacheable(cacheableArgs)
export class TestClass2 {

  @Cacheable({ ttl })
  _simple() {
    return 'simple'
  }

}