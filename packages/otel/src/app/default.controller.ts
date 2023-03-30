import {
  Config as _Config,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'

import { TraceService } from '../lib/index'
import { Trace } from '../lib/trace.decorator'
import { Config, ConfigKey, Msg } from '../lib/types'

import { DefaultOtelComponentService } from './default.service'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultOtelComponentController {

  @_Config(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultOtelComponentService
  @Inject() readonly traceSvc: TraceService

  @Logger() logger: ILogger

  @Trace(`/_${ConfigKey.namespace}/hello`)
  @Get('/hello')
  @Post('/hello')
  async hello(): Promise<string> {
    this.valiateRoute()
    const traceId = this.traceSvc.getTraceId()
    const msg = await this.svc.hello(Msg.hello)
    const ret = `${msg}: ${traceId}`
    return ret
  }

  valiateRoute(): void {
    if (! this.config.enableDefaultRoute) {
      throw new Error('route is not enabled')
    }
  }

}

