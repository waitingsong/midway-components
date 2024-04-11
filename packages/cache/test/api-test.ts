import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',

  args: '/args',
  classCacheable: '/class_cacheable',
  keyGenerator: '/key_generator',
  methodCacheable: '/method_cacheable',
  methodCacheEvict: '/method_cacheevict',
  methodCachePut: '/method_cacheput',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',

  argsOverride: 'method_override_class',
  cacheName: 'cache_name',
  condition: 'condition',
  evictOverride: 'evict_override',
  evictCondition: 'evict_condition',
  evictResult: 'evict_result',
  evictResultEvenAndGreaterThanZero: 'evict_result_even_and_greater_than_zero',
  evictGenerics: 'evict_generics',
  param: 'param',
  query: 'query',
  simple: 'simple',
  ttl: 'ttl',
  ttlFn: 'ttl_fn',
}
