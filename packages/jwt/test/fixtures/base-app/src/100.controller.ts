import assert from 'node:assert'

import {
  Controller,
  Get,
  Param,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from './types/api-test.js'
import { Public } from './types/index.js'
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from './types/lib-types.js'


@Controller(apiBase.demo)
export class PublicTestController {

  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Public()
  @Get(`/${apiMethod.id}/:id`)
  async simple(@Param('id') id: number): Promise<'OK'> {
    assert(typeof id === 'number', 'id must be number')
    return 'OK'
  }

}

