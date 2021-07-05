import { JsonType } from '@waiting/shared-types'

import { IPostgresInterval } from '../interface'

import { CallTaskOptions, TaskState } from './types'


export class TbTaskDO {
  /** bigInt string */
  task_id: string
  task_state: TaskState
  expect_start: Date
  started_at: Date | null
  is_timeout: boolean
  /**
   * expiry interval
   * @example {
   *   hours: 12
   *   minutest: 30
   * }
   * @description convert
   * - intval to string: intv.toISOString()
   * - intval to postgres obj: intv.toPostgres()
   */
  timeout_intv: Partial<IPostgresInterval> | string
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskPayloadDO {
  /** bigInt string */
  task_id: string
  /** custom data */
  json: CallTaskOptions
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskArchiveDO extends TbTaskDO {
}


export class TbTaskProgressDO {
  /** bigInt string */
  task_id: string
  /** 0 - 100 */
  task_progress: number
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskResultDO {
  /** bigInt string */
  task_id: string
  json: JsonType
  ctime: Date | 'now()'
}

export class TbTaskLogDO {
  /** bigInt string */
  task_log_id: string
  /** bigInt string */
  task_id: string
  task_log_content: string
  ctime: Date | 'now()'
}

export class ViTaskDO extends TbTaskDO {}

