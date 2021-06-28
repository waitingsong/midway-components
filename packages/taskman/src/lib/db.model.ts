// import { DbDict } from '@mw-components/kmore'

import {
  TbTaskArchiveDO,
  TbTaskDO,
  TbTaskPayloadDO,
  TbTaskProgressDO,
  ViTaskDO,
} from './database.do'


export interface DbModel {
  tb_task: TbTaskDO
  tb_task_payload: TbTaskPayloadDO
  tb_task_progress: TbTaskProgressDO
  tb_task_archive: TbTaskArchiveDO
  vi_task: ViTaskDO
}

// export const dbDict = genDbDict<DbModel>()
export { dbDict } from './db.model.dst'

