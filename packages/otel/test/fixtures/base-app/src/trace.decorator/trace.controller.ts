import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Trace, TraceService } from '../types/index.js'
import { TraceAppLogger, TraceLogger } from '../types/lib-index.js'
import { Config, ConfigKey } from '../types/lib-types.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.TraceDecorator)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: Context
  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger
  @Inject() readonly appLogger: TraceAppLogger

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
    assert(traceId, 'traceId should not be empty')
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

    this.appLogger.debug(void 0, false)
    this.appLogger.debug(traceId, false)
    this.appLogger.info(traceId, false)
    this.appLogger.warn(traceId, false)
    this.appLogger.error(traceId, false)
    this.appLogger.write(traceId, false)
    this.appLogger.verbose(traceId, false)

    // no event
    this.appLogger.log({
      msg: traceId,
    })
    this.appLogger.log({
      msg: traceId,
    }, this.traceSvc.getRootSpan(this.ctx))
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

