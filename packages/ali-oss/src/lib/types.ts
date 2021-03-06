import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'
import * as Ali from '@yuntools/ali-oss'


export {
  BaseOptions,
  OssClient,
  ProcessRet,
  DataBase,
  DataCp,
  DataSign,
  DataStat,
  Config as OssConfig,
  FnKey,
  Msg,
} from '@yuntools/ali-oss'

export type Config<ClientId extends string = string> = Record<ClientId, ClientConfig>

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


export type MkdirOptions = Omit<Ali.MkdirOptions, 'target'>
export type CpOptions = Omit<Ali.CpOptions, 'target' | 'src'>
export type UploadOptions = Omit<Ali.UploadOptions, 'target' | 'src'>
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

