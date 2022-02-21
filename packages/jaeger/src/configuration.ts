/* eslint-disable node/no-extraneous-import */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

// import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'
import { JaegerTracer } from 'jaeger-client'

import * as DefaultConfig from './config/config.default'
import * as LocalConfig from './config/config.local'
import * as TestConfig from './config/config.unittest'
import { namespace, compName } from './lib/config'
import { initTracer } from './lib/tracer'
import { TracerConfig } from './lib/types'
import { TracerMiddleware } from './middleware/tracer.middleware'

import { Application } from '~/interface'


@Configuration({
  namespace,
  // importConfigs: [join(__dirname, 'config')],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      unittest: TestConfig,
    },
  ],
})
export class AutoConfiguration {
  @App() readonly app: Application

  @Config('tracer') readonly tracerConfig: TracerConfig

  private tracer: JaegerTracer

  async onReady(): Promise<void> {
    this.tracer = initTracer(this.app)
    registerMiddleware(this.app, this.tracerConfig)
  }

  async onStop(): Promise<void> {
    this.tracer.close()
  }
}

export function registerMiddleware(
  app: Application,
  tracerConfig: TracerConfig,
): void {

  const { enableMiddleWare } = tracerConfig
  if (! enableMiddleWare) { return }

  const names = app.getMiddleware().getNames()
  if (names.includes(compName)) {
    return
  }

  /**
   * 应于所有中间件之前，以便追踪覆盖更大范围
   */
  // @ts-expect-error
  app.getMiddleware().insertFirst(TracerMiddleware)

  // const appMiddleware = app.getConfig('middleware') as string[]
  // if (Array.isArray(appMiddleware)) {
  //   appMiddleware.push(namespace + ':tracerExtMiddleware')
  // }
  // else {
  //   app.getLogger().warn(`${compName} appMiddleware is not valid Array`)
  //   // throw new TypeError('appMiddleware is not valid Array')
  // }

  /**
   * 应于所有中间件之前，以便追踪覆盖更大范围
   */
  // app.useMiddleware(tracerMiddleware)
}

