import {
  Config,
  ClientKey,
  ClientConfig,
  initialConfig,
} from '~/index'


const clientConfig: ClientConfig = {
  ...initialConfig,
  accessKeyId: process.env.ALI_OSS_AID || '',
  accessKeySecret: process.env.ALI_OSS_ASECRET || '',
  endpoint: process.env.ALI_OSS_ENDPOINT || '',
  bucket: process.env.ALI_OSS_BUCKET || '',
}

export const aliOssConfig: Config<ClientKey> = {
  master: clientConfig,
}

