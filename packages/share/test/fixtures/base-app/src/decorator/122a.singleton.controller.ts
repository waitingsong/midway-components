import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig, Context } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Config, ConfigKey } from '../types/lib-types.js'

import { SingletonService } from './122b.singleton.service.js'


@Controller(apiBase.decorator_singleton)
export class TraceController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: SingletonService
  @Inject() readonly ctx: Context

  @Get(`/${apiMethod.home}`)
  async home(): Promise<string> {
    await this.svc.home({ input: 1, webContext: this.ctx })
    return 'OK'
  }

  @Get(`/${apiMethod.hello}`)
  async hello(): Promise<string> {
    await this.svc.hello2({ input: 1 }, this.ctx)
    return 'OK'
  }

}

