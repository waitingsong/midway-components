import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import { ILifeCycle, MidwayDecoratorService, MidwayInformationService } from '@midwayjs/core'
import { App, Config, Configuration, Inject, Logger } from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'
import type { Application, IMidwayContainer } from '@mwcp/share'
import { BasicTracerProvider, BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { sleep } from '@waiting/shared-core'
import type { NpmPkg } from '@waiting/shared-types'


import { useComponents } from './imports'
import { OtelComponent } from './lib/component'
import { registerMethodHandler } from './lib/trace.decorator'
import {
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types'
import {
  TraceMiddlewareInner,
  TraceMiddleware,
} from './middleware/index.middleware'


const otelPkgPath = join(__dirname, '../package.json')


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Config(ConfigKey.config) protected readonly config: Conf
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() decoratorService: MidwayDecoratorService
  @Logger() logger: ILogger

  protected spanProcessors: (BatchSpanProcessor | SimpleSpanProcessor)[] = []
  protected provider: BasicTracerProvider | undefined

  protected otelLibraryName: string
  protected otelLibraryVersion: string

  async onConfigLoad(): Promise<unknown> {
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    let pkg: NpmPkg | undefined
    const informationService = await this.app.getApplicationContext().getAsync(MidwayInformationService)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (informationService) {
      pkg = informationService.getPkg() as NpmPkg
    }
    let serviceName = this.config.serviceName
      ? this.config.serviceName
      : pkg?.name ?? `unknown-${new Date().toLocaleDateString()}`
    serviceName = serviceName.replace('@', '').replace(/\//ug, '-')

    const ver = this.config.serviceVersion
      ? this.config.serviceVersion
      : pkg?.version ?? ''

    this.config.serviceName = serviceName
    this.config.serviceVersion = ver

    return
  }

  async onReady(): Promise<void> {
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    const { name, version } = await import(otelPkgPath) as NpmPkg
    assert(name, 'package file of otel not found')
    assert(version, 'package file of otel not found')

    if (this.config.enableDefaultRoute && this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/${ConfigKey.namespace}/.+`, 'u'))
    }

    const otel = await this.app.getApplicationContext().getAsync(OtelComponent)
    assert(otel, 'otel must be set')
    otel.otelLibraryName = name
    otel.otelLibraryVersion = version

    // const decoratorService = await this.app.getApplicationContext().getAsync(MidwayDecoratorService)
    // assert(decoratorService === this.decoratorService)
    registerMethodHandler(this.decoratorService, this.config)

    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddlewareInner, 'last')
    }
  }

  async onServerReady(): Promise<void> {
    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddleware, 'first')
    }

    // const mwNames = this.app.getMiddleware().getNames()
    // console.log({ mwNames })
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    this.logger.info('[otem] onStop()')
    await sleep(1000)
    const inst = await container.getAsync(OtelComponent)
    await inst.shutdown()
  }

}

function registerMiddleware(
  app: Application,
  middleware: { name: string },
  postion: 'first' | 'last' = 'last',
): void {

  const mwNames = app.getMiddleware().getNames()
  if (mwNames.includes(middleware.name)) {
    return
  }

  switch (postion) {
    case 'first':
      // @ts-ignore
      app.getMiddleware().insertFirst(middleware)
      break
    case 'last':
      // @ts-ignore
      app.getMiddleware().insertLast(middleware)
      break
  }
}


