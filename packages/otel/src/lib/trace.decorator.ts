import assert from 'node:assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import {
  MidwayDecoratorService,
  JoinPoint,
  createCustomMethodDecorator,
} from '@midwayjs/core'
import {
  Span,
  SpanStatusCode,
} from '@opentelemetry/api'

import { MetaDataType, prepareAroundFactory } from './trace.helper'
import { TraceService } from './trace.service'
import {
  Config,
  MethodType,
  TraceDecoratorArg,
} from './types'


export const TRACE_KEY = 'decorator:open_telemetry_trace_key'

export function Trace<M extends MethodType | void = void>(
  options?: TraceDecoratorArg<M>,
): MethodDecorator {

  return createCustomMethodDecorator(TRACE_KEY, options)
}

export function registerMethodHandler(
  decoratorService: MidwayDecoratorService,
  config: Config,
): void {

  decoratorService.registerMethodHandler(TRACE_KEY, (options: MetaDataType) => {
    return config.enable
      ? {
        around: (joinPoint: JoinPoint) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (isAsyncFunction(joinPoint.target[joinPoint.methodName])) {
            const ret = aroundFactory(joinPoint, options)
            return ret
          }
          else {
            const ret = aroundFactorySync(joinPoint, options)
            return ret
          }
        },
      }
      : {}
  })
}


async function aroundFactory(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
): Promise<unknown> {

  const {
    func,
    funcArgs,
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
  } = prepareAroundFactory(joinPoint, metaDataOptions)

  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      async (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = { func, funcArgs, span, traceService }
        const ret = await createActiveSpanCb(opts)
        return ret
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    const opts = { func, funcArgs, span, traceService }
    const ret = await createActiveSpanCb(opts)
    return ret
  }
}

function aroundFactorySync(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
): unknown {

  const {
    func,
    funcArgs,
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
  } = prepareAroundFactory(joinPoint, metaDataOptions)

  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = { func, funcArgs, span, traceService }
        return createActiveSpanCbSync(opts)
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    const opts = { func, funcArgs, span, traceService }
    return createActiveSpanCbSync(opts)
  }
}



interface CreateActiveSpanCbOptions {
  func: (...args: unknown[]) => unknown
  funcArgs: unknown[]
  span: Span
  traceService: TraceService
}
async function createActiveSpanCb(options: CreateActiveSpanCbOptions): Promise<unknown> {
  const { func, funcArgs, span, traceService } = options

  try {
    const resp = func(...funcArgs)
    assert(isPromise(resp), 'func return value is not a promise')
    const ret = await resp
    traceService.endSpan(span)
    return ret
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))
    traceService.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
    throw new Error(err.message, { cause: err.cause ?? err })
  }
}

function createActiveSpanCbSync(options: CreateActiveSpanCbOptions): unknown {
  const { func, funcArgs, span, traceService } = options

  try {
    const resp = func(...funcArgs)
    assert(! isPromise(resp), 'func return value is a promise')
    traceService.endSpan(span)
    return resp
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))
    traceService.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
    throw new Error(err.message, { cause: err.cause ?? err })
  }
}

