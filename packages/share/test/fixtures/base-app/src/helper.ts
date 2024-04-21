import { DecoratorExecutorParamBase, customDecoratorFactory } from '../../../../src/index.js'


export const METHOD_KEY_Cacheable = 'decorator:method_key_cacheable_test'
export const METHOD_KEY_Cacheable_Sync = 'decorator:method_key_cacheable_sync_test'
export const METHOD_KEY_Cacheable_Sync_with_async_bypass = 'decorator:method_key_cacheable_sync_with_async_bypass_test'
export const ttl10 = 10
export const ttl20 = 20
export const ttl40 = 40

export function Cacheable(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    enableClassDecorator: true,
  })
}
export function CacheableSyncOnly(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_Sync,
    enableClassDecorator: true,
  })
}

export function CacheableSyncWithAsyncBypass(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_Sync_with_async_bypass,
    enableClassDecorator: true,
  })
}

export interface CacheableArgs {
  cacheName: string | undefined
  ttl: number | undefined
}

export async function decoratorExecutorAsync(options: DecoratorExecutorParamBase<CacheableArgs>): Promise<unknown> {
  const resp = await options.method(...options.methodArgs)
  if (typeof resp === 'number') {
    return new Promise((done) => {
      done(resp + 1)
    })
  }
  return resp
}
export function decoratorExecutorSync(options: DecoratorExecutorParamBase<CacheableArgs>): unknown {
  const resp = options.method(...options.methodArgs)
  if (typeof resp === 'number') {
    return resp + 1
  }
  return resp
}

export function genDecoratorExecutorOptions(options: DecoratorExecutorParamBase<CacheableArgs>): DecoratorExecutorParamBase<CacheableArgs> {
  return options
}

