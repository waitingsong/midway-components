import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Config, ConfigKey } from '../types/lib-types.js'

import { METHOD_KEY_throw_in_before } from './130.throw_in_before.helper.js'
import { FullService } from './130.throw_in_before.service.js'


@Controller(apiBase.decorator_error)
export class FullController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: FullService

  @Get(`/${apiMethod.throw_in_before}`)
  async hello(): Promise<string> {
    try {
      await this.svc.hello({ input: 1 })
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === METHOD_KEY_throw_in_before, ex.message)

      try {
        this.svc.helloSync({ input: 1 })
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === METHOD_KEY_throw_in_before, ex2.message)
        return 'OK'
      }

    }
    assert(false, 'should not run here')
  }

}

