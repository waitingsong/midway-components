import assert from 'node:assert'

import {
  CreateDataSourceInstanceOptions as CreateInstanceOptions,
  Inject,
  Singleton,
} from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'

import { AliOssComponent } from './component.js'
import { AliOssSourceManager } from './source-manager.js'
import { ConfigKey, InstanceConfig } from './types.js'


@Singleton()
export class AliOssManager<SourceName extends string = string> {

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

    this.updateProperties(inst)
    this.instCacheMap.set(dataSourceName, inst)

    return inst
  }

  protected updateProperties(inst: AliOssComponent): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! inst.traceService) {
      inst.traceService = this.traceService
    }
  }

}

