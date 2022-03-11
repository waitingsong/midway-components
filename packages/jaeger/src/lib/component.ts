import {
  Config as _Config,
  Destroy,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import {
  initTracer as initJaegerTracer,
  JaegerTracer,
} from 'jaeger-client'
import { initGlobalTracer } from 'opentracing'

import {
  Config,
  ConfigKey,
} from './index'


@Provide()
@Scope(ScopeEnum.Singleton)
export class TracerComponent {

  @_Config(ConfigKey.config) protected readonly config: Config

  private tracer: JaegerTracer

  @Init()
  async init(): Promise<void> {
    const { tracingConfig } = this.config

    let name = tracingConfig.serviceName ?? `jaeger-${Date.now()}`
    name = name.replace(/@/ug, '').replace(/\//ug, '-')
    if (! name) {
      throw new Error('service name empty')
    }
    tracingConfig.serviceName = name

    this.tracer = initJaegerTracer(this.config.tracingConfig, {})
    initGlobalTracer(this.tracer)
  }

  @Destroy()
  async stop(): Promise<void> {
    this.close()
  }

  close(): void {
    this.tracer.close()
  }

}

