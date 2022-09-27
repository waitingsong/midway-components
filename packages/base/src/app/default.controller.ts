import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator'
import { Trace, TraceService } from '@mwcp/otel'

import { ConfigKey } from '../lib/types'

import { UserService } from './default.service'


@Controller(`/_${ConfigKey.namespace}/hello`)
export class DefaultComponentController {

  @Inject() readonly svc: UserService
  @Inject() readonly traceSvc: TraceService

  @Trace(`/_${ConfigKey.namespace}/hello`)
  @Get('/')
  async hello(): Promise<string> {
    return this.svc.hello()
  }

}
