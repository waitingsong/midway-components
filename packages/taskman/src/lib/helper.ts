import { Node_Headers } from '@mw-components/fetch'
import { defaultPropDescriptor } from '@waiting/shared-core'

import { CreateTaskOptions } from './types'


export const taskRunningState = {
  count: 0,
  max: 2,
}

export function increaseRunningTaskCount(): void {
  if (taskRunningState.count < 0) {
    taskRunningState.count = 0
  }
  taskRunningState.count += 1
}

export function decreaseRunningTaskCount(): void {
  if (taskRunningState.count >= taskRunningState.max) {
    taskRunningState.count -= 1
  }
}



export function processJsonHeaders(
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
  return jsonHeaders
}
