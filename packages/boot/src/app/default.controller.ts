import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/core'

import { Cacheable, ConfigKey, Msg } from '##/lib/types.js'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultBootComponentController {

  @Get('/hello')
  async hello(): Promise<string> {
    return this._hello()
  }

  @Cacheable()
  protected async _hello(): Promise<string> {
    return Msg.hello
  }

}

