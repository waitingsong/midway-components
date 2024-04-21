import {
  Inject,
  Logger,
  Provide,
  Singleton,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import type { Attributes, Span } from '@opentelemetry/api'

import { AbstractOtelComponent } from './abstract.js'
import { OtelComponent } from './component.js'
import { TraceService } from './trace.service.js'
import { AttrNames, TraceLogType } from './types.js'


/**
 * 集成链路追踪 AppLogger
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Singleton()
export class TraceAppLogger implements ILogger {

  @Inject() protected readonly otel: OtelComponent

  @Logger() protected readonly logger: ILogger

  debug(msg: unknown, span: Span | undefined | false, ...args: unknown[]): void {
    this.log({ level: 'debug', msg, args }, span)
  }

  info(msg: unknown, span: Span | undefined | false, ...args: unknown[]): void {
    this.log({ level: 'info', msg, args }, span)
  }

  warn(msg: unknown, span: Span | undefined | false, ...args: unknown[]): void {
    this.log({ level: 'warn', msg, args }, span)
  }

  error(msg: unknown, span: Span | undefined | false, ...args: unknown[]): void {
    this.log({ level: 'error', msg, args }, span)
  }

  write(msg: unknown, span: Span | undefined | false, ...args: unknown[]): void {
    this.log({ level: 'write', msg, args }, span)
  }

  verbose(msg: unknown, span: Span | undefined | false, ...args: unknown[]): void {
    this.log({ level: 'verbose', msg, args }, span)
  }

  /**
   * 打印日志同时会在链路上报日志级别和内容
   * @param span
   *  - undefined: 使用请求rootSpan
   *  - false: 仅打印日志，不上报
   */
  log(
    input: TraceLogType,
    span?: Span | false,
    logger?: ILogger,
  ): void {

    if (span !== false) {
      traceAppLogger(input, this.otel, span)
    }
    origLogger(input, logger ?? this.logger)
  }

}


/**
 * 集成链路追踪 Context Logger
 * - 打印日志同时会在链路上报日志级别和内容
 * - 生产环境应设置合理采样率避免过多的日志随链路上报
 */
@Provide()
export class TraceLogger implements ILogger {

  @Inject() protected readonly logger: ILogger
  @Inject() protected readonly traceSvc: TraceService
  @Inject() protected readonly traceAppLogger: TraceAppLogger

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


  write(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'write',
      msg,
      args,
    })
  }

  verbose(msg: unknown, ...args: unknown[]): void {
    this.log({
      level: 'verbose',
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
    if (this.traceSvc.isStarted) {
      const currSpan = span ?? this.traceSvc.rootSpan
      this.traceAppLogger.log(input, currSpan, this.logger)
    }
    else {
      // log w/o trace
      this.traceAppLogger.log(input, false, this.logger)
    }
  }

}

function traceAppLogger(
  input: TraceLogType,
  otel: AbstractOtelComponent,
  span: Span | undefined,
): void {

  const currSpan = span ?? otel.getGlobalCurrentSpan()
  if (! currSpan) { return }

  const { msg, args } = input
  const level = input.level ?? 'info'

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
  otel.addEvent(currSpan, event)
}


function origLogger(
  input: TraceLogType,
  logger: ILogger,
): void {

  const { msg, args } = input
  const level = input.level ?? 'info'

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
