import { Singleton } from '@midwayjs/core'
import { DecoratorExecutorParamBase, MConfig, genError } from '@mwcp/share'

import { DecoratorHandlerTraceBase } from '../decorator-handler-trace-base.js'
import { genDecoratorExecutorOptions } from '../trace.helper.js'
import type { DecoratorExecutorParam, GenDecoratorExecutorOptions } from '../trace.service/index.trace.service.js'
import { TraceDecoratorOptions } from '../trace.service/index.trace.service.js'
import { Config, ConfigKey } from '../types.js'

import { afterReturnAsync, afterThrowAsync as afterThrowAsync, beforeAsync } from './trace-log.helper.async.js'
import { afterReturnSync, afterThrowSync, beforeSync } from './trace-log.helper.sync.js'


@Singleton()
export class DecoratorHandlerTraceLog extends DecoratorHandlerTraceBase {
  @MConfig(ConfigKey.config) protected readonly config: Config

  override genExecutorParam(options: DecoratorExecutorParamBase<TraceDecoratorOptions>) {
    const optsExt: GenDecoratorExecutorOptions = {
      config: this.config,
      traceService: this.traceService,
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override before(options: DecoratorExecutorParam) {
    /* c8 ignore next */
    if (! this.isEnable(options)) { return }
    if (! options.webContext) {
      options.webContext = this.getWebContext()
    }

    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return beforeAsync(options)
    }
    beforeSync(options)
  }

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
        this.traceError(options, error, false)
        throw error
      })
    }
    afterThrowSync(options)
    this.traceError(options, error, false)
    throw error
  }

}

