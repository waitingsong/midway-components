import {
  SpanLogInput,
  Logger as TLogger,
  TracerManager,
  TracerLog,
  TracerTag,
} from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'
import { OssClient, CpOptions as AliCpOptions } from '@yuntools/ali-oss'
import { Tags } from 'opentracing'

import type { Context } from '../interface'

import {
  BaseOptions,
  Config,
  ConfigKey,
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
  SyncLocalOptions,
  SyncRemoteOptions,
  QuerySpanInfo,
} from './types'


/** 阿里云 OSS ossutils 命令行封装组件 */
export class AliOssComponent {

  ctx: Context | undefined

  private client: OssClient
  private querySpanMap: WeakMap<object, QuerySpanInfo> = new WeakMap()

  constructor(protected readonly config: Config) {
    const opts: OssConfig = {
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      endpoint: config.endpoint,
    }
    if (config.stsToken) {
      opts.stsToken = config.stsToken
    }

    const client = new OssClient(opts, config.cmd)
    client.debug = !! config.debug
    this.client = client
  }

  /**
   * 拷贝文件，
   * 拷贝本地目录文件到远程建议使用 `upload()` 或者 `syncRemote()` 方法
   *
   * 若 force 为空或者 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async cp(
    /** 本地文件、目录或者远程 OSS 对象 */
    src: string,
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: CpOptions,
  ): Promise<ProcessRet<DataCp>> {

    const opts: RunnerOptions<CpOptions> = {
      fnKey: FnKey.cp,
      options,
      target,
      src,
    }
    const ret = await this.runner<CpOptions, ProcessRet<DataCp>>(opts)
    return ret
  }

  /**
   * 上传本地文件到 OSS
   * 若 force 为空或 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/120057.html
   */
  async upload(
    /** 本地目录或文件 */
    src: string,
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: UploadOptions,
  ): Promise<ProcessRet<DataCp>> {

    const opts: RunnerOptions<UploadOptions> = {
      fnKey: FnKey.upload,
      options,
      target,
      src,
    }
    const ret = await this.runner<UploadOptions, ProcessRet<DataCp>>(opts)
    return ret
  }

  /**
   * 创建软链接
   * @link https://help.aliyun.com/document_detail/120059.html
   */
  async createSymlink(
    /** OSS 对象，不包括 bucket */
    src: string,
    /** OSS 软连接对象，不包括 bucket */
    target: string,
    options?: LinkOptions,
  ): Promise<ProcessRet> {

    const opts: RunnerOptions<LinkOptions> = {
      fnKey: FnKey.link,
      options,
      target,
      src,
    }
    const ret = await this.runner<LinkOptions>(opts)
    return ret
  }

  /**
   * 创建目录
   * @link https://help.aliyun.com/document_detail/120062.html
   */
  async mkdir(
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: MkdirOptions,
  ): Promise<ProcessRet> {

    const opts: RunnerOptions<MkdirOptions> = {
      fnKey: FnKey.mkdir,
      options,
      target,
      src: void 0,
    }
    const ret = await this.runner(opts)
    return ret
  }

  /**
   * 移动云端的 OSS 对象
   * 流程为先 `cp()` 然后 `rm()`
   */
  async mv(
    /** OSS 源对象，不包括 bucket */
    src: string,
    /** OSS 目的对象，不包括 bucket */
    target: string,
    options?: MvOptions,
  ): Promise<ProcessRet<DataStat | DataBase>> {

    const opts: RunnerOptions<MvOptions> = {
      fnKey: FnKey.mv,
      options,
      target,
      src,
    }
    const ret = await this.runner<MvOptions, ProcessRet<DataStat | DataBase>>(opts)
    return ret
  }

  /**
   * OSS 远程路径是否存在
   */
  async pathExists(
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: StatOptions,
  ): Promise<boolean> {

    const opts: RunnerOptions<PathExistsOptions> = {
      fnKey: FnKey.pathExists,
      options,
      target,
      src: void 0,
    }
    const ret = await this.runner<PathExistsOptions, boolean>(opts)
    return ret
  }


  /**
   * 删除云对象，不支持删除 bucket 本身
   * 如果在 recusive 为 false 时删除目录，则目录参数值必须以 '/' 结尾，否则不会删除成功
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rm(
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: RmOptions,
  ): Promise<ProcessRet> {

    const opts: RunnerOptions<RmOptions> = {
      fnKey: FnKey.rm,
      options,
      target,
      src: void 0,
    }
    const ret = await this.runner(opts)
    return ret
  }

  /**
   * 递归删除，相当于 `rm -rf`
   * @link https://help.aliyun.com/document_detail/120053.html
   */
  async rmrf(
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: RmrfOptions,
  ): Promise<ProcessRet> {

    const opts: RunnerOptions<RmrfOptions> = {
      fnKey: FnKey.rmrf,
      options,
      target,
      src: void 0,
    }
    const ret = await this.runner(opts)
    return ret
  }

  /**
   * sign（生成签名URL）
   * @link https://help.aliyun.com/document_detail/120064.html
   */
  async sign(
    /** OSS 对象，不包括 bucket */
    src: string,
    options?: SignOptions,
  ): Promise<ProcessRet<DataSign>> {

    const opts: RunnerOptions<SignOptions> = {
      fnKey: FnKey.sign,
      options,
      target: void 0,
      src,
    }
    const ret = await this.runner<SignOptions, ProcessRet<DataSign>>(opts)
    return ret
  }

  /**
   * 查看 Bucket 和 Object 信息
   * @link https://help.aliyun.com/document_detail/120054.html
   */
  async stat(
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: StatOptions,
  ): Promise<ProcessRet> {

    const opts: RunnerOptions<StatOptions> = {
      fnKey: FnKey.stat,
      options,
      target,
      src: void 0,
    }
    const ret = await this.runner<StatOptions, ProcessRet>(opts)
    return ret
  }

  /**
   * 同步 OSS 文件到本地
   * - force 参数默认 true
   * - 若 force 为 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/256352.html
   */
  async syncLocal(
    /** OSS 对象，不包括 bucket */
    src: string,
    /** 本地目录 */
    target: string,
    options?: SyncLocalOptions,
  ): Promise<ProcessRet<DataCp>> {

    const opts: RunnerOptions<SyncLocalOptions> = {
      fnKey: FnKey.syncLocal,
      options,
      target,
      src,
    }
    const ret = await this.runner<SyncLocalOptions, ProcessRet<DataCp>>(opts)
    return ret
  }

  /**
   * 同步本地文件到 OSS
   * - force 参数默认 true
   * - 若 force 为 false，且目标文件存在时会卡在命令行提示输入阶段（无显示）最后导致超时异常
   * @link https://help.aliyun.com/document_detail/193394.html
   */
  async syncRemote(
    /** 本地目录 */
    src: string,
    /** OSS 对象，不包括 bucket */
    target: string,
    options?: SyncRemoteOptions,
  ): Promise<ProcessRet<DataCp>> {

    const opts: RunnerOptions<SyncRemoteOptions> = {
      fnKey: FnKey.syncRemote,
      options,
      target,
      src,
    }
    const ret = await this.runner<SyncRemoteOptions, ProcessRet<DataCp>>(opts)
    return ret
  }



  protected async runner<
    T extends BaseOptions,
    R extends ProcessRet<DataBase> | boolean = ProcessRet<DataBase>
  >(options: RunnerOptions<T>): Promise<R> {

    const { fnKey } = options
    const opts = this.genOptions<T>(options)

    const id = { time: Symbol(Date.now()) }
    try {
      await this.tracer('start', id, opts)
      // @ts-ignore
      const ret = await this.client[fnKey](opts) as Promise<R>
      await this.tracer('finish', id, opts)
      return ret
    }
    catch (ex) {
      await this.tracer('error', id, opts, ex)
      throw ex
    }
  }


  protected genOptions<T>(input: RunnerOptions<T>): _RunnerOption<T> {
    const ret = {
      ...this.config,
      src: input.src,
      target: input.target,
      ...input.options,
    }
    return ret as unknown as _RunnerOption<T>
  }

  protected async tracer<T extends BaseOptions>(
    type: 'start' | 'finish' | 'error',
    id: { time: symbol },
    options: _RunnerOption<T>,
    err?: unknown,
  ): Promise<void> {

    if (! options.enableTracing) { return }
    if (! this.ctx) { return }

    const end = Date.now()

    const logger = await this.ctx.requestContext.getAsync(TLogger)
    const trm = await this.ctx.requestContext.getAsync(TracerManager)
    if (! logger || ! trm) { return }

    const tmp = options as unknown as AliCpOptions & Config
    const opts = {
      acl: tmp.acl ?? '',
      src: tmp.src,
      payer: tmp.payer ?? '',
      recursive: tmp.recursive ?? false,
      sampleThrottleMs: tmp.sampleThrottleMs ?? 10000,
      target: tmp.target,
    }

    switch (type) {
      case 'start': {
        const currSpan = trm.currentSpan()
        if (! currSpan) {
          logger.warn('Get current SPAN undefined.')
          console.warn('Get current SPAN undefined.')
          return
        }
        const span = trm.genSpan(ConfigKey.componentName, currSpan)
        const spanInfo: QuerySpanInfo = {
          span,
          timestamp: Date.now(),
        }
        this.querySpanMap.set(id, spanInfo)

        span.addTags({
          [TracerLog.queryCostThottleInMS]: opts.sampleThrottleMs,
          qid: id.time.toString(),
          acl: opts.acl,
          payer: opts.payer,
          recursive: opts.recursive,
          src: opts.src,
          target: opts.target,
        })

        const input: SpanLogInput = {
          event: TracerLog.queryStart,
          time: genISO8601String(),
        }
        span.log(input)
        trm.spanLog(input)
        break
      }

      case 'finish': {
        const spanInfo = this.querySpanMap.get(id)
        if (! spanInfo) {
          console.warn('Retrieve spanInfo undefined.', opts)
          return
        }
        const { span } = spanInfo

        const start = spanInfo.timestamp
        const cost = end - start
        const tags: SpanLogInput = {
          [TracerLog.queryCost]: cost,
        }
        span.addTags(tags)

        const input: SpanLogInput = {
          event: TracerLog.queryFinish,
          time: genISO8601String(),
          [TracerLog.queryCost]: cost,
        }

        if (typeof opts.sampleThrottleMs === 'number'
          && opts.sampleThrottleMs > 0 && cost > opts.sampleThrottleMs) {

          const tags2: SpanLogInput = {
            [Tags.SAMPLING_PRIORITY]: 50,
            [TracerTag.logLevel]: 'warn',
          }
          span.addTags(tags2)
          input['level'] = 'warn'
          logger.log && logger.log(input, span)
        }
        else {
          span.log(input)
        }

        trm.spanLog(input)
        span.finish()
        break
      }

      case 'error': {
        const spanInfo = this.querySpanMap.get(id)
        if (! spanInfo) {
          console.warn('Retrieve spanInfo undefined.', opts)
          return
        }
        const { span } = spanInfo

        const start = spanInfo.timestamp
        const cost = end - start
        const tags: SpanLogInput = {
          [TracerLog.queryCost]: cost,
        }
        span.addTags(tags)

        const input = {
          event: TracerLog.queryError,
          level: 'error',
          time: genISO8601String(),
          [TracerLog.queryCost]: cost,
          [TracerLog.error]: err,
        }

        logger.log && logger.log(input, span)
        trm.spanLog(input)

        span.addTags({
          [Tags.ERROR]: true,
          [Tags.SAMPLING_PRIORITY]: 100,
          [TracerTag.logLevel]: 'error',
          [TracerLog.error]: err,
        })
        span.finish()
        break
      }
    }

    return
  }
}


interface RunnerOptions<T extends BaseOptions> {
  fnKey: FnKey
  options: T | undefined
  src: string | undefined
  target: string | undefined
}

type _RunnerOption<T extends BaseOptions> = Config & T
