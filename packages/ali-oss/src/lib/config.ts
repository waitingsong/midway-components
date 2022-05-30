import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export enum ClientKey {
  master = 'master',
}

export const initialConfig: Readonly<Config<ClientKey>> = {
  master: {
    accessKeyId: '',
    accessKeySecret: '',
    endpoint: '',
    bucket: '',
    cmd: 'ossutil',
    debug: false,
  },
}

export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export enum ConfigKey {
  namespace = 'aliOss',
  config = 'aliOssConfig',
  aliOssInstanceKey = 'aliOssInstanceKey',
  componentName = 'aliOssComponent',
}

// export enum Msg {
//   AuthFailed = 'Authentication Failed',
// }

