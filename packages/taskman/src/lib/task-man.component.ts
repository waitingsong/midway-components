import {
  Config,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { FetchComponent, JsonResp, Node_Headers } from '@mw-components/fetch'
import { HeadersKey, Logger } from '@mw-components/jaeger'
import { retrieveHeadersItem } from '@waiting/shared-core'

import { Context, FetchOptions } from '../interface'

import { decreaseTaskRunnerCount, processJsonHeaders } from './helper'
import { TaskRunner, taskRunnerFactory } from './task-runner'
import { CreateTaskDTO } from './tm.dto'

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

  @Inject('fetch:fetchComponent') protected readonly fetch: FetchComponent

  @Config('taskManClientConfig') protected readonly config: TaskManClientConfig

  protected readonly taskRunnerMap = new Map<TaskDTO['taskId'], TaskRunner>()

  /** 请求 taskAgent 接口所需 headers */
  protected readonly taskReqHeadersMap = new Map<TaskDTO['taskId'], Headers>()


  async [ServerMethod.create](input: CreateTaskOptions): Promise<TaskRunner | undefined> {
    const headers = this.processPostHeaders(input)
    const spanHeader = this.ctx.tracerManager.headerOfCurrentSpan()?.[HeadersKey.traceId] as string
    headers.set(HeadersKey.traceId, spanHeader)
    const pdata: CreateTaskDTO = {
      ...input.createTaskDTO,
    }
    pdata.json.headers = processJsonHeaders(pdata.json.headers, headers)

    const opts: FetchOptions = {
      ...this.initFetchOptions(),
      headers,
      method: 'POST',
      data: pdata,
    }
    if (input.host) {
      opts.url = input.host
    }
    if (! opts.url) {
      throw new Error('host of opts.url empty')
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.create}`

    const res = await this.fetch.fetch<JsonResp<TaskDTO>>(opts)
    if (res.code) {
      return
    }
    const taskRunner = taskRunnerFactory(res.data, this)
    this.writeTaskCache(taskRunner)
    this.writeReqHeaders(taskRunner.taskInfo.taskId, headers)
    return taskRunner
  }

  /** Retrieve the task, taskId from request header */
  async [ServerMethod.retrieveTask](taskId?: string): Promise<TaskRunner | undefined> {
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

    const headers = this.retrieveHeadersFromContext()
    const taskInfo = await this.getInfo(id, headers)
    if (! taskInfo) {
      return
    }
    const taskRunner = taskRunnerFactory(taskInfo, this)
    this.writeTaskCache(taskRunner)
    this.writeReqHeaders(taskRunner.taskInfo.taskId, headers)
    return taskRunner
  }

  async [ServerMethod.getInfo](
    id: TaskDTO['taskId'],
    headers?: Headers,
  ): Promise<TaskDTO | undefined> {
    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'GET',
      data: { id },
    }
    if (headers) {
      opts.headers = headers
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
      ...this.initFetchOptions(id),
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
      ...this.initFetchOptions(id),
      method: 'POST',
      data: { id, msg },
    }

    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setCancelled}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    decreaseTaskRunnerCount()
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'POST',
      data: { id, msg },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setFailed}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    decreaseTaskRunnerCount()
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'POST',
      data: { id, msg: result },
    }
    opts.url = `${opts.url}${ServerAgent.base}/${ServerAgent.setSucceeded}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    decreaseTaskRunnerCount()
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.getProgress](
    id: TaskDTO['taskId'],
  ): Promise<TaskProgressDetailDTO | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
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
      ...this.initFetchOptions(id),
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
      ...this.initFetchOptions(id),
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

  initFetchOptions(id?: TaskDTO['taskId']): FetchOptions {
    const headers = this.retrieveHeadersFromContext()
    const reqHeaders = this.readReqHeaders(id)
    if (reqHeaders) {
      reqHeaders.forEach((value, key) => {
        headers.set(key, value)
      })
    }

    const opts: FetchOptions = {
      url: this.config.host,
      method: (this.ctx.request.method ?? 'GET') as 'GET' | 'POST',
      contentType: 'application/json; charset=utf-8',
      timeout: 60000,
      headers,
    }
    return opts
  }

  /**
   * Clean cache if id not passed
   */
  deleteTaskFromCache(id?: TaskDTO['taskId']): void {
    if (id) {
      this.taskRunnerMap.delete(id)
    }
    else {
      this.taskRunnerMap.clear()
    }
  }

  protected writeTaskCache(task: TaskRunner): void {
    this.taskRunnerMap.set(task.taskInfo.taskId, task)
  }

  protected readTaskFromCache(id: TaskDTO['taskId']): TaskRunner | undefined {
    return this.taskRunnerMap.get(id)
  }

  protected writeReqHeaders(id: TaskDTO['taskId'], headers: Headers): void {
    this.taskReqHeadersMap.set(id, headers)
  }

  protected readReqHeaders(id?: TaskDTO['taskId']): Headers | undefined {
    return id ? this.taskReqHeadersMap.get(id) : void 0
  }

  protected processPostHeaders(input: CreateTaskOptions): Headers {
    const headers = new Node_Headers(input.headers)
    if (! input.headers) {
      const arr = this.config.transferHeaders && this.config.transferHeaders.length
        ? this.config.transferHeaders
        : initTaskManClientConfig.transferHeaders

      arr.forEach((key) => {
        const val = retrieveHeadersItem(this.ctx.request.headers, key)
        if (val) {
          headers.set(key, val)
        }
      })
    }
    return headers
  }

  protected retrieveHeadersFromContext(): Headers {
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
    return headers
  }

}

