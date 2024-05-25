import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',
  methodCacheable: '/method_cacheable',
  methodCacheable2: '/method_cacheable2',
  method: '/method',
  router: '/router',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',
  simple: 'simple',
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
  helloId: 'hello/:id',
  handler: 'handler',
  after_throw: 'after_throw',
  after_throw_re_throw: 'after_throw_re_throw',
}
