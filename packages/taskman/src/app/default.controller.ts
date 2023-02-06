import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/core'

import { Config, ConfigKey, Msg } from '../lib/types'


@Controller(`/${ConfigKey.namespace}/hello`)
export class DefaultComponentController {

  @_Config(ConfigKey.config) readonly config: Config

  @Get('/')
  hello(): string {
    return Msg.hello
  }

}

