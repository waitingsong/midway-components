/* eslint-disable node/no-extraneous-import */
/* eslint-disable @typescript-eslint/no-extraneous-class */
// import { join } from 'path'

import { IMidwayApplication } from '@midwayjs/core'
// import { IMidwayWebApplication } from '@midwayjs/web'
import { App, Config, Configuration } from '@midwayjs/decorator'
import { JaegerTracer } from 'jaeger-client'

import { tracer as DefaultConfig } from './config/config.default'
import { tracer as LocalConfig } from './config/config.local'
import { namespace, compName } from './lib/config'
import { initTracer } from './lib/tracer'
import { TracerConfig } from './lib/types'
import { tracerMiddleware, TracerMiddleware } from './middleware/tracer.middleware'


@Configuration({
  namespace,
  // importConfigs: [join(__dirname, 'config')],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
})
export class AutoConfiguration {
  @App() readonly app: IMidwayApplication

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
  app: IMidwayApplication,
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

