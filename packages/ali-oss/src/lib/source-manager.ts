/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert'

import {
  DataSourceManager,
  CreateDataSourceInstanceOptions as CreateInstanceOptions,
} from '@midwayjs/core'
import {
  Config as _Config,
  Init,
  Inject,
  Logger as _Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import { ILogger } from '@midwayjs/logger'

import { AliOssComponent } from './component'
import { InstanceConfig, ConfigKey, Config } from './types'


@Provide()
@Scope(ScopeEnum.Singleton)
export class AliOssSourceManager<SourceName extends string = string>
  extends DataSourceManager<AliOssComponent | undefined> {

  @_Config(ConfigKey.config) private readonly sourceConfig: Config<SourceName>

  @_Logger() private readonly logger: ILogger

  @Inject() baseDir: string

  // public queryUidSpanMap = new Map<string, QuerySpanInfo>()

  declare dataSource: Map<SourceName, AliOssComponent>

  declare getDataSource: (dataSourceName: SourceName)
  => string extends SourceName ? AliOssComponent | undefined : AliOssComponent

  declare createInstance: (
    config: InstanceConfig,
    clientName: SourceName,
    options?: CreateInstanceOptions,
  ) => Promise<AliOssComponent | void>

  @Init()
  async init(): Promise<void> {
    if (! this.sourceConfig || ! this.sourceConfig.dataSource) {
      this.logger.info('dataSourceConfig is not defined')
      return
    }
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

    try {
      return true
    }
    catch (ex) {
      this.logger.error('[KmoreDbSourceManager]: checkConnected()', ex)
    }
    return false
  }

  async destroyDataSource(): Promise<void> {
    return
  }


  protected getConfigByDbId(clientId: SourceName): InstanceConfig | undefined {
    assert(clientId)
    const config = this.sourceConfig.dataSource[clientId]
    return config
  }

}


