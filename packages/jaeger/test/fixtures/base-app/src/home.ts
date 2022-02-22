/* eslint-disable node/no-unpublished-import */
import {
  Controller,
  Get,
} from '@midwayjs/decorator'

import { Context } from '../../../../src/interface'
import { TestSpanInfo, TracerConfig } from '../../../../src/lib/types'
import { processPriority, ProcessPriorityOpts } from '../../../../src/middleware/helper'
import { TestRespBody } from '../../../root.config'


@Controller('/')
export class HomeController {

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const { cookies, header, url } = ctx

    const span = ctx.tracerManager.currentSpan()
    if (! span) {
      throw TypeError('span undefined')
    }
    const headerInit = ctx.tracerManager.headerOfCurrentSpan()
    const isTraceEnabled = ctx.tracerManager.isTraceEnabled
    const spanInfo: TestSpanInfo = {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logs: span._logs,
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tags: span._tags,
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      startTime: span._startTime,
      headerInit,
      isTraceEnabled,
    }

    const res: TestRespBody = {
      cookies,
      header,
      url,
      spanInfo,
    }
    return res
  }

  @Get('/processPriority')
  async processPriority(ctx: Context): Promise<number | 'undefined'> {
    const tracerConfig = ctx.app.getConfig('tracer') as TracerConfig
    const opts: ProcessPriorityOpts = {
      starttime: ctx.startTime,
      tracerTags: {},
      trm: ctx.tracerManager,
      tracerConfig,
    }
    const cost = await processPriority(opts)
    const ret = typeof cost === 'undefined' ? 'undefined' : cost
    return ret
  }

  @Get('/untraced_path_string')
  async untracedPathString(ctx: Context): Promise<boolean> {
    const ret = ctx.tracerManager.isTraceEnabled
    return ret
  }

  @Get('/untraced_path_reg_exp')
  async untracedPathRegExp(ctx: Context): Promise<boolean> {
    const ret = ctx.tracerManager.isTraceEnabled
    return ret
  }

}

