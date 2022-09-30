import assert from 'assert'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator'
import type { Context } from '@mwcp/share'

import { TestRespBody } from '@/root.config'
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
  TestSpanInfo,
} from '~/lib/types'
import { Trace, TraceService } from '~/index'


@Controller('/')
export class HomeController {

  @_Config(ConfigKey.config) protected readonly config: Config
  @_Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig
  @Inject() readonly traceSvc: TraceService


  @Trace()
  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const span = this.traceSvc.getActiveSpan()
    assert(span, 'current span undefined')
    const spanInfo: TestSpanInfo = {
      // @ts-expect-error
      startTime: span.startTime,
      // @ts-expect-error
      attributes: span.attributest,
      // @ts-expect-error
      name: span.name,
      // @ts-expect-error
      status: span.status,
    }

    const {
      cookies,
      header,
      url,
    } = ctx

    const res = {
      cookies,
      header,
      url,
      spanInfo,
    }
    return res
  }

}

