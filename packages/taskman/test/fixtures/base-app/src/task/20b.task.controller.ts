import assert from 'node:assert'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { FetchService } from '@mwcp/fetch'
// import { Trace } from '@mwcp/otel'

import {
  ConfigKey,
  ServerURL,
  SetSucceededInputData,
  TaskServerConfig,
} from '~/lib/types'
import { apiPrefix, apiRoute } from '../api-route'
import { Context } from '@mwcp/share'
import { TaskAgentService } from '~/index'


@Controller(apiPrefix.task)
export class TaskTestController {

  @_Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  @Inject() protected readonly fetch: FetchService
  @Inject() protected readonly agentService: TaskAgentService

  // @Trace()
  @Get(`/${apiRoute.task1}`)
  async task1(ctx: Context): Promise<'OK'> {
    const { headers } = ctx.request
    const taskId = headers[this.serverConfig.headerKeyTaskId]
    assert(taskId, 'taskId is required')
    assert(typeof taskId === 'string', 'taskId must be string')

    await this.agentService.stop()

    const url = `http://${ctx.host}${ServerURL.base}/${ServerURL.setSucceeded}`
    const pdata: SetSucceededInputData = {
      id: taskId,
      result: {
        data: 'OK',
      }
    }
    console.log({ url })
    const data = await this.fetch.fetch({
      method: 'POST',
      url,
      contentType: 'application/json',
      // dataType: 'json',
      data: pdata,
    })
    assert(data)
    return 'OK'
  }

}

