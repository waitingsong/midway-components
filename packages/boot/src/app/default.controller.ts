import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'

import { Cacheable, ConfigKey, Msg } from '../lib/types'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultBaseComponentController {

  @Get('/hello')
  async hello(): Promise<string> {
    return this._hello()
  }

  @Cacheable()
  protected async _hello(): Promise<string> {
    return Msg.hello
  }

}

