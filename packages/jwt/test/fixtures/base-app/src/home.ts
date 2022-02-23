/* eslint-disable node/no-unpublished-import */
import {
  Controller,
  Get,
} from '@midwayjs/decorator'

import { Context } from '../../../../src/interface'
import { TestRespBody } from '../../../root.config'


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

}

