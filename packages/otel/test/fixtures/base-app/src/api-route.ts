import { ConfigKey } from '~/lib/types'

export const apiPrefix = {
  TraceDecorator: `/_${ConfigKey.namespace}_trace_decorator`,
  util: `/_${ConfigKey.namespace}_util`,
}

export const apiRoute = {
  id: 'id',
  id2: 'id2',
  decorator_arg: 'decorator_arg',
  decorator_arg2: 'decorator_arg2',
  disable_trace: 'disable_trace',
  error: 'error',
  trace_error: 'trace_error',
  log: 'log',
  warn: 'warn',
  hello: 'hello',

  propagateHeader: 'propagateHeader',
}
