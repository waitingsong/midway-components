import {
  Controller,
  Get,
} from '@midwayjs/decorator'

import { RootClass } from '~/index'


@Controller('/test')
export class TestController extends RootClass {

  @Get('/err')
  testError(): unknown {
    // HTTP Response Code is 200, Result.code is 2404
    this.throwError('管理员不存在，请检查', 2404)
  }

}


