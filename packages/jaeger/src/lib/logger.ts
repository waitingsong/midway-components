import { Context } from '@midwayjs/core'
import {
  Inject,
  Logger as _Logger,
  Provide,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'
import { genISO8601String } from '@waiting/shared-core'
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

  tracerLogger(options: LogOptions): void {
    const { tracerManager } = this.ctx
    const { span, level, msg, args } = options

    if (span) {
      const input: SpanLogInput = {
        level,
        time: genISO8601String(),
      }
      if (typeof msg !== 'undefined') {
        input.msg = msg
      }
      if (typeof args !== 'undefined') {
        input.args = args
      }
      span.log(input)
    }
    else {
      tracerManager.spanLog({
        [level]: [msg, ...args],
        time: genISO8601String(),
      })
    }

    this.logger[level](msg, ...args)
  }
}

interface LogOptions {
  level: keyof ILogger
  msg: unknown
  args?: unknown[]
  span?: Span
}

// interface ILogger extends IMidwayLogger {
//   info(msg: unknown, ...args: unknown[]): void
//   debug(msg: unknown, ...args: unknown[]): void
//   error(msg: unknown, ...args: unknown[]): void
//   warn(msg: unknown, ...args: unknown[]): void
// }
