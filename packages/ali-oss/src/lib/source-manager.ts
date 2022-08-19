import assert from 'node:assert'

import { DataSourceManager } from '@midwayjs/core'
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
import { Logger as TLogger, TracerManager } from '@mw-components/jaeger'

import { Context } from '../interface'

import { AliOssComponent } from './component'
import { Config, ConfigKey, DataSourceConfig } from './types'


@Provide()
@Scope(ScopeEnum.Singleton)
export class AliOssSourceManager<SourceName extends string = string, Ctx extends Context = Context>
  extends DataSourceManager<AliOssComponent | undefined> {

  @_Config(ConfigKey.dataSourceConfig) private readonly dataSourceconfig: DataSourceConfig<SourceName>

  @_Logger() private readonly logger: ILogger

  @Inject() baseDir: string

  // public queryUidSpanMap = new Map<string, QuerySpanInfo>()

  declare dataSource: Map<SourceName, AliOssComponent>

  declare getDataSource: (dataSourceName: SourceName)
  => string extends SourceName ? AliOssComponent | undefined : AliOssComponent

  declare createInstance: (
    config: Config,
    clientName: SourceName,
    options?: CreateInstanceOptions,
  ) => Promise<AliOssComponent | void>

  @Init()
  async init(): Promise<void> {
    if (! this.dataSourceconfig || ! this.dataSourceconfig.dataSource) {
      this.logger.info('dataSourceConfig is not defined')
      return
    }
    // 需要注意的是，这里第二个参数需要传入一个实体类扫描地址
    await this.initDataSource(this.dataSourceconfig, this.baseDir)
  }


  /**
   * 创建单个实例
   */
  protected async createDataSource(
    config: Config,
    dataSourceName: SourceName,
    cacheDataSource = true,
  ): Promise<AliOssComponent | undefined> {

    const cacheInst = cacheDataSource ? this.getDataSource(dataSourceName) : null
    if (cacheDataSource && cacheInst) {
      return cacheInst
    }

    const inst = new AliOssComponent(config)
    if (cacheDataSource && inst) {
      if (! this.dataSourceconfig.dataSource[dataSourceName]) {
        this.dataSourceconfig.dataSource[dataSourceName] = config
      }
    }

    if (! cacheDataSource) {
      // saved in initDataSource
      this.dataSource.delete(dataSourceName)
    }
    return inst
  }


  getName(): string {
    return 'AliOssSourceManager'
  }

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


  protected getConfigByDbId(clientId: SourceName): Config | undefined {
    assert(clientId)
    const config = this.dataSourceconfig?.dataSource[clientId]
    return config
  }

  protected async tracer(clientId: SourceName, ctx?: Ctx): Promise<void> {
    if (! ctx) { return }

    const config = this.getConfigByDbId(clientId)
    assert(config, `config not found for "${clientId}"`)

    if (! config.enableTracing) { return }

    if (ctx.requestContext && ctx.requestContext.getAsync) {
      if (typeof config.sampleThrottleMs === 'undefined') {
        config.sampleThrottleMs = 10000
      }
      const logger = await ctx.requestContext.getAsync(TLogger)
      const trm = await ctx.requestContext.getAsync(TracerManager)
      void logger, trm

    }
  }

}


export interface CreateInstanceOptions {
  cacheInstance?: boolean | undefined
}

