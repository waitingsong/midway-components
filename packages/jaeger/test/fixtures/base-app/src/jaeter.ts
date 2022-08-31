import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator'

import { TestRespBody } from '@/root.config'
import { Context } from '~/interface'
import { processPriority, ProcessPriorityOpts } from '~/lib/tracer'
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
  TestSpanInfo,
  TracerManager,
} from '~/index'


@Controller('/')
export class JaegerController {

  @_Config(ConfigKey.config) protected readonly config: Config
  @_Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() readonly tracerManager: TracerManager

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const { cookies, header, url } = ctx

    this.tracerManager.addTags(ctx.tracerTags)
    const span = this.tracerManager.currentSpan()
    // console.info({ span })
    if (! span) {
      throw TypeError('span undefined')
    }
    const headerInit = this.tracerManager.headerOfCurrentSpan()
    const isTraceEnabled = this.tracerManager.isTraceEnabled
    const spanInfo: TestSpanInfo = {
      // @ts-expect-error
      logs: span._logs,
      // @ts-expect-error
      tags: span._tags,
      // @ts-expect-error
      startTime: span._startTime,
      headerInit,
      isTraceEnabled,
    }

    const config = this.config
    const mwConfig = this.mwConfig
    const res = {
      config,
      mwConfig,
      cookies,
      header,
      url,
      spanInfo,
    }
    return res
  }

  @Get('/processPriority')
  async processPriority(ctx: Context): Promise<number | 'undefined'> {
    const tracerConfig = this.config
    const opts: ProcessPriorityOpts = {
      starttime: ctx.startTime,
      tracerTags: {},
      trm: this.tracerManager,
      tracerConfig,
    }
    const cost = await processPriority(opts)
    const ret = typeof cost === 'undefined' ? 'undefined' : cost
    return ret
  }

  @Get('/untraced_path_string')
  async untracedPathString(): Promise<boolean> {
    const ret = this.tracerManager.isTraceEnabled
    return ret
  }

  @Get('/untraced_path_reg_exp')
  async untracedPathRegExp(): Promise<boolean> {
    const ret = this.tracerManager.isTraceEnabled
    return ret
  }

}

