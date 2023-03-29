/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import {
  MidwayDecoratorService,
  REQUEST_OBJ_CTX_KEY,
  JoinPoint,
  createCustomMethodDecorator,
} from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'
import {
  Attributes,
  Context,
  Span,
  SpanOptions,
  SpanStatusCode,
} from '@opentelemetry/api'

import { TraceService } from './trace.service'
import { AttrNames, Config, ConfigKey } from './types'


export const TRACE_KEY = 'decorator:open_telemetry_trace_key'

export interface TraceDecoratorOptionsSpanOptions extends SpanOptions {
  /**
   * @default true
   */
  startActiveSpan: boolean
  traceContext: Context
}

export interface DecoratorArgs {
  /** 若空则为 `{target.name}/{methodName}` */
  spanName: string | undefined
  spanOptions: Partial<TraceDecoratorOptionsSpanOptions>
}

export function Trace(
  spanName?: DecoratorArgs['spanName'],
  spanOptions?: DecoratorArgs['spanOptions'],
): MethodDecorator {

  return createCustomMethodDecorator(TRACE_KEY, {
    spanName,
    spanOptions,
  })
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

  const ps = prepareAroundFactory(joinPoint, metaDataOptions)
  const {
    func,
    args,
    callerAttr,
    spanName,
    spanOptions,
    traceService,
  } = ps

  const startActiveSpan = spanOptions?.startActiveSpan ?? true
  const traceContext = spanOptions?.traceContext
  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      async (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = { func, args, span, traceService }
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
    const opts = { func, args, span, traceService }
    const ret = await createActiveSpanCb(opts)
    return ret
  }
}

function aroundFactorySync(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
): unknown {

  const ps = prepareAroundFactory(joinPoint, metaDataOptions)
  const {
    func,
    args,
    callerAttr,
    spanName,
    spanOptions,
    traceService,
  } = ps

  const startActiveSpan = spanOptions?.startActiveSpan ?? true
  const traceContext = spanOptions?.traceContext
  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = { func, args, span, traceService }
        return createActiveSpanCbSync(opts)
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    const opts = { func, args, span, traceService }
    return createActiveSpanCbSync(opts)

  }
}


interface PrepareAroundFactoryReturn {
  func: (...args: unknown[]) => unknown
  args: unknown[]
  callerAttr: Attributes
  spanName: string
  spanOptions: Partial<TraceDecoratorOptionsSpanOptions > | undefined
  target: unknown
  traceService: TraceService
}

function prepareAroundFactory(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
): PrepareAroundFactoryReturn {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  const instance = joinPoint.target

  const callerAttr: Attributes = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [AttrNames.CallerClass]: instance.constructor?.name as string | undefined,
    [AttrNames.CallerMethod]: joinPoint.methodName as string,
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext

  let { spanName } = metaDataOptions.metadata
  if (! spanName) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const targetName = callerAttr[AttrNames.CallerClass] ?? metaDataOptions.target.name
    spanName = `${targetName.toString()}/${metaDataOptions.propertyName}`
  }

  const spanOpts = metaDataOptions.metadata.spanOptions ?? {}
  if (! spanOpts.traceContext) {
    const traceContext = metaDataOptions.metadata.spanOptions?.traceContext
    if (traceContext) {
      spanOpts.traceContext = traceContext
    }
  }

  // const func = joinPoint.proceed.bind(joinPoint.target)
  const func = joinPoint.proceed.bind(void 0)
  const { args, target } = joinPoint

  // const traceService = (webContext[`_${ConfigKey.serviceName}`]
  //   ?? await webContext.requestContext.getAsync(TraceService)) as TraceService
  const traceService = webContext[`_${ConfigKey.serviceName}`] as TraceService
  assert(traceService, `traceService undefined on webContext[_${ConfigKey.serviceName}]`)
  assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

  const opts: PrepareAroundFactoryReturn = {
    func,
    callerAttr,
    args,
    spanName,
    spanOptions: spanOpts,
    target,
    traceService,
  }
  return opts
}


interface MetaDataType {
  target: new (...args: unknown[]) => unknown
  propertyName: string
  metadata: Partial<DecoratorArgs>
}

interface CreateActiveSpanCbOptions {
  func: (...args: unknown[]) => unknown
  args: unknown[]
  span: Span
  traceService: TraceService
}
async function createActiveSpanCb(options: CreateActiveSpanCbOptions): Promise<unknown> {
  const { func, args, span, traceService } = options

  try {
    const resp = func(...args)
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
  const { func, args, span, traceService } = options

  try {
    const resp = func(...args)
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
