import assert from 'node:assert'
import { isProxy } from 'node:util/types'

import {
  Inject,
  Provide,
} from '@midwayjs/decorator'

import { Context } from '../interface'

import { AliOssComponent } from './component'
import { AliOssSourceManager } from './source-manager'
import { Config, ConfigKey, CreateInstanceOptions } from './types'


@Provide()
export class AliOssManager<SourceName extends string = string, Ctx extends Context = Context> {

  @Inject() readonly ctx: Ctx

  @Inject() protected readonly sourceManager: AliOssSourceManager<SourceName>

  getName(): string { return ConfigKey.managerName }

  instCacheMap: Map<SourceName, AliOssComponent> = new Map()


  async createInstance(
    config: Config,
    clientName: SourceName,
    options?: CreateInstanceOptions,
  ): Promise<AliOssComponent | void> {

    await this.sourceManager.createInstance(config, clientName, options)
    return this.getDataSource(clientName)
  }

  /**
   * Check the data source is connected
   */
  async isConnected(dataSourceName: SourceName): Promise<boolean> {
    return this.sourceManager.isConnected(dataSourceName)
  }


  getDataSource(dataSourceName: SourceName): AliOssComponent {
    const cacheInst = this.instCacheMap.get(dataSourceName)
    if (cacheInst) {
      return cacheInst
    }

    const inst = this.sourceManager.getDataSource(dataSourceName)
    assert(inst)

    const reqCtx = this.ctx as Ctx | undefined
    if (! reqCtx) {
      return inst
    }

    const db2 = this.createCtxProxy(inst, reqCtx)
    this.instCacheMap.set(dataSourceName, db2)

    return db2
  }

  protected createCtxProxy(inst: AliOssComponent, reqCtx: Ctx): AliOssComponent {
    assert(reqCtx)
    if (isProxy(inst)) {
      return inst
    }

    const ret = new Proxy(inst, {
      get: (target: AliOssComponent, propKey: keyof AliOssComponent) => propKey === 'ctx'
        ? reqCtx
        : target[propKey],
    })
    return ret
  }

}

