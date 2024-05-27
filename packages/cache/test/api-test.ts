import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',

  args: '/args',
  class_cacheable: '/class_cacheable',
  key_generator: '/key_generator',
  method_cacheable: '/method_cacheable',
  method_cacheevict: '/method_cacheevict',
  method_cacheput: '/method_cacheput',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',

  method_override_class: 'method_override_class',
  cache_name: 'cache_name',
  condition: 'condition',
  evict_override: 'evict_override',
  evict_condition: 'evict_condition',
  evict_result: 'evict_result',
  evict_result_even_and_greater_than_zero: 'evict_result_even_and_greater_than_zero',
  evict_generics: 'evict_generics',
  param: 'param',
  query: 'query',
  simple: 'simple',
  ttl: 'ttl',
  ttlFn: 'ttl_fn',
}
