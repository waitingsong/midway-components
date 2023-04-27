import { ConfigKey } from '~/lib/types'

export const apiPrefix = {
  test: `/_${ConfigKey.namespace}_test`,
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

  propagateHeader: 'propagateHeader',
}
