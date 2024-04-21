import { Inject, Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, DecoratorHandlerBase } from '@mwcp/share'

import { OtelComponent } from '../component.js'
import { TraceDecoratorOptions } from '../decorator.types.js'
import { DecoratorExecutorParam, GenDecoratorExecutorOptions, genDecoratorExecutorOptions } from '../trace.helper.js'
import { Config, ConfigKey } from '../types.js'

import { decoratorExecutor } from './trace-init.helper.js'


@Singleton()
export class DecoratorHandlerTraceInit extends DecoratorHandlerBase {
  @MConfig(ConfigKey.config) protected readonly config: Config

  @Inject() protected readonly otelComponent: OtelComponent

  override genExecutorParam(options: DecoratorExecutorParamBase<TraceDecoratorOptions>) {
    const optsExt: GenDecoratorExecutorOptions = {
      config: this.config,
      otelComponent: this.otelComponent,
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async executorAsync(options: DecoratorExecutorParam) {
    return decoratorExecutor(options)
  }
}

