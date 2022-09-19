import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'

import { ConfigKey, Msg } from '../lib/types'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultBaseComponentController {

  @Get('/hello')
  hello(): string {
    return Msg.hello
  }

}

