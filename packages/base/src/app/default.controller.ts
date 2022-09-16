import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'

import { ConfigKey, Msg } from '../lib/types'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultComponentController {

  @Get('/hello')
  hello(): string {
    return Msg.hello
  }

}

