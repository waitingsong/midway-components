import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',

  TraceDecorator: `/_${ConfigKey.namespace}_trace_decorator`,
  util: `/_${ConfigKey.namespace}_util`,
  route: '/route',
  decorator_data: `/decorator_data`,
  trace_log: '/trace_log',
  trace_singleton: '/trace_singleton',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  home: 'home',
  component: 'component',

  id: 'id',
  id2: 'id2',
  decorator_arg: 'decorator_arg',
  decorator_arg2: 'decorator_arg2',
  disable_trace: 'disable_trace',
  error: 'error',
  error_no_capture: 'error_no_capture',
  trace_error: 'trace_error',
  log: 'log',
  appLog: 'app_log',
  warn: 'warn',

  propagateHeader: 'propagateHeader',
  async: 'async',
  sync: 'sync',
  mix_on_async: 'mix_on_async',
  mix_on_sync: 'mix_on_sync',

  scope: 'scope',
  trace_auto_scope: 'trace_auto_scope',
  scope_priority: 'scope_priority',
}
