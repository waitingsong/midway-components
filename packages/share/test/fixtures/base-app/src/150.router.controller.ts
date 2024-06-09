/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { Controller, Get, Param } from '@midwayjs/core'

import { apiBase, apiMethod } from './types/api-test.js'
import { Context, getRouterInfo, RouterInfoLite } from './types/index.js'


@Controller(apiBase.router)
export class ControllerRouter {

  @Get(`/${apiMethod.helloId}`)
  async hello(ctx: Context, @Param('id') id: number): Promise<RouterInfoLite> {
    assert(id)
    const info = await getRouterInfo(ctx, true, 1)
    assert(info)
    await getRouterInfo(ctx, true, 1)

    assert.deepStrictEqual(info, ctx._routerInfo)

    return info
  }

}
