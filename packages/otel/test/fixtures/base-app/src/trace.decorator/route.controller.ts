import assert from 'node:assert'

import {
  Controller,
  Get,
  Init,
  Inject,
  MidwayWebRouterService,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../../../../../dist/lib/index.js'
import { TraceLogger, TraceAppLogger } from '../../../../../dist/lib/trace.logger.js'
import { Config, ConfigKey, Msg } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.route)
export class RouteComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger
  @Inject() readonly appLogger: TraceAppLogger

  @Inject() webRouterService: MidwayWebRouterService

  @Init()
  async init(): Promise<void> {
    assert(true)
  }

  @Trace()
  @Get(`/${apiMethod.hello}/:id`)
  async traceId(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    this.traceSvc.setAttributes(void 0, { helloFoo: 'helloFoo' })
    // ensure child span of svc.hello is sent, to keep span order for unit test validation
    await this.traceSvc.flush()
    return traceId
  }

}

