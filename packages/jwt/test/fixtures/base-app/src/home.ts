import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'
import { Context } from '@mwcp/share'

import { TestRespBody } from '@/root.config'
import { Config, ConfigKey, MiddlewareConfig } from '~/lib/types'


@Controller('/')
export class HomeController {

  @_Config(ConfigKey.config) protected readonly config: Config
  @_Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const {
      cookies,
      header,
      url,
      jwtState,
    } = ctx
    const config = this.config
    const mwConfig = this.mwConfig
    const res = {
      config,
      mwConfig,
      cookies,
      header,
      url,
      jwtState,
      jwtOriginalErrorText: '',
    }
    if (jwtState.jwtOriginalError) {
      res.jwtOriginalErrorText = jwtState.jwtOriginalError.message
    }
    return res
  }

  @Get('/test')
  async test(ctx: Context): Promise<TestRespBody> {
    const { jwtState, cookies, header, url } = ctx
    const config = this.config
    const mwConfig = this.mwConfig
    const res = {
      config,
      mwConfig,
      cookies,
      header,
      url,
      jwtState,
      jwtOriginalErrorText: '',
    }
    if (jwtState.jwtOriginalError) {
      res.jwtOriginalErrorText = jwtState.jwtOriginalError.message
    }
    return res
  }

}

