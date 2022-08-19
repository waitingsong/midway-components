import assert from 'node:assert'

import {
  Inject,
  Provide,
} from '@midwayjs/decorator'

import { Context } from '../interface'

import { AliOssComponent } from './component'
import { AliOssSourceManager } from './source-manager'


@Provide()
export class AliOssManager<SourceName extends string = string, Ctx extends Context = Context> {

  @Inject() readonly ctx: Ctx

  @Inject() dbSourceManager: AliOssSourceManager<SourceName, Ctx>

  getName(): string { return 'dbManager' }

  instCacheMap: Map<SourceName, AliOssComponent> = new Map()

  /**
   * Check the data source is connected
   */
  async isConnected(dataSourceName: SourceName): Promise<boolean> {
    return this.dbSourceManager.isConnected(dataSourceName)
  }


  getDataSource(dataSourceName: SourceName): AliOssComponent {
    const cacheInst = this.instCacheMap.get(dataSourceName)
    if (cacheInst) {
      return cacheInst
    }

    const inst = this.dbSourceManager.getDataSource(dataSourceName)
    assert(inst)

    const reqCtx: Ctx | undefined = this.ctx
    if (! reqCtx) {
      return inst
    }

    const db2 = this.createCtxProxy(inst, reqCtx)
    if (db2) {
      this.instCacheMap.set(dataSourceName, db2)
    }
    return db2
  }

  protected createCtxProxy(inst: AliOssComponent, reqCtx: Ctx): AliOssComponent {
    assert(reqCtx)

    const ret = new Proxy(inst, {
      get: (target: AliOssComponent, propKey: keyof AliOssComponent) => propKey === 'ctx'
        ? reqCtx
        : target[propKey],
    })
    return ret
  }

}

