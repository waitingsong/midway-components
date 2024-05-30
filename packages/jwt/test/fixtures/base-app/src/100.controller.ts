import assert from 'node:assert'

import {
  Controller,
  Get,
  Param,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Public } from '../../../../dist/index.js'
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from '../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../api-test.js'


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

