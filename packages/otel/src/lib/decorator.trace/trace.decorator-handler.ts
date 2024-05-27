import { Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, genError } from '@mwcp/share'

import { DecoratorHandlerTraceBase } from '../decorator.base.types.js'
import { TraceDecoratorOptions } from '../decorator.types.js'
import { DecoratorExecutorParam, GenDecoratorExecutorOptions, genDecoratorExecutorOptions } from '../trace.helper.js'
import { Config, ConfigKey } from '../types.js'

import { beforeAsync, afterReturnAsync } from './trace.helper.async.js'
import { beforeSync, afterReturnSync } from './trace.helper.sync.js'


@Singleton()
export class DecoratorHandlerTrace extends DecoratorHandlerTraceBase {
  @MConfig(ConfigKey.config) protected readonly config: Config

  override genExecutorParam(options: DecoratorExecutorParamBase<TraceDecoratorOptions>) {
    const optsExt: GenDecoratorExecutorOptions = {
      config: this.config,
      otelComponent: this.otelComponent,
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override before(options: DecoratorExecutorParam) {
    if (! this.isEnable(options)) { return }

    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return beforeAsync(options)
    }

    try {
      beforeSync(options)
    }
    catch (ex) {
      this.afterThrow(options, ex)
      console.error(`[@mwcp/${ConfigKey.namespace}] Trace() error not processed`, ex)
    }
    return
  }

  override afterReturn(options: DecoratorExecutorParam): unknown {
    if (! this.isEnable(options)) {
      return options.methodResult
    }

    if (options.methodIsAsyncFunction) {
      return afterReturnAsync(options)
    }
    return afterReturnSync(options)
  }

  override afterThrow(options: DecoratorExecutorParam, errorExt?: unknown): void {
    const error = genError({
      error: options.error ?? errorExt,
      throwMessageIfInputUndefined: `[@mwcp/${ConfigKey.namespace}] Trace() afterThrow error is undefined`,
      altMessage: `[@mwcp/${ConfigKey.namespace}] Trace() decorator afterThrow error`,
    })
    options.error = error
    this.traceError(options, error)

    throw error
  }

}

