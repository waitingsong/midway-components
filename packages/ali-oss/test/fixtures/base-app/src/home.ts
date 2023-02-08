import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'

import { TestRespBody } from '@/root.config'
import {
  Config,
  ConfigKey,
} from '~/lib/types'


@Controller('/')
export class HomeController {

  @_Config(ConfigKey.config) protected readonly config: Config

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const {
      cookies,
      header,
      url,
    } = ctx
    const config = this.config
    const res = {
      config,
      cookies,
      header,
      url,
    }
    return res
  }

}

