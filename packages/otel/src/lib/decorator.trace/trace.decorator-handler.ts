import { Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, genError } from '@mwcp/share'

import { DecoratorHandlerTraceBase } from '../decorator-handler-trace-base.js'
import { genDecoratorExecutorOptions } from '../trace.helper.js'
import type { DecoratorExecutorParam, GenDecoratorExecutorOptions, TraceDecoratorOptions } from '../trace.service.js'
import { Config, ConfigKey } from '../types.js'

import { beforeAsync, afterReturnAsync, afterThrowAsync } from './trace.helper.async.js'
import { beforeSync, afterReturnSync, afterThrowSync } from './trace.helper.sync.js'


@Singleton()
export class DecoratorHandlerTrace extends DecoratorHandlerTraceBase {
  @MConfig(ConfigKey.config) protected readonly config: Config

  override genExecutorParam(options: DecoratorExecutorParamBase<TraceDecoratorOptions>) {
    const optsExt: GenDecoratorExecutorOptions = {
      config: this.config,
      traceService: this.traceService,
    }
    if (! options.webContext) {
      options.webContext = this.getWebContext()
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override before(options: DecoratorExecutorParam) {
    /* c8 ignore next */
    if (! this.isEnable(options)) { return }

    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return beforeAsync(options)
    }
    beforeSync(options)
  }

  /**
   * Span will be ended if `autoEndSpan` is true when afterReturn() or afterThrow()
   */
  override afterReturn(options: DecoratorExecutorParam): unknown {
    /* c8 ignore next 3 */
    if (! this.isEnable(options)) {
      return options.methodResult
    }

    if (options.methodIsAsyncFunction) {
      return afterReturnAsync(options)
    }
    return afterReturnSync(options)
  }

  override afterThrow(options: DecoratorExecutorParam, errorExt?: unknown): never | Promise<never> {
    const error = genError({
      error: errorExt ?? options.error,
      throwMessageIfInputUndefined: `[@mwcp/${ConfigKey.namespace}] Trace() afterThrow error is undefined`,
      altMessage: `[@mwcp/${ConfigKey.namespace}] Trace() decorator afterThrow error`,
    })
    options.error = error

    if (options.methodIsAsyncFunction) {
      return afterThrowAsync(options).then(() => {
        this.traceError(options, error, true)
        throw error
      })
    }
    afterThrowSync(options)
    this.traceError(options, error, true)
    throw error
  }

}

