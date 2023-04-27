import assert from 'node:assert'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { Trace, TraceService } from '~/lib/index'
import { TraceLogger } from '~/lib/trace.logger'
import { Config, ConfigKey, Msg } from '~/lib/types'

import { DefaultComponentService } from './test.service'
import { apiPrefix, apiRoute } from './api-route'


@Controller(apiPrefix.TraceDecorator)
export class DefaultComponentController {

  @_Config(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger

  @Get(`/${apiRoute.id}`)
  async traceId(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    this.traceSvc.setAttributes(void 0, {foo: 'foo'})
    // ensure child span of svc.hello is sent, to keep span order for unit test validation
    await this.traceSvc.flush()
    return traceId
  }

  @Trace()
  @Get(`/${apiRoute.id2}`)
  async traceId2(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.traceSvc.setAttributesLater(void 0, {bar: 'bar'})
    const msg = await this.svc.hello(Msg.hello)
    assert(msg)

    const msg2 = this.svc.helloSync(Msg.hello)
    assert(typeof msg2 === 'string')
    assert(msg2)

    await this.traceSvc.flush()
    return traceId
  }

  @Trace()
  @Get(`/${apiRoute.decorator_arg}`)
  async arg(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const rnd = Math.random()
    const msg = await this.svc.testArg(rnd)
    assert(msg)
    const msg2 = this.svc.helloSync(Msg.hello)
    assert(msg2)

    // await this.traceSvc.flush()
    const ret = `${traceId}:${rnd}`
    return ret
  }

  @Trace()
  @Get(`/${apiRoute.decorator_arg2}`)
  async arg2(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const rnd = Math.round(Math.random() * 100)
    const str = 'bar'
    const msg = await this.svc.testArg2(rnd, str)
    assert(msg)

    // await this.traceSvc.flush()
    const ret = `${traceId}:${rnd}:${str}`
    return ret
  }


  @Trace()
  @Get(`/${apiRoute.disable_trace}`)
  async noTrace(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    return traceId // should be empty
  }

  @Trace()
  @Get(`/${apiRoute.error}`)
  async error(): Promise<string> {
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
  @Get(`/${apiRoute.trace_error}`)
  async traceError(): Promise<string> {
    await this.svc.traceError(true)
    return 'should not reach here'
  }


  @Get(`/${apiRoute.log}`)
  async log(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.logger.log({
      msg: traceId,
    })
    return traceId
  }

  @Get(`/${apiRoute.warn}`)
  async warn(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.logger.warn({
      traceId,
    })
    return traceId
  }

}

