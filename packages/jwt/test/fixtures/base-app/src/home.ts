import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator'
import { Context } from '@midwayjs/koa'


@Controller('/')
export class HomeController {

  @Inject() readonly ctx: Context

  @Get('/')
  async home() {
    const res = this.ctx
    console.log({ res })
    return 'OK'
  }

}

