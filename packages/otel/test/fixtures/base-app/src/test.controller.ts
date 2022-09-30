import assert from 'node:assert'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'

import { TraceService } from '~/lib/index'
import { Trace } from '~/lib/trace.decorator'
import { Config, ConfigKey, Msg } from '~/lib/types'

import { DefaultComponentService } from './test.service'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultComponentController {

  @_Config(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Logger() logger: ILogger

  @Get('/id')
  async traceId(): Promise<string> {
    this.valiateRoute()
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    // ensure child span of svc.hello is sent, to keep span order for unit test validation
    await this.traceSvc.flush()
    return traceId
  }

  @Trace()
  @Get('/id2')
  async traceId2(): Promise<string> {
    this.valiateRoute()
    const traceId = this.traceSvc.getTraceId()
    const msg = await this.svc.hello(Msg.hello)
    assert(msg)
    await this.traceSvc.flush()
    return traceId
  }

  @Trace()
  @Get('/error')
  async error(): Promise<string> {
    this.valiateRoute()
    try {
      await this.svc.error(true)
    }
    catch (ex) {
      if (ex instanceof Error) {
        return ex.message
      }
      throw ex
    }

    return 'should not reach here'
  }

  @Trace()
  @Get('/trace_error')
  async traceError(): Promise<string> {
    this.valiateRoute()
    await this.svc.traceError(true)
    return 'should not reach here'
  }

  valiateRoute(): void {
    if (! this.config.enableDefaultRoute) {
      throw new Error('route is not enabled')
    }
  }

}

