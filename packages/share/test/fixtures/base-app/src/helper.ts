import { DecoratorExecutorParamBase, customDecoratorFactory } from '../../../../src/index.js'


export const METHOD_KEY_Cacheable = 'decorator:method_key_cacheable_test'
export const METHOD_KEY_Cacheable_Sync = 'decorator:method_key_cacheable_sync_test'
export const METHOD_KEY_Cacheable_Sync_with_async_bypass = 'decorator:method_key_cacheable_sync_with_async_bypass_test'

export function Cacheable(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory<CacheableArgs>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    enableClassDecorator: true,
  })
}
export function CacheableSyncOnly(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory<CacheableArgs>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_Sync,
    enableClassDecorator: true,
  })
}

export function CacheableSyncWithAsyncBypass(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory<CacheableArgs>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_Sync_with_async_bypass,
    enableClassDecorator: true,
  })
}

export interface CacheableArgs {
  cacheName: string | undefined
  ttl: number | undefined
}

export async function decoratorExecutorAsync(options: DecoratorExecutorParamBase<CacheableArgs>): Promise<number | void> {
  const [input] = options.methodArgs
  if (typeof input === 'number') {
    return new Promise((done) => {
      done(input + 1)
    })
  }

}
export function decoratorExecutorSync(options: DecoratorExecutorParamBase<CacheableArgs>): number | void {
  const [input] = options.methodArgs
  if (typeof input === 'number') {
    return input + 1
  }
}

export function genDecoratorExecutorOptions(options: DecoratorExecutorParamBase<CacheableArgs>): DecoratorExecutorParamBase<CacheableArgs> {
  return options
}
