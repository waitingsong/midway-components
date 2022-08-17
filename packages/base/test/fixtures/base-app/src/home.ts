import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'
import { Context } from '@mw-components/share'

import { RespData } from '@/root.config'


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

