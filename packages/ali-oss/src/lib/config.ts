import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export const initialConfig: Readonly<Config> = {
  accessKeyId: '',
  accessKeySecret: '',
  endpoint: '',
  bucket: '',
  cmd: 'ossutil',
  debug: false,
  enableTracing: false,
  sampleThrottleMs: 10000,
}

export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}


