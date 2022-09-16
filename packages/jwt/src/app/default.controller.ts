import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'

import { Config, ConfigKey, Msg } from '../lib/types'


@Controller(`/_${ConfigKey.namespace}`)
export class DefaultJwtComponentController {

  @_Config(ConfigKey.config) readonly config: Config

  @Get('/hello')
  hello(): string {
    this.valiateRoute()
    return Msg.hello
  }

  valiateRoute(): void {
    if (! this.config.enableDefaultRoute) {
      throw new Error('route is not enabled')
    }
  }

}

