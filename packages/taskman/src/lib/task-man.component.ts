import {
  Config,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { FetchComponent, JsonResp, Node_Headers, Options as FetchOptions } from '@mw-components/fetch'
import { Logger } from '@mw-components/jaeger'
import { retrieveHeadersItem } from '@waiting/shared-core'

import { Context } from '../interface'

import { decreaseRunningTaskCount } from './helper'
import { Task, taskFactory } from './task'

import {
  CreateTaskOptions,
  SetProgressInputData,
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

  protected readonly taskInstMap = new Map<TaskDTO['taskId'], Task>()

  async [ServerMethod.create](input: CreateTaskOptions): Promise<Task | undefined> {
    const input2 = {
      ...input,
    }

    const headers = new Node_Headers()

    if (! input2.headers) {
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
      input2.createTaskDTO.json.headers = headers
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
    const res = await this.fetch.fetch<JsonResp<TaskDTO>>(opts)
    if (res.code) {
      return
    }
    const task = taskFactory(res.data, this)
    this.writeTaskCache(task)
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

    const cachedTask = this.readTaskFromCache(id)
    if (cachedTask) {
      return cachedTask
    }

    const taskInfo = await this.getInfo(id)
    if (! taskInfo) {
      return
    }
    const task = taskFactory(taskInfo, this)
    this.writeTaskCache(task)
    return task
  }

  async [ServerMethod.getInfo](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'GET',
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getInfo}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.setRunning](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setRunning}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.setCancelled](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setCancelled}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    decreaseRunningTaskCount()
    return res.data
  }

  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setFailed}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    decreaseRunningTaskCount()
    return res.data
  }

  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      data: { id, msg: result },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setSucceeded}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    decreaseRunningTaskCount()
    return res.data
  }

  async [ServerMethod.getProgress](
    id: TaskDTO['taskId'],
  ): Promise<TaskProgressDetailDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'GET',
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getProgress}`
    const res = await this.fetch.fetch<JsonResp<TaskProgressDetailDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.getResult](
    id: TaskDTO['taskId'],
  ): Promise<TaskResultDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'GET',
      data: { id },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.getResult}`
    const res = await this.fetch.fetch<JsonResp<TaskResultDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  async setProgress(
    id: TaskDTO['taskId'],
    progress: TaskProgressDTO['taskProgress'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const data: SetProgressInputData = {
      id,
      progress,
      msg,
    }
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      data,
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setProgress}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  get initFetchOptions(): FetchOptions {
    const opts: FetchOptions = {
      url: this.config.host,
      method: (this.ctx.request.method ?? 'GET') as 'GET' | 'POST',
      contentType: 'application/json; charset=utf-8',
    }
    return opts
  }

  /**
   * Clean cache if id not passed
   */
  deleteTaskFromCache(id?: TaskDTO['taskId']): void {
    if (id) {
      this.taskInstMap.delete(id)
    }
    else {
      this.taskInstMap.clear()
    }
  }

  protected writeTaskCache(task: Task): void {
    this.taskInstMap.set(task.taskInfo.taskId, task)
  }

  protected readTaskFromCache(id: TaskDTO['taskId']): Task | undefined {
    return this.taskInstMap.get(id)
  }

}

