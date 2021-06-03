import { Context } from '@midwayjs/core'
import {
  Inject,
  Logger as _Logger,
  Provide,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'
import type { Span } from 'opentracing'

import { SpanLogInput } from './types'


/**
 * 自定义 Context Logger
 * - 封装 contextLogger & jaeger spanLog
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Provide()
export class Logger implements ILogger {
  @Inject() protected readonly ctx: Context

  @_Logger() protected readonly logger: ILogger

  debug(msg: unknown, ...args: unknown[]): void {
    this.tracerLogger({
      level: 'debug',
      msg,
      args,
    })
  }

  info(msg: unknown, ...args: unknown[]): void {
    this.tracerLogger({
      level: 'info',
      msg,
      args,
    })
  }

  warn(msg: unknown, ...args: unknown[]): void {
    this.tracerLogger({
      level: 'warn',
      msg,
      args,
    })
  }

  error(msg: unknown, ...args: unknown[]): void {
    this.tracerLogger({
      level: 'error',
      msg,
      args,
    })
  }

  tracerLogger(info: SpanLogInput | LogInfo, span?: Span): void {
    const { msg, args } = info
    const level = (info.level ? info.level : 'info') as LogInfo['level']

    if (span) {
      span.log(info)
    }
    else {
      this.ctx.tracerManager.spanLog(info)
    }

    if (args && Array.isArray(args)) {
      this.logger[level](msg, ...args)
    }
    else {
      this.logger[level](msg)
    }
  }
}

interface LogInfo {
  /**
   * debug | info | warn | error
   */
  level: keyof ILogger
  msg: unknown
  args?: unknown[]
  [key: string]: unknown
}

// interface ILogger extends IMidwayLogger {
//   info(msg: unknown, ...args: unknown[]): void
//   debug(msg: unknown, ...args: unknown[]): void
//   error(msg: unknown, ...args: unknown[]): void
//   warn(msg: unknown, ...args: unknown[]): void
// }
