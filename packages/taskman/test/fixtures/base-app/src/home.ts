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
  async home(): Promise<TestRespBody> {
    // @ts-expect-error
    const { cookies, header, url } = this._req_ctx as Context
    const res = {
      cookies,
      header,
      url,
      jwtOriginalErrorText: '',
    }
    return res
  }

}

