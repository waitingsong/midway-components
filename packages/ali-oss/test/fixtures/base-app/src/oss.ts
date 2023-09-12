import assert from 'node:assert'

import {
  Config as _Config,
  Controller,
  Get,
  Init,
  Inject,
  Post,
  Query,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'

import {
  AliOssComponent,
  AliOssManager,
} from '../../../../dist/lib/index.js'
import { ClientKey } from '../../../../dist/lib/types.js'


@Controller('/oss')
export class OssController {

  @Inject() readonly aliOssManager: AliOssManager<ClientKey>
  @Inject() readonly ctx: Context

  ossClient: AliOssComponent

  @Init()
  async init(): Promise<void> {
    this.ossClient = this.aliOssManager.getDataSource(ClientKey.unitTest)
  }

  @Get('/stat')
  async stat(@Query('target') target: string): Promise<ReturnType<AliOssComponent['stat']>> {
    const res = await this.ossClient.stat(target)
    return res
  }

  @Post('/mkdir')
  async mkdir(
    @Query() parm: {
      target: Parameters<AliOssComponent['mkdir']>[0],
      opts: Parameters<AliOssComponent['mkdir']>[1],
    },
  ): Promise<ReturnType<AliOssComponent['mkdir']>> {

    assert(this.ossClient.ctx === this.ctx)
    const { target, opts } = parm
    assert(target)
    const res = await this.ossClient.mkdir(target, opts)
    return res
  }

}

