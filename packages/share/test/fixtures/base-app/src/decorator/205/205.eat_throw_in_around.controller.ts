import assert from 'node:assert'

import { Controller, Get, Inject } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { FullService } from './205.eat_throw_in_around.service.js'


@Controller(apiBase.decorator_error)
export class FullController {

  @Inject() readonly svc: FullService

  @Get(`/${apiMethod.eat_throw_in_around}`)
  async hello(): Promise<string> {
    const res = await this.svc.hello({ input: 1 })
    assert(typeof res === 'undefined', 'res should undefined, as error thrown in around() and return none')

    const res2 = this.svc.helloSync({ input: 1 })
    assert(typeof res2 === 'undefined', 'res2 should undefined, as error thrown in around() and return none')
    return 'OK'
  }

}

