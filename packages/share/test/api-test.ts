import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',
  methodCacheable: '/method_cacheable',
  methodCacheable2: '/method_cacheable2',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',
  simple: 'simple',
  simpleSyncOnly: 'simple_sync_only',
  simpleAsyncOnly: 'simple_async_only',
  simpleNumber: 'simple_number',
  simpleRequest: 'simple_request',
  simpleRequestExtends: 'simple_request_extends',
  simpleMix: 'simple_mix',
  simpleClassOnly: 'simple_class_only',
  simpleClassOnly2: 'simple_class_only2',
  classIgnoreIfMethodDecoratorKeys: 'class_ignore_if_method_decorator_keys',
  classIgnoreIfMethodDecoratorKeys2: 'class_ignore_if_method_decorator_keys2',
  methodIgnoreIfMethodDecoratorKeys: 'method_ignore_if_method_decorator_keys',
  methodIgnoreIfMethodDecoratorKeys2: 'method_ignore_if_method_decorator_keys2',
  multi: 'multi',
  passthrough: 'pass_through',
}
