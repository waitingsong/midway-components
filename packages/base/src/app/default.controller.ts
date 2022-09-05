import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'

import { ConfigKey, Msg } from '../lib/types'


@Controller(`/${ConfigKey.namespace}/hello`)
export class DefaultComponentController {

  @Get('/')
  hello(): string {
    return Msg.hello
  }

}

