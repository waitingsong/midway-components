import { initialConfig } from '../lib/config.js'
import type { Config, ClientKey } from '../lib/types.js'


export const keys = Date.now().toString()

export const aliOssConfig: Readonly<Config<ClientKey.unitTest>> = {
  enableDefaultRoute: true,
  dataSource: {
    ossUnitTest: {
      sampleThrottleMs: 100,
      accessKeyId: process.env['ALI_OSS_AID'] ?? '',
      accessKeySecret: process.env['ALI_OSS_ASECRET'] ?? '',
      endpoint: process.env['ALI_OSS_ENDPOINT'] ?? '',
      bucket: process.env['ALI_OSS_BUCKET'] ?? '',
    },
  },
  default: {
    ...initialConfig,
    sampleThrottleMs: 100,
    enableTrace: true,
  },
}

