import type { Span } from '@mwcp/otel'
import type { BaseConfig } from '@mwcp/share'
import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'
import * as Ali from '@yuntools/ali-oss'
import { Msg as _Msg } from '@yuntools/ali-oss'


export enum ConfigKey {
  namespace = 'aliOss',
  config = 'aliOssConfig',
  aliOssInstanceKey = 'aliOssInstanceKey',
  componentName = 'aliOssComponent',
  managerName = 'aliOssManager',
  sourceManagerName = 'aliOssSourceManager',
}

export const Msg = { ..._Msg, hello: 'hello aliOss' } as const

export enum ClientKey {
  master = 'ossMaster',
  unitTest = 'ossUnitTest'
}


export interface ClientConfig {
  accessKeyId: string
  accessKeySecret: string
  endpoint: string
  stsToken?: string
  cmd?: string
  debug?: boolean
  bucket: string
}

export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>


/** midway DataSource */
export interface Config<SourceName extends string = string> extends BaseConfig {
  dataSource: DataSource<SourceName>
  default?: InstanceConfig
}
export type DataSource<SourceName extends string = string> = Record<SourceName, InstanceConfig>
export interface InstanceConfig extends ClientConfig {
  /**
   * Enable tracing via @mwcp/otel
   * @default false
   */
  enableTrace?: boolean
  /**
   * 强制采样请求处理时间（毫秒）阈值
   * 负数不采样
   * @default 10_000
   */
  sampleThrottleMs?: number
}


export type MkdirOptions = Omit<Ali.MkdirOptions, 'target'>
export type CpOptions = Omit<Ali.CpOptions, 'target' | 'src'>
export type UploadOptions = Omit<Ali.UploadOptions, 'target' | 'src'>
export type DownloadOptions = Omit<Ali.DownloadOptions, 'target' | 'src'>
export type LinkOptions = Omit<Ali.LinkOptions, 'target' | 'src'>
export type RmOptions = Omit<Ali.RmOptions, 'target'>
export type RmrfOptions = Omit<Ali.RmrfOptions, 'target'>
export type StatOptions = Omit<Ali.StatOptions, 'target'>
export type PathExistsOptions = Omit<Ali.PathExistsOptions, 'target'>
export type MvOptions = Omit<Ali.MvOptions, 'target' | 'src'>
export type SignOptions = Omit<Ali.SignOptions, 'src'>
export type SyncOptions = Omit<Ali.SyncOptions, 'target' | 'src'>
export type SyncLocalOptions = Omit<Ali.SyncLocalOptions, 'target' | 'src'>
export type SyncRemoteOptions = Omit<Ali.SyncRemoteOptions, 'target' | 'src'>

export interface QuerySpanInfo {
  span: Span
  timestamp: number
}

