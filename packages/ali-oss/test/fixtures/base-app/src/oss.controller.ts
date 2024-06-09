import assert from 'node:assert'

import {
  Controller,
  Get,
  Init,
  Inject,
  Post,
  Query,
} from '@midwayjs/core'
import { Context } from '@mwcp/share'

import { apiBase, apiMethod } from './types/api-test.js'
import {
  AliOssComponent,
  AliOssManager,
} from './types/index.js'
import { ClientKey } from './types/lib-types.js'


@Controller(apiBase.oss)
export class OssController {

  @Inject() readonly aliOssManager: AliOssManager<ClientKey>
  @Inject() readonly ctx: Context

  ossClient: AliOssComponent

  @Init()
  async init(): Promise<void> {
    this.ossClient = this.aliOssManager.getDataSource(ClientKey.unitTest)
    void this.aliOssManager.getDataSource(ClientKey.unitTest) // cov cache
    assert(await this.aliOssManager.isConnected(ClientKey.unitTest))
  }

  @Get(`/${apiMethod.stat}`)
  @Get(apiMethod.root)
  async stat(@Query('target') target: string): Promise<ReturnType<AliOssComponent['stat']>> {
    const res = await this.ossClient.stat(target)
    return res
  }

  @Post(`/${apiMethod.mkdir}`)
  async mkdir(@Query() parm: {
    target: Parameters<AliOssComponent['mkdir']>[0],
    opts: Parameters<AliOssComponent['mkdir']>[1],
  }): Promise<ReturnType<AliOssComponent['mkdir']>> {

    assert(this.ossClient.ctx === this.ctx)
    const { target, opts } = parm
    assert(target)
    const res = await this.ossClient.mkdir(target, opts)
    return res
  }

}

