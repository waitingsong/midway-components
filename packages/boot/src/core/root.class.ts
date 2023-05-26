/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingHttpHeaders } from 'node:http'

import { App, Config, Inject, MidwayEnvironmentService } from '@midwayjs/core'
// import { ILogger as Logger } from '@midwayjs/logger'
import { AliOssManager } from '@mwcp/ali-oss'
import {
  FetchService,
  Headers,
  HeadersInit,
  ResponseData,
} from '@mwcp/fetch'
import { JwtComponent } from '@mwcp/jwt'
import { KoidComponent } from '@mwcp/koid'
import { AttrNames, TraceLogger, TraceService } from '@mwcp/otel'
import { MyError } from '@mwcp/share'

import {
  Application,
  Context,
  FetchOptions,
  JsonResp,
  NpmPkg,
} from '../lib/index'


export class RootClass {

  @App() protected readonly app: Application

  @Inject() readonly ctx: Context

  @Inject() readonly aliOssMan: AliOssManager

  @Inject() readonly environmentService: MidwayEnvironmentService

  @Inject() readonly fetchService: FetchService

  /** TraceLogger */
  @Inject() readonly logger: TraceLogger

  @Inject() readonly koid: KoidComponent

  @Inject() readonly jwt: JwtComponent

  @Inject() readonly traceService: TraceService

  @Config() readonly pkg: NpmPkg
  @Config() readonly globalErrorCode: Record<string | number, string | number>

  /**
   * SnowFlake id Generatoror
   * @usage ```
   *  const id = this.idGenerator
   *  const strId = id.toString()
   *  const hexId = id.toString(16)
   *  const binId = id.toString(2)
   * ```
   */
  get idGenerator(): bigint {
    return this.koid.idGenerator
  }

  /* c8 ignore next */
  /**
   * Generate an RxRequestInit variable,
   * @default
   *   - contentType: 'application/json; charset=utf-8'
   *   - dataType: 'json'
   *   - timeout: 60000 (in production environment, otherwise Infinity)
   *   - headers:
   *     - svc.name
   *     - svc.ver
   */
  get initFetchOptions(): FetchOptions {
    const { pkg } = this
    const headers: HeadersInit = {
      [AttrNames.ServiceName]: pkg.name,
      [AttrNames.ServiceVersion]: pkg.version ?? '',
    }
    const isDevelopmentEnvironment = this.environmentService.isDevelopmentEnvironment()
    const timeout = isDevelopmentEnvironment ? Infinity : 60000
    const args: FetchOptions = {
      url: '',
      method: 'GET',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      timeout,
      headers,
    }
    return args
  }

  /* c8 ignore start */

  /**
   * 请求和返回类型都是 JSON 格式，
   * 返回类型为 `JsonResp` 结构
   */
  fetch<T extends ResponseData>(
    options: FetchOptions,
  ): Promise<JsonResp<T>> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options.headers),
    }
    return this.fetchService.fetch(opts) as Promise<JsonResp<T>>
  }

  /**
   * 请求和返回类型都是 JSON 格式，
   * 返回类型为 `JsonResp` 结构
   */
  getJson<T extends ResponseData>(
    url: string,
    options?: FetchOptions,
  ): Promise<JsonResp<T>> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options?.headers),
    }
    return this.fetchService.get(url, opts) as Promise<JsonResp<T>>
  }

  /**
   * 请求和返回类型都是 JSON 格式，
   * 返回类型为 `JsonResp` 结构
   */
  postJson<T extends ResponseData>(
    url: string,
    options?: FetchOptions,
  ): Promise<JsonResp<T>> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options?.headers),
    }
    return this.fetchService.post(url, opts) as Promise<JsonResp<T>>
  }


  /**
   * 请求和返回类型都是 JSON 格式，
   * 返回类型为自定义结构
   */
  fetchCustom<T>(
    options: FetchOptions,
  ): Promise<T> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options.headers),
    }
    return this.fetchService.fetch(opts) as Promise<T>
  }

  /**
   * 请求和返回类型都是 JSON 格式，
   * 返回类型为自定义结构
   */
  getCustomJson<T>(
    url: string,
    options?: FetchOptions,
  ): Promise<T> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options?.headers),
    }
    return this.fetchService.get(url, opts) as Promise<T>
  }

  /**
   * 请求和返回类型都是 JSON 格式，
   * 返回类型为自定义结构
   */
  postCustomJson<T>(
    url: string,
    options?: FetchOptions,
  ): Promise<T> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options?.headers),
    }
    return this.fetchService.post(url, opts) as Promise<T>
  }

  /* c8 ignore stop */

  /**
   * 返回类型为字符串
   */
  async getText<T extends string = string>(
    url: string,
    options?: FetchOptions,
  ): Promise<T> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
      headers: this.genFetchHeaders(options?.headers),
      dataType: 'text',
    }
    const ret = await this.fetchService.get<T>(url, opts)
    return ret as T
  }

  /**
   * 根据输入 http headers 生成 Headers,
   * @returns Headers 默认不包括以下字段
   *   - host: 当前服务器地址
   *   - connection
   *   - content-length
   */
  genFetchHeaders(
    headers?: HeadersInit | IncomingHttpHeaders | undefined,
    excludes: string[] = ['host', 'connection', 'content-length'],
  ): Headers {

    const ret = new Headers(this.initFetchOptions.headers)
    if (! headers) {
      return ret
    }

    if (headers instanceof Headers) {
      headers.forEach((val, key) => {
        if (Array.isArray(excludes) && excludes.includes(key)) { return }
        ret.set(key, val)
      })
      return ret
    }
    else if (Array.isArray(headers)) { // [string, string][]
      headers.forEach(([key, val]) => {
        if (! key) { return }
        if (Array.isArray(excludes) && excludes.includes(key)) { return }
        if (typeof val === 'undefined') { return }
        ret.set(key, val)
      })
      return ret
    }
    else if (typeof headers === 'object') { // IncomingHttpHeaders
      Object.keys(headers).forEach((key) => {
        if (Array.isArray(excludes) && excludes.includes(key)) { return }
        const data = headers[key]
        if (typeof data === 'undefined') { return }
        const value = Array.isArray(data) || typeof data === 'object' // last for ReadonlyArray
          ? data.join(',')
          : data
        ret.set(key, value)
      })
    }

    return ret
  }

  getJwtPayload<T = unknown>(): T {
    if (! this.ctx.jwtState.user) {
      this.throwError('获取 jwt payload 信息为空')
    }
    return this.ctx.jwtState.user as T
  }

  throwError(message: string, status?: number, error?: Error): never {
    throw new MyError(message, status, error)
  }

}

