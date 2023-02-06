import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/core'

import { RespData } from '@/root.config'
import { Context } from '~/index'


@Controller('/')
export class HomeController {

  @Get('/')
  async home(ctx: Context): Promise<RespData> {
    const {
      cookies,
      header,
      url,
    } = ctx
    const res = {
      cookies,
      header,
      url,
    }
    return res
  }

}

