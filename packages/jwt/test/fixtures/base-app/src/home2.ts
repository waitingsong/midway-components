import {
  Controller,
  Get,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'

import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from '../../../../dist/lib/types.js'
import { RespData } from '../../../root.config.js'


@Controller('/')
export class HomeController {

  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Get('/home2')
  async home2(ctx: Context): Promise<RespData> {
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
  async test(ctx: Context): Promise<RespData> {
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

