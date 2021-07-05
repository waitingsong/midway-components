import { Rule } from '@midwayjs/decorator'
import { RecusiveCamelKeys } from '@waiting/shared-types'

import { taskManValidSchemas } from '../validation-schema/index.schema'

import {
  TbTaskDO as DO,
  TbTaskPayloadDO,
  TbTaskProgressDO,
  TbTaskResultDO,
  TbTaskLogDO,
} from './database.do'


export type TaskDTO = RecusiveCamelKeys<DO>
export type TaskProgressDTO = RecusiveCamelKeys<TbTaskProgressDO>
export type TaskPayloadDTO = RecusiveCamelKeys<TbTaskPayloadDO>
export type TaskResultDTO = RecusiveCamelKeys<TbTaskResultDO>
export type TaskLogDTO = RecusiveCamelKeys<TbTaskLogDO>
export type TaskProgressDetailDTO = TaskProgressDTO & Pick<TaskDTO, 'taskState'>

export type TaskFullDTO = TaskDTO & {
  taskProgress: TbTaskProgressDO['task_progress'] | null,
  json: TaskPayloadDTO['json'] | null,
}

export type InitTaskDTO = Omit<TaskDTO, 'taskId'>
export type InitTaskPayloadDTO = Omit<TaskPayloadDTO, 'taskId' | 'json'>
export type InitTaskLogDTO = Omit<TaskLogDTO, 'taskLogId'>

export class CreateTaskDTO {
  /**
   * Task execution information
   */
  @Rule(taskManValidSchemas.json.required())
  json: TaskPayloadDTO['json']

  /**
   * @default now
   */
  @Rule(taskManValidSchemas.date)
  expectStart?: TaskDTO['expectStart']

  /**
   * Expiry interval
   *
   * @default 30min
   * @example {
   *   hours: 12
   *   minutest: 30
   * }
   * @description convert
   * - intval to string: intv.toISOString()
   * - intval to postgres obj: intv.toPostgres()
   */
  @Rule(taskManValidSchemas.timeoutIntv)
  timeoutIntv?: TaskDTO['timeoutIntv']
}


export class SetProgressDTO {
  taskId: TaskDTO['taskId']
  taskProgress: TaskProgressDTO['taskProgress']
}

