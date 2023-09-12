/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  Config,
  Inject,
  Provide,
} from '@midwayjs/core'
import type { FetchOptions } from '@mwcp/boot'
import { FetchService, JsonResp, Headers, pickUrlStrFromRequestInfo } from '@mwcp/fetch'
import { SpanKind, Trace, TraceLogger, TraceService } from '@mwcp/otel'
import type { Context } from '@mwcp/share'
import { retrieveHeadersItem } from '@waiting/shared-core'

import { TaskAgentService } from './task-agent.service.js'

import { initTaskClientConfig } from '##/lib/config.js'
import { processJsonHeaders } from '##/lib/helper.js'
import {
  ConfigKey,
  CreateTaskDTO,
  CreateTaskOptions,
  SetProgressInputData,
  ServerURL,
  ServerMethod,
  TaskDTO,
  TaskLogDTO,
  TaskClientConfig,
  TaskProgressDTO,
  TaskProgressDetailDTO,
  TaskResultDTO,
  TaskServerConfig,
} from '##/lib/types.js'


@Provide()
export class ClientService {

  @Inject() protected readonly ctx: Context

  @Inject() readonly logger: TraceLogger

  @Inject() protected readonly fetch: FetchService

  @Inject() readonly traceService: TraceService

  @Inject() readonly agentService: TaskAgentService

  @Config(ConfigKey.clientConfig) protected readonly config: TaskClientConfig
  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  runningTasks = new Set<TaskDTO['taskId']>()

  /** 请求 server 接口所需 headers */
  protected readonly taskReqHeadersMap = new Map<TaskDTO['taskId'], Headers>()


  /**
   * Create a task
   */
  @Trace({ kind: SpanKind.PRODUCER })
  async [ServerMethod.create](
    input: CreateTaskOptions,
    startAgent = true,
  ): Promise<TaskDTO | undefined> {

    const headers = this.processPostHeaders(input)
    const pdata: CreateTaskDTO = {
      taskTypeVer: 1,
      ...input.createTaskDTO,
    }
    pdata.json.headers = processJsonHeaders(this.ctx, pdata.json.headers, headers)

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
    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.create}`

    const res = await this.fetch.fetch<JsonResp<TaskDTO>>(opts)
    if (res.code) {
      return
    }
    const { data: task } = res
    // const taskRunner = taskRunnerFactory(res.data, this)
    // @FIXME
    // this.writeTaskCache(taskRunner)
    this.writeReqHeaders(task.taskId, headers)

    if (startAgent && ! this.agentService.isRunning) {
      this.agentService.start()
    }

    return task
  }

  /** Retrieve the task, taskId from request header */
  async [ServerMethod.retrieveTask](taskId?: string): Promise<TaskDTO | undefined> {
    let id = taskId
    if (! id) {
      // const headers = new Headers(this.ctx.request.headers)
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

    const headers = this.retrieveHeadersFromContext()
    const task = await this.getInfo(id, headers)
    if (! task) {
      return
    }
    // @FIXME
    // this.writeTaskCache(taskRunner)
    this.writeReqHeaders(task.taskId, headers)
    return task
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

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.getInfo}`
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

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.setRunning}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    this.runningTasks.add(id)
    return res.data
  }

  async [ServerMethod.setCancelled](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    this.runningTasks.delete(id)

    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'POST',
      data: { id, msg },
    }

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.setCancelled}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    this.runningTasks.delete(id)

    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'POST',
      data: { id, msg },
    }

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.setFailed}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }

  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    this.runningTasks.delete(id)

    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'POST',
      data: { id, result },
    }

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.setSucceeded}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO | undefined>>(opts)
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

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.getProgress}`
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

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.getResult}`
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
      msg: msg ?? '',
    }
    const opts: FetchOptions = {
      ...this.initFetchOptions(id),
      method: 'POST',
      data,
    }

    const url = pickUrlStrFromRequestInfo(opts.url)
    opts.url = `${url}${ServerURL.base}/${ServerURL.setProgress}`
    const res = await this.fetch.fetch<JsonResp<TaskDTO>>(opts)
    if (res.code) {
      return
    }
    return res.data
  }


  notifyRunning(
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setRunning(id, msg)
      .catch(() => {
        return this.setRunning(id, msg)
      })
      .catch(ex => this.logger.error(ex))
  }

  notifyCancelled(
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setCancelled(id, msg)
      .catch(() => {
        return this.setCancelled(id, msg)
      })
      .catch(ex => this.logger.error(ex))
  }

  notifyFailed(
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setFailed(id, msg)
      .catch(() => {
        return this.setFailed(id, msg)
      })
      .catch(ex => this.logger.error(ex))
  }

  notifySucceeded(
    id: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): void {

    this.setSucceeded(id, result)
      .catch(() => {
        return this.setSucceeded(id, result)
      })
      .catch(ex => this.logger.error(ex))
  }

  notifyProgress(
    id: TaskDTO['taskId'],
    progress: TaskProgressDTO['taskProgress'],
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setProgress(id, progress, msg)
      .catch(() => {
        return this.setProgress(id, progress, msg)
      })
      .catch(ex => this.logger.error(ex))
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
      // url: this.config.host,
      url: this.serverConfig.host,
      method: (this.ctx.request.method ?? 'GET') as 'GET' | 'POST',
      contentType: 'application/json; charset=utf-8',
      timeout: 60000,
      headers,
    }
    return opts
  }


  protected writeReqHeaders(id: TaskDTO['taskId'], headers: Headers): void {
    this.taskReqHeadersMap.set(id, headers)
  }

  protected readReqHeaders(id?: TaskDTO['taskId']): Headers | undefined {
    return id ? this.taskReqHeadersMap.get(id) : void 0
  }

  protected processPostHeaders(input: CreateTaskOptions): Headers {
    const headers = new Headers(input.headers)
    if (! input.headers) {
      const arr = this.config.transferHeaders?.length
        ? this.config.transferHeaders
        : initTaskClientConfig.transferHeaders

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
    const headers = new Headers()
    const arr = this.config.transferHeaders?.length
      ? this.config.transferHeaders
      : initTaskClientConfig.transferHeaders

    arr.forEach((key) => {
      const val = retrieveHeadersItem(this.ctx.request.headers, key)
      if (val) {
        headers.set(key, val)
      }
    })
    return headers
  }

}

