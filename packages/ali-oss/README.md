# [@mw-components/ali-oss](https://www.npmjs.com/package/@mw-components/ali-oss)

Ali Oss ossutil client component for midway.js

[![Version](https://img.shields.io/npm/v/@mw-components/ali-oss.svg)](https://www.npmjs.com/package/@mw-components/ali-oss)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## Prepare

[ossutil 下载页面](https://help.aliyun.com/document_detail/120075.html)

```sh
sudo wget https://gosspublic.alicdn.com/ossutil/1.7.11/ossutil64 -O /usr/bin/ossutil
sudo chmod a+x /usr/bin/ossutil
```

## Installation
```sh
npm i @mw-components/ali-oss
```

## Configuration

### Enable Plugin

Edit `${app_root}/src/configuration.ts`:

```ts
import { join } from 'path'
import { ILifeCycle } from '@midwayjs/core'
import { Configuration } from '@midwayjs/decorator'
import * as aliOss from '@mw-components/ali-oss'

@Configuration({
  imports: [
    aliOss,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle { }

```

### Add Configurations

Update project `src/config/config.prod.ts`
```ts
import { Config } from '@mw-components/ali-oss'

export enum ClientKey {
  ossmain = 'ossmain',
}

const clientConfig = {
  accessKeyId: process.env.ALI_OSS_AID || '',
  accessKeySecret: process.env.ALI_OSS_ASECRET || '',
  endpoint: process.env.ALI_OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com',
  bucket: process.env.ALI_OSS_BUCKET || '',
  cmd: 'ossutil',
  debug: false,
}

export const aliOssConfig: Readonly<Config<ClientKey>> = {
  ossmain: clientConfig,
}
```

## Usage

### Inject and mkdir()

```ts
import assert from 'node:assert/strict'
import { AliOssComponent } from '@mw-components/ali-oss'
import { App, Config, Inject } from '@midwayjs/decorator'

export class RootClass {
  @Inject() readonly ossClient: AliOssComponent

  async mkdir(path: string): Promise<void> {
    const mkdirRet = await ossClient.mkdir('ossmain', path)
    assert(! mkdirRet.exitCode, 'mkdir failed')
    assert(mkdirRet.data, 'mkdir failed')
  }
}

```

### Methods

- `cp()` 在远程拷贝
- `createSymlink()` 创建软连接
- `mkdir()` 创建目录
- `mv()` 在远程移动对象
- `pathExists()` 检测远程文件是否存在
- `rm()` 删除远程对象
- `rmrf()` 删除远程对象及其下级所有对象
- `stat()` 获取远程对象属性
- `syncLocal()` （强制）同步远程对象到本地
- `syncRemote()` （强制）同步本地目录到远程
- `upload()` 上传本地文件到远程

## License
[MIT](LICENSE)

