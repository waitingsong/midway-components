/* eslint-disable node/no-unpublished-import */
import {
  Controller,
  Get,
} from '@midwayjs/decorator'

import { Context } from '../../../../src/interface'
import { TracerConfig } from '../../../../src/lib/types'
import { processPriority, ProcessPriorityOpts } from '../../../../src/middleware/helper'
import { TestRespBody } from '../../../root.config'


@Controller('/')
export class HomeController {

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const { cookies, header, url } = ctx
    const res = {
      cookies,
      header,
      url,
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

}

