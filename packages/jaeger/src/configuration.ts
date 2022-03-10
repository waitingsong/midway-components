import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'
import { JaegerTracer } from 'jaeger-client'

import { initTracer } from './lib/tracer'
import { TracerMiddleware } from './middleware/tracer.middleware'

import { ConfigKey, MiddlewareConfig } from '~/index'
import { Application } from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  private tracer: JaegerTracer

  async onReady(): Promise<void> {
    if (! this.app) {
      throw new TypeError('this.app invalid')
    }

    this.tracer = initTracer(this.app)
    const { enableMiddleware } = this.mwConfig
    if (enableMiddleware) {
      registerMiddleware(this.app)
    }
  }

  async onStop(): Promise<void> {
    this.tracer.close()
  }
}

export function registerMiddleware(
  app: Application,
): void {

  // @ts-expect-error
  app.getMiddleware().insertFirst(TracerMiddleware)
}

