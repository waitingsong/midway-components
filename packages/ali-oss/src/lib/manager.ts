import assert from 'node:assert'
import { isProxy } from 'node:util/types'

import {
  CreateDataSourceInstanceOptions as CreateInstanceOptions,
  Inject,
  Provide,
} from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'
import type { Context } from '@mwcp/share'

import { AliOssComponent } from './component.js'
import { AliOssSourceManager } from './source-manager.js'
import { InstanceConfig, ConfigKey } from './types.js'


@Provide()
export class AliOssManager<SourceName extends string = string, Ctx extends Context = Context> {

  @Inject() readonly ctx: Ctx

  @Inject() readonly traceService: TraceService

  @Inject() protected readonly sourceManager: AliOssSourceManager<SourceName>

  getName(): string { return ConfigKey.managerName }

  instCacheMap = new Map<SourceName, AliOssComponent>()


  async createInstance(
    config: InstanceConfig,
    clientName: SourceName,
    options?: CreateInstanceOptions,
  ): Promise<AliOssComponent | undefined> {

    const opts: CreateInstanceOptions = {
      validateConnection: true,
      ...options,
    }
    await this.sourceManager.createInstance(config, clientName, opts)
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

    const db2 = this.createPropertyProxy(inst)
    this.instCacheMap.set(dataSourceName, db2)

    return db2
  }

  protected createPropertyProxy(inst: AliOssComponent): AliOssComponent {
    assert(this.ctx)
    if (isProxy(inst)) {
      return inst
    }

    const ret = new Proxy(inst, {
      get: (target: AliOssComponent, propKey: keyof AliOssComponent) => {
        switch (propKey) {
          case 'ctx':
            return this.ctx

          case 'traceService':
            return this.traceService

          default:
            return target[propKey]
        }
      },
    })
    return ret
  }

}

