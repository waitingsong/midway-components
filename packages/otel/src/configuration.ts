import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import {
  App,
  Config,
  Configuration,
  ILifeCycle,
  Inject,
  Logger,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import {
  Application,
  IMidwayContainer,
} from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { useComponents } from './imports'
import { TraceInit } from './lib'
import { OtelComponent } from './lib/component'
import {
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types'
import {
  TraceMiddlewareInner,
  TraceMiddleware,
} from './middleware/index.middleware'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Config(ConfigKey.config) protected readonly config: Conf
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() otel: OtelComponent
  @Logger() logger: ILogger

  // async onConfigLoad(): Promise<unknown> {
  //   return
  // }

  // @TraceInit(`INIT ${ConfigKey.componentName}.onReady`)
  @TraceInit({ namespace: ConfigKey.componentName })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    if (this.config.enableDefaultRoute && this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/${ConfigKey.namespace}/.+`, 'u'))
    }

    // const otel = await this.app.getApplicationContext().getAsync(OtelComponent, [ { name, version } ])
    // assert(otel, 'otel must be set')

    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddlewareInner, 'last')
    }

  }

  @TraceInit({ namespace: ConfigKey.componentName })
  async onServerReady(container: IMidwayContainer): Promise<void> {
    void container
    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddleware, 'first')
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    void setTimeout(async () => {
      const mwNames = this.app.getMiddleware().getNames()
      this.otel.addAppInitEvent({
        event: `${ConfigKey.componentName}.onServerReady.end`,
        mwNames: JSON.stringify(mwNames),
      })
      this.otel.endAppInitEvent()
    }, 0)
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    this.logger.info('[otel] onStop()')
    const otel = await container.getAsync(OtelComponent)
    await sleep(100)
    await otel.shutdown()
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


