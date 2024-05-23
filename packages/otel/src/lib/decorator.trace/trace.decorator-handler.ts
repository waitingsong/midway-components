import { Inject, Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, DecoratorHandlerBase } from '@mwcp/share'

import { OtelComponent } from '../component.js'
import { TraceDecoratorOptions } from '../decorator.types.js'
import { DecoratorExecutorParam, GenDecoratorExecutorOptions, genDecoratorExecutorOptions } from '../trace.helper.js'
import { Config, ConfigKey } from '../types.js'

import { decoratorExecutorAsync } from './trace.helper.async.js'
import { decoratorExecutorSync } from './trace.helper.sync.js'


@Singleton()
export class DecoratorHandlerTrace extends DecoratorHandlerBase {
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
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParam) {
    const ret = decoratorExecutorSync(options)
    return ret
  }
}

