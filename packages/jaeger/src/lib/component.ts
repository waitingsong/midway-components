/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { MidwayInformationService } from '@midwayjs/core'
import {
  App,
  Config as _Config,
  Destroy,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import type { Application } from '@mwcp/share'
import type { NpmPkg } from '@waiting/shared-types'
import {
  initTracer as initJaegerTracer,
  JaegerTracer,
} from 'jaeger-client'
import { initGlobalTracer } from 'opentracing'

import { Config, ConfigKey } from './types'


@Provide()
@Scope(ScopeEnum.Singleton)
export class TracerComponent {

  @App() readonly app: Application

  @_Config(ConfigKey.config) protected readonly config: Config

  private tracer: JaegerTracer

  @Init()
  async init(): Promise<void> {
    const { tracingConfig } = this.config

    let pkg: NpmPkg | undefined
    const informationService = await this.app.getApplicationContext().getAsync(MidwayInformationService)
    if (informationService) {
      pkg = informationService.getPkg() as NpmPkg
    }

    const pkgName = pkg?.name ?? `tracer-pkg-${new Date().toLocaleTimeString()}`
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

