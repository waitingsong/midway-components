import {
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import {
  FORMAT_HTTP_HEADERS,
  Span,
  SpanContext,
  globalTracer,
} from 'opentracing'

import {
  processHTTPStatus,
  processResponseData,
  updateCtxTagsData,
  updateDetailTags,
} from '../middleware/helper'

import { SpanHeaderInit, SpanLogInput, TracerLog, TracerTag } from './types'

import { Context } from '~/interface'


@Provide()
export class TracerManager {

  @Inject() readonly ctx: Context

  readonly instanceId = Symbol(new Date().getTime().toString())

  isTraceEnabled: boolean
  isStarted: boolean

  spans: Span[]

  @Init()
  async init(): Promise<void> {
    this.isTraceEnabled = false
    this.isStarted = false
    this.spans = []
    if (! this.ctx.tracerTags) {
      this.ctx.tracerTags = {}
    }
  }

  /**
   * 开启第一个span并入栈
   */
  start(): void {
    if (this.isStarted) {
      return
    }
    this.isTraceEnabled = true
    const obj = globalTracer().extract(FORMAT_HTTP_HEADERS, this.ctx.headers) ?? void 0
    const requestSpanCtx = obj && typeof obj.toTraceId === 'function'
      ? obj
      : void 0

    const time = genISO8601String()
    this.startSpan(this.ctx.path, requestSpanCtx)
    const data = {
      [TracerTag.svcPid]: process.pid,
      [TracerTag.svcPpid]: process.ppid,
      [TracerTag.reqStartTime]: time,
    }
    updateCtxTagsData(this.ctx.tracerTags, data)
    this.spanLog({
      event: TracerLog.requestBegin,
      time,
      [TracerLog.svcCpuUsage]: process.cpuUsage(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })
    // console.log({ instId: this.instanceId })
    this.isStarted = true
  }

  async finish(): Promise<void> {
    await processHTTPStatus(this.ctx)
    processResponseData(this.ctx)
    updateDetailTags(this.ctx)

    const time = genISO8601String()

    this.spanLog({
      event: TracerLog.requestEnd,
      time,
      [TracerLog.svcCpuUsage]: process.cpuUsage(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })

    updateCtxTagsData(this.ctx.tracerTags, {
      [TracerTag.reqEndTime]: time,
    })
    this.addTags(this.ctx.tracerTags)

    this.finishSpan()
  }


  currentSpan(): Span | undefined {
    return this.spans[this.spans.length - 1]
  }

  @RunIfEnabled
  startSpan(name: string, parentSpan?: Span | SpanContext): void {
    const txt = name ?? Date.now().toString()
    const span = this.genSpan(txt, parentSpan)
    this.spans.push(span)
  }

  genSpan(name: string, parentSpan?: Span | SpanContext): Span {
    const span = globalTracer().startSpan(name, {
      childOf: parentSpan ?? this.currentSpan(),
    })
    return span
  }

  @RunIfEnabled
  finishSpan(): void {
    const currentSpan = this.currentSpan()
    if (! currentSpan) {
      return
    }
    currentSpan.finish()
    // 保留请求根 span 在栈中
    if (this.spans.length > 1) {
      this.spans.pop()
    }
  }

  @RunIfEnabled
  spanLog(keyValuePairs: SpanLogInput): void {
    this.currentSpan()?.log(keyValuePairs)
  }

  @RunIfEnabled
  addTags(tags: SpanLogInput): void {
    this.currentSpan()?.addTags(tags)
  }

  @RunIfEnabled
  setSpanTag(key: string, value: unknown): void {
    this.currentSpan()?.setTag(key, value)
  }

  headerOfCurrentSpan(currSpan?: Span): SpanHeaderInit | undefined {
    const currentSpan = currSpan ? currSpan : this.currentSpan()
    if (currentSpan) {
      const headerInit = {} as SpanHeaderInit
      globalTracer().inject(currentSpan, FORMAT_HTTP_HEADERS, headerInit)
      return headerInit
    }
  }
}

interface TraceMgrPropDescriptor extends PropertyDescriptor {
  isTraceEnabled?: boolean
}

/**
 * 类方法装饰器
 *  - 链路被启用才执行方法
 * @param _target 目标类
 * @param _propertyKey 函数名
 * @param descriptor 属性描述符
 * @returns
 */
function RunIfEnabled(
  _target: unknown,
  _propertyKey: string,
  descriptor: TraceMgrPropDescriptor,
): TraceMgrPropDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown
  descriptor.value = function(...args: unknown[]): unknown {
    if (this.isTraceEnabled === true) {
      const ret = originalMethod.apply(this, args)
      return ret
    }
  }
  return descriptor
}

