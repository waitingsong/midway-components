import {
  Controller,
  Get,
} from '@midwayjs/decorator'

import { TestRespBody } from '@/root.config'
import { Context } from '~/interface'



@Controller('/')
export class HomeController {

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const { jwtState, cookies, header, url } = ctx
    const res = {
      jwtState,
      cookies,
      header,
      url,
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
    const res = {
      jwtState,
      cookies,
      header,
      url,
      jwtOriginalErrorText: '',
    }
    if (jwtState.jwtOriginalError) {
      res.jwtOriginalErrorText = jwtState.jwtOriginalError.message
    }
    return res
  }

}

