import assert from 'node:assert'

import { Controller, Get, Inject } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { FullService } from './208.throw_in_after_throw.service.js'


@Controller(apiBase.decorator_error)
export class FullController {

  @Inject() readonly svc: FullService

  @Get(`/${apiMethod.throw_in_after_throw}`)
  async hello(): Promise<string> {
    const res = await this.svc.hello({ input: 1 })
    assert(res === 1, 'res should 1')

    const res2 = this.svc.helloSync({ input: 1 })
    assert(res2 === 1, 'res2 should 1')
    return 'OK'
  }

}

