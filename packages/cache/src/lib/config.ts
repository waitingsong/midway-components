import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export const initConfig: Config = {
  store: 'memory',
  options: {
    max: 512,
    ttl: 10,
  },
}

export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export const CLASS_KEY_Cacheable = 'decorator:decorator_class_key_cacheable'
export const METHOD_KEY_Cacheable = 'decorator:decorator_method_key_cacheable'
export const METHOD_KEY_CacheEvict = 'decorator:decorator_method_key_cacheevict'
export const classDecoratorKeyMap = new Map([ [CLASS_KEY_Cacheable, 'Cacheable'] ])
export const methodDecoratorKeyMap = new Map([
  [METHOD_KEY_Cacheable, 'Cacheable'],
  [METHOD_KEY_CacheEvict, 'CacheEvict'],
])

