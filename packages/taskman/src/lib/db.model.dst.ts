// import type { DbDict } from 'kmore-types'

import {
  TbTaskArchiveDO,
  TbTaskDO,
  TbTaskLogDO,
  TbTaskPayloadDO,
  TbTaskProgressDO,
  TbTaskResultDO,
  TbTaskTypeDO,
  ViTaskDO,
} from './types.js'


export interface DbModel {
  tb_task_type: TbTaskTypeDO
  tb_task: TbTaskDO
  tb_task_payload: TbTaskPayloadDO
  tb_task_progress: TbTaskProgressDO
  tb_task_archive: TbTaskArchiveDO
  tb_task_result: TbTaskResultDO
  tb_task_log: TbTaskLogDO
  vi_task: ViTaskDO
}

