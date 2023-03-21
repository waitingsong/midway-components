
export {
  Application,
  AppConfig,
  AppInfomation,
  Context,
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
} from '@mwcp/share'


export { FetchOptions } from '@mwcp/fetch'

export {
  Attributes,
  AttrNames,
  HeadersKey,
  Trace,
  TraceLogger,
  TraceService,
} from '@mwcp/otel'

export { JwtResult } from '@mwcp/jwt'

export {
  Cacheable,
  CacheEvict,
  CachePut,
  CacheConfig,
  CacheConfigKey,
  CacheManager,
  CacheableArgs,
  CacheEvictArgs,
  DataWithCacheMeta,
  KeyGenerator,
} from '@mwcp/cache'

export {
  FormData,
  Headers,
  Response,
  ResponseData,
  RequestInfo,
  RequestInit,
} from '@mwcp/fetch'

export {
  JsonObject,
  JsonResp,
  JsonType,
  NpmPkg,
} from '@waiting/shared-types'

export {
  KmorePropagationConfig,
  KmoreTransaction as DbTransaction,
  PageRawType,
  PageWrapType,
  PagingMeta,
  PagingOptions,
  PropagationType,
  Transactional,
} from '@mwcp/kmore'

export enum ConfigKey {
  namespace = 'base',
  config = 'baseConfig',
  middlewareConfig = 'demoMiddlewareConfig',
  componentName = 'baseComponent',
  middlewareName = 'baseMiddleware'
}

export enum Msg {
  hello = 'hello midway.js',
}


export enum ErrorCode {
  success = 0,
  E_Common = 1,
  /** 身份校验失败 */
  E_Unauthorized = 401,
  /** 资源未找到 */
  E_Not_Found = 404,
  /**
   * 服务内部异常
   * @description 在向外屏蔽内部服务异常时可使用。注意：返回结果将自动屏蔽任何异常详情
   */
  E_Internal_Server = 500,
  /**
   * 服务内部异常
   * @description Knex 连接数据库超时
   */
  E_Db_Acq_Connection_Timeout = 999,
  /**
   * 管理员不存在
   */
  E_Admin_Not_Exists = 2404,
}

