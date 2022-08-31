/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  Config as _Config,
  Destroy,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import { NpmPkg } from '@waiting/shared-types'
import {
  initTracer as initJaegerTracer,
  JaegerTracer,
} from 'jaeger-client'
import { initGlobalTracer } from 'opentracing'

import { ConfigKey } from './config'
import { Config } from './types'


@Provide()
@Scope(ScopeEnum.Singleton)
export class TracerComponent {

  @_Config(ConfigKey.config) protected readonly config: Config

  @_Config('pkg') protected readonly pkg: NpmPkg

  private tracer: JaegerTracer

  @Init()
  async init(): Promise<void> {
    const { tracingConfig } = this.config

    const pkgName = (this.pkg && this.pkg.name) ?? `pkg-${new Date().toLocaleTimeString()}`
    // let name = tracingConfig.serviceName ?? `jaeger-${Date.now()}`
    let name = tracingConfig.serviceName ?? pkgName
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

