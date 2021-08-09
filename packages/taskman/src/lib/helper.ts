import { Node_Headers } from '@mw-components/fetch'
import { defaultPropDescriptor } from '@waiting/shared-core'

import { taskRunnerState } from './config'
import { CreateTaskOptions } from './types'


export function increaseTaskRunnerCount(): void {
  if (taskRunnerState.count < 0) {
    taskRunnerState.count = 0
  }
  taskRunnerState.count += 1
}

export function decreaseRunningTaskCount(): void {
  if (taskRunnerState.count >= taskRunnerState.max) {
    taskRunnerState.count -= 1
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
