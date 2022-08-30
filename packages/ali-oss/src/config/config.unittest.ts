import { ClientKey, AliOssSourceConfig } from '../index'
import { initialConfig } from '../lib/config'


export const aliOssConfig: AliOssSourceConfig<ClientKey.unitTest> = {
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
  },
}

