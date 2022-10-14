import {
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'
import type { Attributes, Span } from '@opentelemetry/api'

import { TraceService } from './trace.service'
import { AttrNames, TraceLogType } from './types'


/**
 * 集成链路追踪 Logger
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Provide()
export class TraceLogger implements ILogger {

  @Inject() protected readonly traceSvc: TraceService

  @Inject() protected readonly logger: ILogger

  debug(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'debug',
      msg,
      args,
    })
  }

  info(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'info',
      msg,
      args,
    })
  }

  warn(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'warn',
      msg,
      args,
    })
  }

  error(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'error',
      msg,
      args,
    })
  }

  /**
   * 打印日志同时会在链路上报日志级别和内容
   * @param span
   *  - undefined: 使用请求rootSpan
   *  - false: 仅打印日志，不上报
   */
  log(input: TraceLogType, span?: Span | false): void {
    const currSpan = typeof span === 'undefined'
      ? this.traceSvc.rootSpan
      : span
    traceLogger(this.traceSvc, this.logger, input, currSpan)
  }
}

function traceLogger(
  traceSvc: TraceService,
  logger: ILogger,
  input: TraceLogType,
  span?: Span | false,
): void {

  const { msg, args } = input
  const level = input.level ?? 'info'

  if (span) {
    const name = input['event'] && typeof input['event'] === 'string'
      ? input['event']
      : 'trace.log'
    const event: Attributes = {
      event: name,
      [AttrNames.LogLevel]: level,
    }
    if (typeof msg !== 'undefined') {
      event[AttrNames.Message] = typeof msg === 'string' ? msg : JSON.stringify(msg)
    }
    if (typeof args !== 'undefined') {
      event['log.detail'] = JSON.stringify(args)
    }
    traceSvc.addEvent(span, event)
  }

  if (typeof msg === 'undefined') {
    logger[level](input)
  }
  else if (Array.isArray(args)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    logger[level](msg, ...args)
  }
  else {
    logger[level](msg)
  }
}


// interface ILogger extends IMidwayLogger {
//   info(msg: unknown, ...args: unknown[]): void
//   debug(msg: unknown, ...args: unknown[]): void
//   error(msg: unknown, ...args: unknown[]): void
//   warn(msg: unknown, ...args: unknown[]): void
// }
