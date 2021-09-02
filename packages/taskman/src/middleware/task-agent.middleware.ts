/* eslint-disable import/no-extraneous-dependencies */
import { Provide } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { SpanLogInput } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'


import { taskRunnerState } from '../lib/config'
import { decreaseTaskRunnerCount, increaseTaskRunnerCount } from '../lib/helper'
import { TaskAgentConfig } from '../lib/index'
import { TaskAgentService } from '../service/task-agent.service'

import { taskAgentSubscriptionMap } from '~/lib/data'


@Provide()
export class TaskAgentMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return taskAgentMiddleware
  }
}

/**
 * 确保当前进程运行不超过指定数量的任务，
 * 超过数量则返回 429 HTTP 状态码
 */
export async function taskAgentMiddleware(
  ctx: IMidwayWebContext,
  next: IMidwayWebNext,
): Promise<unknown> {

  let isTaskRunning = false

  const { headers } = ctx.request
  const taskId = headers['x-task-id']

  /* istanbul ignore else */
  if (headers['x-task-agent']) { // task distribution
    const taskAgentConfig = ctx.app.getConfig('taskAgentConfig ') as TaskAgentConfig
    const trm = ctx.tracerManager
    const inputLog: SpanLogInput = {
      event: 'TaskMan-entry',
      agentConcurrentConfig: taskAgentConfig,
      taskId,
      pid: process.pid,
      time: genISO8601String(),
      runnerCount: taskRunnerState.count,
      runnerMax: taskRunnerState.max,
    }
    trm && trm.spanLog(inputLog)

    if (taskRunnerState.count >= taskRunnerState.max) {
      ctx.status = 429
      const { reqId } = ctx
      ctx.body = {
        code: 429,
        reqId: reqId && typeof reqId === 'string' ? reqId : '',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        msg: `Task running limit: ${taskRunnerState.max}, now: ${taskRunnerState.count}, taskId: ${taskId}`,
      }
      inputLog.message = ctx.body
      trm && trm.spanLog(inputLog)
      return
    }
    isTaskRunning = true
    increaseTaskRunnerCount() // decreaseRunningTaskCount() 在 TaskManComponent 中任务完成后调用
  }

  /* istanbul ignore else */
  if (ctx.path === '/ping') {
    const taskAgentConfig = ctx.app.getConfig('taskAgentConfig ') as TaskAgentConfig

    if (taskAgentConfig.enableStartOneByPing && taskAgentSubscriptionMap.size < taskAgentConfig.maxRunning) {
      const trm = ctx.tracerManager
      const inputLog: SpanLogInput = {
        event: 'TaskAgent-run',
        agentConcurrentConfig: taskAgentConfig,
        taskId,
        pid: process.pid,
        time: genISO8601String(),
      }
      // const span = tm ? tm.genSpan('TaskAgent') : void 0
      // span && span.log(inputLog)
      trm && trm.spanLog(inputLog)

      const taskAgent = await ctx.requestContext.getAsync(TaskAgentService)
      await taskAgent.run()
    }
  }


  try {
    await next()
  }
  catch (ex) {
    if (isTaskRunning) {
      decreaseTaskRunnerCount()
      isTaskRunning = false
    }
    throw ex
  }
}


