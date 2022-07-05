import { Node_Headers } from '@mw-components/fetch'
import { HeadersKey } from '@mw-components/jaeger'
import { defaultPropDescriptor } from '@waiting/shared-core'

import { CreateTaskOptions } from './types'

import { Context } from '~/interface'


export function processJsonHeaders(
  ctx: Context,
  inputJsonHeaders: CreateTaskOptions['createTaskDTO']['json']['headers'],
  fetchHeaders: Headers,
): Record<string, string> {

  const jsonHeaders: Record<string, string> = {}

  const tmpHeaders = inputJsonHeaders
    ? new Node_Headers(inputJsonHeaders)
    : fetchHeaders
  // headers is a map, which will lost after JSON.stringify()
  tmpHeaders.forEach((value, key) => {
    Object.defineProperty(jsonHeaders, key, {
      ...defaultPropDescriptor,
      value,
    })
  })

  if (typeof ctx['reqId'] === 'string' && ctx['reqId'] && typeof jsonHeaders[HeadersKey.reqId] === 'undefined') {
    Object.defineProperty(jsonHeaders, HeadersKey.reqId, {
      ...defaultPropDescriptor,
      value: ctx['reqId'],
    })
  }
  return jsonHeaders
}
