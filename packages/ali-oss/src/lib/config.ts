import type { InstanceConfig, MiddlewareConfig, MiddlewareOptions } from './types.js'


export const initialConfig: Readonly<InstanceConfig> = {
  accessKeyId: '',
  accessKeySecret: '',
  endpoint: '',
  bucket: '',
  cmd: 'ossutil',
  debug: false,
  enableTrace: false,
  sampleThrottleMs: 10000,
}

export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

