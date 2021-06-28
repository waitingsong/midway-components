import { IPostgresInterval } from '../interface'

import { CallTaskOptions, TaskState } from './types'


export class TbTaskDO {
  /** bigInt string */
  task_id: string
  task_state: TaskState
  will_start: Date
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


export class ViTaskDO extends TbTaskDO {}

