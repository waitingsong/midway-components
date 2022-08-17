/* eslint-disable import/max-dependencies */
/* eslint-disable import/no-extraneous-dependencies */
import 'tsconfig-paths/register'
import assert from 'node:assert/strict'
import { join } from 'node:path'

import { ILifeCycle, MidwayInformationService } from '@midwayjs/core'
import {
  App,
  Configuration,
  Inject,
  Logger,
} from '@midwayjs/decorator'
import * as koa from '@midwayjs/koa'
import { IMidwayLogger } from '@midwayjs/logger'
import * as prometheus from '@midwayjs/prometheus'
import * as validate from '@midwayjs/validate'
import * as aliOss from '@mw-components/ali-oss'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as jwt from '@mw-components/jwt'
import * as db from '@mw-components/kmore'
import * as koid from '@mw-components/koid'
import type {
  Application,
  NpmPkg,
} from '@mw-components/share'

import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware'
import { RequestIdMiddleware } from './middleware/request-id.middleware'
import { ResponseHeadersMiddleware } from './middleware/response-headers.middleware'
import { ResponseMimeMiddleware } from './middleware/response-mime.middleware'
// import { customLogger } from './util/custom-logger'


process.env['UV_THREADPOOL_SIZE'] = '96'

@Configuration({
  imports: [
    koa,
    validate,
    jaeger,
    prometheus,
    jwt,
    koid,
    fetch,
    db,
    aliOss,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Logger() readonly logger: IMidwayLogger

  @Inject() readonly informationService: MidwayInformationService

  // 启动前处理
  async onReady(): Promise<void> {

    // 定制化日志
    // customLogger(this.logger, this.app)

    // 全局x-request-id处理中间件
    // @ts-ignore
    this.app.getMiddleware().insertFirst(RequestIdMiddleware)

    // 全局错误处理中间件（确保在最前）
    // @ts-ignore
    this.app.getMiddleware().insertFirst(ErrorHandlerMiddleware)

    const mws = [
      ResponseMimeMiddleware,
      ResponseHeadersMiddleware,
    ]
    // @ts-ignore
    this.app.useMiddleware(mws)
    const pkg = this.informationService.getPkg() as NpmPkg | undefined
    if (pkg && Object.keys(pkg).length) {
      assert(pkg, 'retrieve package.json failed')
      this.app.addConfigObject({ pkg })
    }
  }


  async onServerReady(): Promise<void> {
    const pkg = this.informationService.getPkg() as NpmPkg | undefined
    const info = {
      pkgName: pkg?.name,
      pkgVersion: pkg?.version,
    }

    const mwNames = this.app.getMiddleware().getNames()
    const mwReady = mwNames.filter(name => ! name.includes('Controller'))
    console.info({ mwReady })

    // eslint-disable-next-line no-console
    console.info('✅ midway ready', info)
  }

  // async onStop(): Promise<void> {
  //   return
  // }

}

