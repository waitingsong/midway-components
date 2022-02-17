import {
  Controller,
  Get,
} from '@midwayjs/decorator'


@Controller('/')
export class RootController {
  @Get('/')
  async base() {
    return 'OK'
  }
}
