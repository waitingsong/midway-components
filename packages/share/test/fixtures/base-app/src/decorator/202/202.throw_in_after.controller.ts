import assert from 'node:assert'

import { Controller, Get, Inject } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { KEY_throw_in_after } from './202.throw_in_after.helper.js'
import { FullService } from './202.throw_in_after.service.js'


@Controller(apiBase.decorator_error)
export class FullController {

  @Inject() readonly svc: FullService

  @Get(`/${apiMethod.throw_in_after}`)
  async hello(): Promise<string> {
    try {
      await this.svc.hello({ input: 1 })
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === KEY_throw_in_after, ex.message)

      try {
        this.svc.helloSync({ input: 1 })
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === KEY_throw_in_after, ex2.message)
        return 'OK'
      }

    }
    assert(false, 'should not run here')
  }

}

