import {
  Controller,
  Get,
  Inject,
  Logger,
  Post,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import { MConfig } from '@mwcp/share'


import { Trace, TraceService } from '##/lib/index.js'
import { Config, ConfigKey, Msg } from '##/lib/types.js'

import { DefaultOtelComponentService } from './default.service.js'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultOtelComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultOtelComponentService
  @Inject() readonly traceSvc: TraceService

  @Logger() logger: ILogger

  @Trace(`/_${ConfigKey.namespace}/hello`)
  @Get('/hello')
  @Post('/hello')
  async hello(): Promise<string> {
    this.validateRoute()
    const traceId = this.traceSvc.getTraceId()
    const msg = await this.svc.hello(Msg.hello)
    const ret = `${msg}: ${traceId}`
    return ret
  }

  validateRoute(): void {
    if (! this.config.enableDefaultRoute) {
      throw new Error('route is not enabled')
    }
  }

}

