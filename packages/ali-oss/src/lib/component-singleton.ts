import assert from 'node:assert/strict'

import {
  Config as _Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import { OssClient } from '@yuntools/ali-oss'

import type { Context } from '../interface'

import { ConfigKey } from './config'
import { runner, RunnerOptions } from './helper'
import {
  BaseOptions,
  Config,
  ClientConfig,
  DataBase,
  DataCp,
  DataSign,
  DataStat,
  FnKey,
  MkdirOptions,
  OssConfig,
  PathExistsOptions,
  ProcessRet,
  RmOptions,
  RmrfOptions,
  StatOptions,
  UploadOptions,
  MvOptions,
  CpOptions,
  LinkOptions,
  SignOptions,
} from './types'


/** 阿里云 OSS ossutils 命令行封装组件 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class AliOssComponent {

  @_Config(ConfigKey.config) protected readonly config: Config

  @Inject() readonly ctx: Context

  private clients: Record<keyof Config, OssClient> = {}

  @Init()
  async init(): Promise<void> {
    assert(this.config, 'config not found')
    assert(this.ctx)

    Object.entries(this.config).forEach(([id, config]) => {
      const client = this.createClient(config)
      Object.defineProperty(this.clients, id, {
        enumerable: true,
        writable: true,
        value: client,
      })
    })
  }

  createClient(options: ClientConfig): OssClient {
    const opts: OssConfig = {
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      endpoint: options.endpoint,
      stsToken: options.stsToken,
    }

    const client = new OssClient(opts, options.cmd)
    client.debug = !! options.debug
    return client
  }

  /**
   * 创建目录
   * @link https://help.aliyun.com/document_detail/120062.html
   */
  async mkdir(
    clientId: keyof Config,
    target: string,
    options?: MkdirOptions,
  ): Promise<ProcessRet> {

    const opts = this.prepareOptions<MkdirOptions>(
      clientId,
      FnKey.mkdir,
      options,
      target,
      void 0,
    )
    const ret = await runner(opts)
    return ret
  }

  /**
   * 在远程拷贝文件
   * 若 force 为空或者 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async cp(
    clientId: keyof Config,
    src: string,
    target: string,
    options?: CpOptions,
  ): Promise<ProcessRet<DataCp>> {

    const opts = this.prepareOptions<CpOptions>(
      clientId,
      FnKey.cp,
      options,
      target,
      src,
    )
    const ret = await runner<CpOptions, ProcessRet<DataCp>>(opts)
    return ret
  }

  /**
   * 上传本地文件到 OSS
   * 若 force 为空或 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async upload(
    clientId: keyof Config,
    src: string,
    target: string,
    options?: UploadOptions,
  ): Promise<ProcessRet<DataCp>> {

    const opts = this.prepareOptions<UploadOptions>(
      clientId,
      FnKey.upload,
      options,
      target,
      src,
    )
    const ret = await runner<UploadOptions, ProcessRet<DataCp>>(opts)
    return ret
  }

  /**
   * 创建软链接
   * @link https://help.aliyun.com/document_detail/120059.html
   */
  async createSymlink(
    clientId: keyof Config,
    src: string,
    target: string,
    options?: LinkOptions,
  ): Promise<ProcessRet> {

    const opts = this.prepareOptions<LinkOptions>(
      clientId,
      FnKey.link,
      options,
      target,
      src,
    )
    const ret = await runner<LinkOptions>(opts)
    return ret
  }

  /**
   * 删除云对象，不支持删除 bucket 本身
   * 如果在 recusive 为 false 时删除目录，则目录参数值必须以 '/' 结尾，否则不会删除成功
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rm(
    clientId: keyof Config,
    target: string,
    options?: RmOptions,
  ): Promise<ProcessRet> {

    const opts = this.prepareOptions<RmOptions>(
      clientId,
      FnKey.rm,
      options,
      target,
      void 0,
    )
    const ret = await runner(opts)
    return ret
  }

  /**
   * 递归删除，相当于 `rm -rf`
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rmrf(
    clientId: keyof Config,
    target: string,
    options?: RmrfOptions,
  ): Promise<ProcessRet> {

    const opts = this.prepareOptions<RmrfOptions>(
      clientId,
      FnKey.rmrf,
      options,
      target,
      void 0,
    )
    const ret = await runner(opts)
    return ret
  }

  /**
   * 查看 Bucket 和 Object 信息
   * @link https://help.aliyun.com/document_detail/120054.html
   */
  async stat(
    clientId: keyof Config,
    target: string,
    options?: StatOptions,
  ): Promise<boolean> {

    const opts = this.prepareOptions<StatOptions>(
      clientId,
      FnKey.stat,
      options,
      target,
      void 0,
    )
    const ret = await runner<StatOptions, boolean>(opts)
    return ret
  }

  /**
   * OSS 远程路径是否存在
   */
  async pathExists(
    clientId: keyof Config,
    target: string,
    options?: StatOptions,
  ): Promise<boolean> {

    const opts = this.prepareOptions<PathExistsOptions>(
      clientId,
      FnKey.pathExists,
      options,
      target,
      void 0,
    )
    const ret = await runner<PathExistsOptions, boolean>(opts)
    return ret
  }

  /**
   * 移动云端的 OSS 对象
   * 流程为先 `cp()` 然后 `rm()`
   */
  async mv(
    clientId: keyof Config,
    src: string,
    target: string,
    options?: MvOptions,
  ): Promise<ProcessRet<DataStat | DataBase>> {

    const opts = this.prepareOptions<MvOptions>(
      clientId,
      FnKey.mv,
      options,
      target,
      src,
    )
    const ret = await runner<MvOptions, ProcessRet<DataStat | DataBase>>(opts)
    return ret
  }

  /**
   * sign（生成签名URL）
   * @link https://help.aliyun.com/document_detail/120064.html
   */
  async sign(
    clientId: keyof Config,
    src: string,
    options?: SignOptions,
  ): Promise<ProcessRet<DataSign>> {

    const opts = this.prepareOptions<SignOptions>(
      clientId,
      FnKey.sign,
      options,
      void 0,
      src,
    )
    const ret = await runner<SignOptions, ProcessRet<DataSign>>(opts)
    return ret
  }



  private prepareOptions<T extends BaseOptions>(
    clientId: keyof Config,
    fnKey: FnKey,
    options: T | undefined,
    target: string | undefined,
    src: string | undefined,
  ): RunnerOptions<T> {

    const client = this.clients[clientId]
    const clientConfig = this.config[clientId]
    assert(client, `client not found for ${clientId}`)
    assert(clientConfig, `config not found for ${clientId}`)

    const ret: RunnerOptions<T> = {
      clientId,
      client,
      fnKey,
      clientConfig,
      options,
      target,
      src,
    }
    return ret
  }

}

