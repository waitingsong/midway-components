import {
  Config as _Config,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import {
  initTracer as initJaegerTracer,
  JaegerTracer,
  TracingConfig,
} from 'jaeger-client'
import {
  FORMAT_HTTP_HEADERS,
  Span,
  SpanContext,
  initGlobalTracer,
  globalTracer,
} from 'opentracing'

import { SpanHeaderInit, SpanLogInput } from './types'

import {
  Config,
  ConfigKey,
} from './index'

import { Application, NpmPkg } from '~/interface'


@Provide()
@Scope(ScopeEnum.Singleton)
export class TracerComponent {

  @_Config(ConfigKey.config) protected readonly config: Config

  private tracer: JaegerTracer

  @Init()
  async init(): Promise<void> {
    const { tracingConfig } = this.config

    let name = tracingConfig.serviceName ?? 'jaeger'
    name = name.replace(/@/ug, '').replace(/\//ug, '-')
    if (! name) {
      throw new Error('service name empty')
    }

    this.tracer = initJaegerTracer(this.config, {})
    initGlobalTracer(this.tracer)
  }

  close(): void {
    this.tracer.close()
  }

}

