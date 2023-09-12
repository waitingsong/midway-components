import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/core'
import { Trace } from '@mwcp/otel'

import { Config, ConfigKey, Msg } from '##/lib/types.js'


@Controller(`/${ConfigKey.namespace}/hello`)
export class DefaultComponentController {

  @_Config(ConfigKey.clientConfig) readonly config: Config

  @Trace()
  @Get('/')
  hello(): string {
    return Msg.hello
  }

}

