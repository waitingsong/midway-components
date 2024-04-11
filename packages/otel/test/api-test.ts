import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',

  TraceDecorator: `/_${ConfigKey.namespace}_trace_decorator`,
  util: `/_${ConfigKey.namespace}_util`,
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',

  id: 'id',
  id2: 'id2',
  decorator_arg: 'decorator_arg',
  decorator_arg2: 'decorator_arg2',
  disable_trace: 'disable_trace',
  error: 'error',
  trace_error: 'trace_error',
  log: 'log',
  appLog: 'app_log',
  warn: 'warn',

  propagateHeader: 'propagateHeader',
}
