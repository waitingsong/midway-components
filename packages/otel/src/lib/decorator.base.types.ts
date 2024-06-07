import { Inject } from '@midwayjs/core'
import { DecoratorHandlerBase } from '@mwcp/share'
import { SpanStatusCode } from '@opentelemetry/api'

import { OtelComponent } from './component.js'
import { DecoratorExecutorParam } from './trace.helper.js'
import { AttrNames } from './types.js'
import { isSpanEnded } from './util.js'


export class DecoratorHandlerTraceBase extends DecoratorHandlerBase {

  @Inject() protected readonly otelComponent: OtelComponent

  isEnable(options: DecoratorExecutorParam): boolean {
    const { config, traceService } = options
    /* c8 ignore next 3 */
    if (! config.enable) {
      return false
    }
    /* c8 ignore next 3 */
    else if (! traceService) {
      return false
    }
    return true
  }

  traceError(options: DecoratorExecutorParam, error: Error): void {
    const { span, traceService } = options
    if (! this.isEnable(options) || ! span || ! traceService) { return }
    // @ts-ignore - IsTraced
    else if (error[AttrNames.IsTraced] && isSpanEnded(span)) { return }

    traceService.endSpan(span, { code: SpanStatusCode.ERROR, error })
  }
}
