import { Inject, Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, DecoratorHandlerBase, genError } from '@mwcp/share'
import { SpanStatusCode } from '@opentelemetry/api'

import { OtelComponent } from '../component.js'
import { genDecoratorExecutorOptions } from '../trace.helper.js'
import type { DecoratorExecutorParam, GenDecoratorExecutorOptions, TraceDecoratorOptions } from '../trace.service.js'
import { TraceService } from '../trace.service.js'
import { AttrNames, Config, ConfigKey } from '../types.js'
import { isSpanEnded } from '../util.js'

import { before, afterReturn } from './trace-init.helper.async.js'


@Singleton()
export class DecoratorHandlerTraceInit extends DecoratorHandlerBase {
  @MConfig(ConfigKey.config) protected readonly config: Config

  @Inject() protected readonly otelComponent: OtelComponent
  @Inject() protected readonly traceService: TraceService

  isEnable(options: DecoratorExecutorParam): boolean {
    /* c8 ignore next 3 */
    if (! options.config.enable) {
      return false
    }
    const traceCtx = this.otelComponent.appInitProcessContext
    /* c8 ignore next 3 */
    if (! this.otelComponent.appInitProcessSpan || ! traceCtx) {
      return false
    }
    return true
  }

  override genExecutorParam(options: DecoratorExecutorParamBase<TraceDecoratorOptions>) {
    const optsExt: GenDecoratorExecutorOptions = {
      config: this.config,
      traceService: this.traceService,
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async before(options: DecoratorExecutorParam) {
    /* c8 ignore next */
    if (! this.isEnable(options)) { return }
    return before(options)
  }

  /**
   * Span will be ended if `autoEndSpan` is true when afterReturn() or afterThrow()
   */
  override async afterReturn(options: DecoratorExecutorParam): Promise<unknown> {
    /* c8 ignore next 3 */
    if (! this.isEnable(options)) {
      return options.methodResult
    }
    return afterReturn(options)
  }

  /* c8 ignore start */
  /* tested via test/../configuration.ts#onConfigLoad() manually */
  override afterThrow(options: DecoratorExecutorParam): void {
    const error = genError({
      error: options.error,
      throwMessageIfInputUndefined: `[@mwcp/${ConfigKey.namespace}] TraceInit() afterThrow error is undefined`,
      altMessage: `[@mwcp/${ConfigKey.namespace}] TraceInit() decorator afterThrow error`,
    })
    this.traceError(options, error)
    throw error
  }

  // #region private methods

  private traceError(options: DecoratorExecutorParam, error: Error): void {
    const { span } = options
    if (! this.isEnable(options) || ! span) { return }
    // @ts-ignore - IsTraced
    else if (error[AttrNames.IsTraced] && isSpanEnded(span)) { return }

    this.otelComponent.endSpan(this.otelComponent.appInitProcessSpan, span, { code: SpanStatusCode.ERROR, error })
  }
  /* c8 ignore stop */
}

