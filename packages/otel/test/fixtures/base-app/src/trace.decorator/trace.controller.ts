import assert from 'node:assert'

import {
  Controller,
  Get,
  Init,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../../../../../dist/lib/index.js'
import { TraceLogger, TraceAppLogger } from '../../../../../dist/lib/trace.logger.js'
import { Config, ConfigKey, Msg } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.TraceDecorator)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger
  @Inject() readonly appLogger: TraceAppLogger

  @Init()
  async init(): Promise<void> {
    assert(true)
  }

  @Get(`/${apiMethod.id}`)
  async traceId(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    this.traceSvc.setAttributes(void 0, { foo: 'foo' })
    // ensure child span of svc.hello is sent, to keep span order for unit test validation
    await this.traceSvc.flush()
    return traceId
  }

  @Trace()
  @Get(`/${apiMethod.id2}`)
  async traceId2(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.traceSvc.setAttributesLater(void 0, { bar: 'bar' })
    const msg = await this.svc.hello(Msg.hello)
    assert(msg)

    const msg2 = this.svc.helloSync(Msg.hello)
    assert(typeof msg2 === 'string')
    assert(msg2)

    await this.traceSvc.flush()
    return traceId
  }

  @Trace()
  @Get(`/${apiMethod.decorator_arg}`)
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
  @Get(`/${apiMethod.decorator_arg2}`)
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
  @Get(`/${apiMethod.disable_trace}`)
  async noTrace(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    return traceId // should be empty
  }

  @Trace()
  @Get(`/${apiMethod.error}`)
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
  @Get(`/${apiMethod.trace_error}`)
  async traceError(): Promise<string> {
    await this.svc.traceError(true)
    return 'should not reach here'
  }


  @Get(`/${apiMethod.log}`)
  async log(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.logger.log({
      msg: traceId,
    })

    this.logger.debug({
      msg: traceId,
    })
    this.logger.info({
      msg: traceId,
    })
    this.logger.warn({
      msg: traceId,
    })
    this.logger.error({
      msg: traceId,
    })
    this.logger.write({
      msg: traceId,
    })
    this.logger.verbose({
      msg: traceId,
    })
    return traceId
  }

  @Get(`/${apiMethod.appLog}`)
  async appLog(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    // no event
    this.appLogger.log({
      msg: traceId,
    })
    this.appLogger.log({
      msg: traceId,
    }, this.traceSvc.rootSpan)
    return traceId
  }

  @Get(`/${apiMethod.warn}`)
  async warn(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.logger.warn({
      traceId,
    })
    return traceId
  }

}

