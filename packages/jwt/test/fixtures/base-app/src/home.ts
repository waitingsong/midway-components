/* eslint-disable node/no-unpublished-import */
import {
  Controller,
  Get,
} from '@midwayjs/decorator'

import { Context } from '../../../../src/index'
import { TestRespBody } from '../../../root.config'


@Controller('/')
export class HomeController {

  @Get('/')
  async home(): Promise<TestRespBody> {
    // @ts-expect-error
    const { jwtState, cookies, header, url } = this._req_ctx as Context
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

