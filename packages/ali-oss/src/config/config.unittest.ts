import { DataSourceConfig } from '../index'
import { initialConfig } from '../lib/config'


export const aliOssDataSourceConfig: DataSourceConfig<'master'> = {
  dataSource: {
    master: {
      sampleThrottleMs: 100,
      accessKeyId: process.env['ALI_OSS_AID'] || '',
      accessKeySecret: process.env['ALI_OSS_ASECRET'] || '',
      endpoint: process.env['ALI_OSS_ENDPOINT'] || '',
      bucket: process.env['ALI_OSS_BUCKET'] || '',
    },
  },
  default: {
    ...initialConfig,
    sampleThrottleMs: 100,
  },
}

