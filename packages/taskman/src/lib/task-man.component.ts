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
import { Task, taskFactory } from './task'

import {
  CreateTaskOptions,
  ServerAgent,
  ServerMethod,
  TaskDTO,
  TaskLogDTO,
  TaskManClientConfig,
  TaskProgressDTO,
  TaskProgressDetailDTO,
  TaskResultDTO,
  initTaskManClientConfig,
} from './index'


@Provide()
export class TaskManComponent {

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') readonly logger: Logger

  @Inject() protected readonly fetch: FetchComponent

  @Config('taskManClientConfig') protected readonly config: TaskManClientConfig

  async [ServerMethod.create](input: CreateTaskOptions): Promise<Task> {
    const input2 = {
      ...input,
    }
    if (! input2.headers) {
      const headers = new Node_Headers()
      const arr = this.config.transferHeaders && this.config.transferHeaders.length
        ? this.config.transferHeaders
        : initTaskManClientConfig.transferHeaders

      arr.forEach((key) => {
        const val = retrieveHeadersItem(this.ctx.request.headers, key)
        if (val) {
          headers.set(key, val)
        }
      })
      input2.headers = headers
    }

    if (! input2.createTaskDTO.json.headers) {
      const payloadHeaders = {
        ...input2.headers,
      }
      input2.createTaskDTO.json.headers = payloadHeaders
    }

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      headers: input2.headers,
      method: 'POST',
      data: input2.createTaskDTO,
    }
    if (input2.host) {
      opts.url = input2.host
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.create}`
    const taskInfo = await this.fetch.fetch<TaskDTO>(opts)

    const task = taskFactory(taskInfo, this)
    return task
  }

  /** Retrieve the task, taskId from request header */
  async [ServerMethod.retrieveTask](taskId?: string): Promise<Task | undefined> {
    let id = taskId
    if (! id) {
      // const headers = new Node_Headers(this.ctx.request.headers)
      const key = this.config.headerKeyTaskId ? this.config.headerKeyTaskId : 'x-task-id'
      const val = this.ctx.request.headers[key]
      if (typeof val !== 'string') {
        throw new TypeError('x-task-id not valid taskId string')
      }
      id = val
    }
    if (! id) {
      return
    }
    const taskInfo = await this.getInfo(id)
    if (! taskInfo) {
      return
    }
    const task = taskFactory(taskInfo, this)
    return task
  }

  async [ServerMethod.getInfo](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getInfo}`
    const taskInfo = await this.fetch.fetch<TaskDTO>(opts)
    return taskInfo
  }

  async [ServerMethod.setRunning](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setRunning}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    return ret
  }

  async [ServerMethod.setCancelled](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setCancelled}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }

  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setFailed}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }

  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id, result },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setSucceeded}`
    const ret = await this.fetch.fetch<TaskDTO | undefined>(opts)
    decreaseRunningTaskCount()
    return ret
  }

  async [ServerMethod.getProgress](
    id: TaskDTO['taskId'],
  ): Promise<TaskProgressDetailDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getProgress}`
    const ret = await this.fetch.fetch<TaskProgressDetailDTO | undefined>(opts)
    return ret
  }

  async [ServerMethod.getResult](
    id: TaskDTO['taskId'],
  ): Promise<TaskResultDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getResult}`
    const ret = await this.fetch.fetch<TaskResultDTO | undefined>(opts)
    return ret
  }

  async setProgress(
    taskId: TaskDTO['taskId'],
    taskProgress: TaskProgressDTO['taskProgress'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      data: {
        taskId,
        taskProgress,
        msg,
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
      contentType: 'application/json; charset=utf-8',
    }
    return opts
  }


}

