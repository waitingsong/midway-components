/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'assert'

import {
  DataSourceManager,
  CreateDataSourceInstanceOptions as CreateInstanceOptions,
  Init,
  Inject,
  Logger as _Logger,
  Singleton,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { AliOssComponent } from './component.js'
import { InstanceConfig, ConfigKey, Config } from './types.js'


@Singleton()
export class AliOssSourceManager<SourceName extends string = string>
  extends DataSourceManager<AliOssComponent | undefined> {

  @MConfig(ConfigKey.config) private readonly sourceConfig: Config<SourceName>

  @Inject() baseDir: string

  // public queryUidSpanMap = new Map<string, QuerySpanInfo>()

  declare dataSource: Map<SourceName, AliOssComponent>

  declare getDataSource: (dataSourceName: SourceName)
  => string extends SourceName ? AliOssComponent | undefined : AliOssComponent

  declare createInstance: (
    config: InstanceConfig,
    clientName: SourceName,
    options?: CreateInstanceOptions,
  ) => Promise<AliOssComponent | undefined>

  @Init()
  async init(): Promise<void> {
    assert(this.sourceConfig?.dataSource, 'dataSourceConfig is not defined')
    // 需要注意的是，这里第二个参数需要传入一个实体类扫描地址
    await this.initDataSource(this.sourceConfig, this.baseDir)
  }


  /**
   * 创建单个实例
   */
  protected async createDataSource(
    config: InstanceConfig,
    dataSourceName: SourceName,
    cacheDataSource = true,
  ): Promise<AliOssComponent | undefined> {

    const cacheInst = cacheDataSource ? this.getDataSource(dataSourceName) : null
    if (cacheDataSource && cacheInst) {
      return cacheInst
    }

    const inst = new AliOssComponent(config)
    if (cacheDataSource && inst) {
      if (! this.sourceConfig.dataSource[dataSourceName]) {
        this.sourceConfig.dataSource[dataSourceName] = config
      }
    }

    if (! cacheDataSource) {
      // saved in initDataSource
      this.dataSource.delete(dataSourceName)
    }
    return inst
  }

  getName(): string { return ConfigKey.sourceManagerName }

  protected async checkConnected(dataSource: AliOssComponent): Promise<boolean> {
    if (! dataSource) {
      return false
    }
    // @TODO check connection
    return true
  }

  async destroyDataSource(): Promise<void> {
    return
  }


  // protected getConfigByDbId(clientId: SourceName): InstanceConfig | undefined {
  //   assert(clientId)
  //   const config = this.sourceConfig.dataSource[clientId]
  //   return config
  // }

}


