import {
  Config,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { FetchComponent, Node_Headers, Options as FetchOptions } from '@mw-components/fetch'
import { Logger } from '@mw-components/jaeger'
import { retrieveHeadersItem } from '@waiting/shared-core'

import { Context } from '../interface'

import { decreaseRunningTaskCount } from './helper'

import {
  CreateTaskOptions,
  ServerAgent,
  ServerMethod,
  TaskDTO,
  TaskManClientConfig,
  TaskProgressDTO,
} from './index'


@Provide()
export class TaskManComponent {

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject() protected readonly fetch: FetchComponent

  @Config('taskManClientConfig') protected readonly config: TaskManClientConfig

  async [ServerMethod.create](input: CreateTaskOptions): Promise<TaskDTO> {
    const input2 = {
      ...input,
    }
    if (! input2.headers) {
      const headers = new Node_Headers()
      this.config.transferHeaders.forEach((key) => {
        const val = retrieveHeadersItem(this.ctx.request.headers, key)
        if (val) {
          headers.set(key, val)
        }
      })
      input2.headers = headers
    }

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: input2,
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.create}`
    const ret = await this.fetch.fetch<TaskDTO>(opts)
    return ret
  }

  async [ServerMethod.setRunning](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setRunning}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    return ret
  }

  async [ServerMethod.setCancelled](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setCancelled}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }

  async [ServerMethod.setFailed](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setFailed}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }

  async [ServerMethod.setSucceeded](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setSucceeded}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }

  async [ServerMethod.getProgress](id: TaskDTO['taskId']): Promise<TaskProgressDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getProgress}`
    const ret = await this.fetch.fetch<TaskProgressDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }


  async setProgress(
    taskId: TaskDTO['taskId'],
    taskProgress: TaskProgressDTO['taskProgress'],
  ): Promise<TaskDTO> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: {
        taskId,
        taskProgress,
      },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setRunning}`
    const ret = await this.fetch.fetch<TaskDTO>(opts)
    return ret
  }

  get initFetchOptions(): FetchOptions {
    const opts: FetchOptions = {
      url: this.config.host,
      method: (this.ctx.request.method ?? 'GET') as 'GET' | 'POST',
    }
    return opts
  }


}

