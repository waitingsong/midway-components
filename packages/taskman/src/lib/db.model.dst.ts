import type { DbDict } from 'kmore-types'

import {
  TbTaskArchiveDO,
  TbTaskDO,
  TbTaskPayloadDO,
  TbTaskProgressDO,
  TbTaskResultDO,
  TbTaskLogDO,
  ViTaskDO,
} from './database.do'


export interface DbModel {
  tb_task: TbTaskDO
  tb_task_payload: TbTaskPayloadDO
  tb_task_progress: TbTaskProgressDO
  tb_task_archive: TbTaskArchiveDO
  tb_task_result: TbTaskResultDO
  tb_task_log: TbTaskLogDO
  vi_task: ViTaskDO
}

// export const dbDict = genDbDict<DbModel>()
export const dbDict: DbDict<DbModel> = {
  tables: {
    tb_task: 'tb_task',
    tb_task_payload: 'tb_task_payload',
    tb_task_progress: 'tb_task_progress',
    tb_task_archive: 'tb_task_archive',
    tb_task_result: 'tb_task_result',
    tb_task_log: 'tb_task_log',
    vi_task: 'vi_task',
  },
  columns: {
    tb_task: {
      task_id: 'task_id',
      task_state: 'task_state',
      expect_start: 'expect_start',
      started_at: 'started_at',
      is_timeout: 'is_timeout',
      timeout_intv: 'timeout_intv',
      ctime: 'ctime',
      mtime: 'mtime',
    },
    tb_task_payload: {
      task_id: 'task_id',
      json: 'json',
      ctime: 'ctime',
      mtime: 'mtime',
    },
    tb_task_progress: {
      task_id: 'task_id',
      task_progress: 'task_progress',
      ctime: 'ctime',
      mtime: 'mtime',
    },
    tb_task_archive: {
      task_id: 'task_id',
      task_state: 'task_state',
      expect_start: 'expect_start',
      started_at: 'started_at',
      is_timeout: 'is_timeout',
      timeout_intv: 'timeout_intv',
      ctime: 'ctime',
      mtime: 'mtime',
    },
    tb_task_result: {
      task_id: 'task_id',
      json: 'json',
      ctime: 'ctime',
    },
    tb_task_log: {
      task_log_id: 'task_log_id',
      task_id: 'task_id',
      task_log_content: 'task_log_content',
      ctime: 'ctime',
    },
    vi_task: {
      task_id: 'task_id',
      task_state: 'task_state',
      expect_start: 'expect_start',
      started_at: 'started_at',
      is_timeout: 'is_timeout',
      timeout_intv: 'timeout_intv',
      ctime: 'ctime',
      mtime: 'mtime',
    },
  },
  scoped: {
    tb_task: {
      task_id: 'tb_task.task_id',
      task_state: 'tb_task.task_state',
      expect_start: 'tb_task.expect_start',
      started_at: 'tb_task.started_at',
      is_timeout: 'tb_task.is_timeout',
      timeout_intv: 'tb_task.timeout_intv',
      ctime: 'tb_task.ctime',
      mtime: 'tb_task.mtime',
    },
    tb_task_payload: {
      task_id: 'tb_task_payload.task_id',
      json: 'tb_task_payload.json',
      ctime: 'tb_task_payload.ctime',
      mtime: 'tb_task_payload.mtime',
    },
    tb_task_progress: {
      task_id: 'tb_task_progress.task_id',
      task_progress: 'tb_task_progress.task_progress',
      ctime: 'tb_task_progress.ctime',
      mtime: 'tb_task_progress.mtime',
    },
    tb_task_archive: {
      task_id: 'tb_task_archive.task_id',
      task_state: 'tb_task_archive.task_state',
      expect_start: 'tb_task_archive.expect_start',
      started_at: 'tb_task_archive.started_at',
      is_timeout: 'tb_task_archive.is_timeout',
      timeout_intv: 'tb_task_archive.timeout_intv',
      ctime: 'tb_task_archive.ctime',
      mtime: 'tb_task_archive.mtime',
    },
    tb_task_result: {
      task_id: 'tb_task_result.task_id',
      json: 'tb_task_result.json',
      ctime: 'tb_task_result.ctime',
    },
    tb_task_log: {
      task_log_id: 'tb_task_log.task_log_id',
      task_id: 'tb_task_log.task_id',
      task_log_content: 'tb_task_log.task_log_content',
      ctime: 'tb_task_log.ctime',
    },
    vi_task: {
      task_id: 'vi_task.task_id',
      task_state: 'vi_task.task_state',
      expect_start: 'vi_task.expect_start',
      started_at: 'vi_task.started_at',
      is_timeout: 'vi_task.is_timeout',
      timeout_intv: 'vi_task.timeout_intv',
      ctime: 'vi_task.ctime',
      mtime: 'vi_task.mtime',
    },
  },
  alias: {
    tb_task: {
      task_id: {
        tbTaskTaskId: 'tb_task.task_id',
      },
      task_state: {
        tbTaskTaskState: 'tb_task.task_state',
      },
      expect_start: {
        tbTaskExpectStart: 'tb_task.expect_start',
      },
      started_at: {
        tbTaskStartedAt: 'tb_task.started_at',
      },
      is_timeout: {
        tbTaskIsTimeout: 'tb_task.is_timeout',
      },
      timeout_intv: {
        tbTaskTimeoutIntv: 'tb_task.timeout_intv',
      },
      ctime: {
        tbTaskCtime: 'tb_task.ctime',
      },
      mtime: {
        tbTaskMtime: 'tb_task.mtime',
      },
    },
    tb_task_payload: {
      task_id: {
        tbTaskPayloadTaskId: 'tb_task_payload.task_id',
      },
      json: {
        tbTaskPayloadJson: 'tb_task_payload.json',
      },
      ctime: {
        tbTaskPayloadCtime: 'tb_task_payload.ctime',
      },
      mtime: {
        tbTaskPayloadMtime: 'tb_task_payload.mtime',
      },
    },
    tb_task_progress: {
      task_id: {
        tbTaskProgressTaskId: 'tb_task_progress.task_id',
      },
      task_progress: {
        tbTaskProgressTaskProgress: 'tb_task_progress.task_progress',
      },
      ctime: {
        tbTaskProgressCtime: 'tb_task_progress.ctime',
      },
      mtime: {
        tbTaskProgressMtime: 'tb_task_progress.mtime',
      },
    },
    tb_task_archive: {
      task_id: {
        tbTaskArchiveTaskId: 'tb_task_archive.task_id',
      },
      task_state: {
        tbTaskArchiveTaskState: 'tb_task_archive.task_state',
      },
      expect_start: {
        tbTaskArchiveExpectStart: 'tb_task_archive.expect_start',
      },
      started_at: {
        tbTaskArchiveStartedAt: 'tb_task_archive.started_at',
      },
      is_timeout: {
        tbTaskArchiveIsTimeout: 'tb_task_archive.is_timeout',
      },
      timeout_intv: {
        tbTaskArchiveTimeoutIntv: 'tb_task_archive.timeout_intv',
      },
      ctime: {
        tbTaskArchiveCtime: 'tb_task_archive.ctime',
      },
      mtime: {
        tbTaskArchiveMtime: 'tb_task_archive.mtime',
      },
    },
    tb_task_result: {
      task_id: {
        tbTaskResultTaskId: 'tb_task_result.task_id',
      },
      json: {
        tbTaskResultJson: 'tb_task_result.json',
      },
      ctime: {
        tbTaskResultCtime: 'tb_task_result.ctime',
      },
    },
    tb_task_log: {
      task_log_id: {
        tbTaskLogTaskLogId: 'tb_task_log.task_log_id',
      },
      task_id: {
        tbTaskLogTaskId: 'tb_task_log.task_id',
      },
      task_log_content: {
        tbTaskLogTaskLogContent: 'tb_task_log.task_log_content',
      },
      ctime: {
        tbTaskLogCtime: 'tb_task_log.ctime',
      },
    },
    vi_task: {
      task_id: {
        viTaskTaskId: 'vi_task.task_id',
      },
      task_state: {
        viTaskTaskState: 'vi_task.task_state',
      },
      expect_start: {
        viTaskExpectStart: 'vi_task.expect_start',
      },
      started_at: {
        viTaskStartedAt: 'vi_task.started_at',
      },
      is_timeout: {
        viTaskIsTimeout: 'vi_task.is_timeout',
      },
      timeout_intv: {
        viTaskTimeoutIntv: 'vi_task.timeout_intv',
      },
      ctime: {
        viTaskCtime: 'vi_task.ctime',
      },
      mtime: {
        viTaskMtime: 'vi_task.mtime',
      },
    },
  },
  camelAlias: {
    tb_task: {
      task_id: {
        taskId: 'tb_task.task_id',
      },
      task_state: {
        taskState: 'tb_task.task_state',
      },
      expect_start: {
        expectStart: 'tb_task.expect_start',
      },
      started_at: {
        startedAt: 'tb_task.started_at',
      },
      is_timeout: {
        isTimeout: 'tb_task.is_timeout',
      },
      timeout_intv: {
        timeoutIntv: 'tb_task.timeout_intv',
      },
      ctime: {
        ctime: 'tb_task.ctime',
      },
      mtime: {
        mtime: 'tb_task.mtime',
      },
    },
    tb_task_payload: {
      task_id: {
        taskId: 'tb_task_payload.task_id',
      },
      json: {
        json: 'tb_task_payload.json',
      },
      ctime: {
        ctime: 'tb_task_payload.ctime',
      },
      mtime: {
        mtime: 'tb_task_payload.mtime',
      },
    },
    tb_task_progress: {
      task_id: {
        taskId: 'tb_task_progress.task_id',
      },
      task_progress: {
        taskProgress: 'tb_task_progress.task_progress',
      },
      ctime: {
        ctime: 'tb_task_progress.ctime',
      },
      mtime: {
        mtime: 'tb_task_progress.mtime',
      },
    },
    tb_task_archive: {
      task_id: {
        taskId: 'tb_task_archive.task_id',
      },
      task_state: {
        taskState: 'tb_task_archive.task_state',
      },
      expect_start: {
        expectStart: 'tb_task_archive.expect_start',
      },
      started_at: {
        startedAt: 'tb_task_archive.started_at',
      },
      is_timeout: {
        isTimeout: 'tb_task_archive.is_timeout',
      },
      timeout_intv: {
        timeoutIntv: 'tb_task_archive.timeout_intv',
      },
      ctime: {
        ctime: 'tb_task_archive.ctime',
      },
      mtime: {
        mtime: 'tb_task_archive.mtime',
      },
    },
    tb_task_result: {
      task_id: {
        taskId: 'tb_task_result.task_id',
      },
      json: {
        json: 'tb_task_result.json',
      },
      ctime: {
        ctime: 'tb_task_result.ctime',
      },
    },
    tb_task_log: {
      task_log_id: {
        taskLogId: 'tb_task_log.task_log_id',
      },
      task_id: {
        taskId: 'tb_task_log.task_id',
      },
      task_log_content: {
        taskLogContent: 'tb_task_log.task_log_content',
      },
      ctime: {
        ctime: 'tb_task_log.ctime',
      },
    },
    vi_task: {
      task_id: {
        taskId: 'vi_task.task_id',
      },
      task_state: {
        taskState: 'vi_task.task_state',
      },
      expect_start: {
        expectStart: 'vi_task.expect_start',
      },
      started_at: {
        startedAt: 'vi_task.started_at',
      },
      is_timeout: {
        isTimeout: 'vi_task.is_timeout',
      },
      timeout_intv: {
        timeoutIntv: 'vi_task.timeout_intv',
      },
      ctime: {
        ctime: 'vi_task.ctime',
      },
      mtime: {
        mtime: 'vi_task.mtime',
      },
    },
  },
}

