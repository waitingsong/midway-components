import { Inject } from '@midwayjs/core'
import { DecoratorHandlerBase } from '@mwcp/share'
import { SpanStatusCode } from '@opentelemetry/api'

import { OtelComponent } from './component.js'
import { DecoratorExecutorParam } from './trace.helper.js'
import { AttrNames } from './types.js'


export class DecoratorHandlerTraceBase extends DecoratorHandlerBase {

  @Inject() protected readonly otelComponent: OtelComponent

  isEnable(options: DecoratorExecutorParam): boolean {
    const { config, traceService } = options
    if (! config.enable) {
      return false
    }
    else if (! traceService) {
      return false
    }
    return true
  }

  traceError(options: DecoratorExecutorParam, error: Error): void {
    const { span, traceService } = options
    if (! this.isEnable(options) || ! span || ! traceService) { return }
    // @ts-ignore - IsTraced
    else if (error[AttrNames.IsTraced]) { return }

    traceService.endSpan(span, { code: SpanStatusCode.ERROR, error })
  }
}
