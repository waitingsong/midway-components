import assert from 'node:assert'

import { Controller, Get, Inject } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { KEY_throw_in_gen_executor_param } from './206.throw_in_gen_executor_param.helper.js'
import { FullService } from './206.throw_in_gen_executor_param.service.js'


@Controller(apiBase.decorator_error)
export class FullController {

  @Inject() readonly svc: FullService

  @Get(`/${apiMethod.throw_in_gen_executor_param}`)
  async hello(): Promise<string> {
    try {
      await this.svc.hello({ input: 1 })
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === KEY_throw_in_gen_executor_param, ex.message)

      try {
        this.svc.helloSync({ input: 1 })
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === KEY_throw_in_gen_executor_param, ex2.message)
        return 'OK'
      }

    }
    assert(false, 'should not run here')
  }

}

