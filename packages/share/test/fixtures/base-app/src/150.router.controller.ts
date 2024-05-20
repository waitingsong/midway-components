/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
  Param,
} from '@midwayjs/core'

import { Context, getRouterInfo, RouterInfoLite } from '../../../../src/index.js'
import { apiBase, apiMethod } from '../../../api-test.js'


@Controller(apiBase.router)
export class ControllerRouter {

  @Get(`/${apiMethod.helloId}`)
  async hello(ctx: Context, @Param('id') id: number): Promise<RouterInfoLite> {
    assert(id)
    const info = await getRouterInfo(ctx)
    assert(info)
    return info
  }

}
