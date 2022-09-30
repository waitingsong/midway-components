/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'assert'

import { MidwayDecoratorService, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'
import { JoinPoint, createCustomMethodDecorator } from '@midwayjs/decorator'
import type { Context as WebContext } from '@mwcp/share'
import {
  Context,
  Span,
  SpanOptions,
  SpanStatusCode,
} from '@opentelemetry/api'

import { TraceService } from './trace.service'
import { AttrNames, Config } from './types'


export const TRACE_KEY = 'decorator:open_telemetry_trace_key'

export interface TraceDecoratorOptionsSpanOptions extends SpanOptions {
  /**
   * @default true
   */
  startActiveSpan: boolean
  traceContext: Context
}

export interface TraceDecoratorOptions {
  /** 若空则为 `{target.name}/{methodName}` */
  spanName: string | undefined
  spanOptions: Partial<TraceDecoratorOptionsSpanOptions>
}

export function Trace(
  spanName?: TraceDecoratorOptions['spanName'],
  spanOptions?: TraceDecoratorOptions['spanOptions'],
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

    const around = async (joinPoint: JoinPoint) => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
      assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

      if (! config.enable) {
        return joinPoint.proceed(...joinPoint.args)
      }

      // 装饰器所在的实例
      const instance = joinPoint.target

      const callerAttr = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        [AttrNames.CallerClass]: instance.constructor?.name as string | undefined,
        [AttrNames.CallerMethod]: joinPoint.methodName as string,
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext

      let { spanName } = options.metadata
      if (! spanName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const targetName: string = callerAttr[AttrNames.CallerClass] ?? options.target.name
        spanName = `${targetName}/${options.propertyName}`
      }

      const spanOpts = options.metadata.spanOptions
      const ctx = options.metadata.spanOptions?.traceContext

      // const func = joinPoint.proceed.bind(joinPoint.target)
      const func = joinPoint.proceed.bind(void 0)
      const { args } = joinPoint
      const traceService = await webContext.requestContext.getAsync(TraceService)
      assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

      const startActiveSpan = spanOpts?.startActiveSpan ?? true
      if (startActiveSpan) {
        // 记录开始时间
        return traceService.startActiveSpan(
          spanName,
          // (span: Span) => createActiveSpanCb({ func, args, span, traceService }),
          (span: Span) => {
            span.setAttributes(callerAttr)
            return createActiveSpanCb({ func, args, span, traceService })
          },
          spanOpts,
          ctx,
        )
      }
      else {
        const span = traceService.startSpan(spanName, spanOpts, ctx)
        span.setAttributes(callerAttr)
        return createActiveSpanCb({ func, args, span, traceService })
      }

      // const handler = {
      //   apply: async (target: (...args: unknown[]) => unknown, ctx: unknown, args: unknown[]) => {
      //     let traceService: TraceService | undefined
      //     if (enableTrace) {
      //       assert(spanName)
      //       traceService = await webContext.requestContext.getAsync(TraceService)
      //     }

      //     const span = traceService?.startActiveSpan(
      //       spanName as string,
      //       (currSpan: Span) => currSpan,
      //       spanOpts,
      //     )

      //     try {
      //       // 执行原方法
      //       const ret = await Reflect.apply(target, ctx, args)
      //       span && traceService?.endSpan(span)
      //       return ret
      //     }
      //     catch (ex) {
      //       const err = ex instanceof Error ? ex : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))
      //       span && traceService?.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
      //       throw err
      //     }
      //   },
      // }
      // // eslint-disable-next-line @typescript-eslint/unbound-method
      // const fn = new Proxy(joinPoint.proceed, handler)
      // assert(typeof fn === 'function', 'fn is not funtion')
      // return fn(...joinPoint.args)
    }

    return { around }
  })
}

interface MetaDataType {
  target: new (...args: unknown[]) => unknown
  propertyName: string
  metadata: Partial<TraceDecoratorOptions>
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
    // 执行原方法. 无论原方法是否 Promise，使用 await 强制等待一次
    const ret = await func(...args)
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
