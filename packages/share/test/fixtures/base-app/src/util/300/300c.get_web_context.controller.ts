import assert from 'node:assert'

import { Controller, Get, Inject } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'
import type { Context } from '../../types/index.js'

import { FullService } from './300s.get_web_context.service.js'


@Controller(apiBase.get_web_context)
export class FullController {

  @Inject() readonly svc: FullService
  @Inject() readonly ctx: Context

  @Get(`/${apiMethod.hello}`)
  hello(): string {
    const ctx = this.svc.hello()
    assert(ctx, 'ctx is null')
    assert(ctx === this.ctx, 'ctx not equal')
    return 'OK'
  }

}

