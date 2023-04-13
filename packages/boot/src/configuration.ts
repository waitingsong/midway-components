/* eslint-disable import/max-dependencies */
import 'tsconfig-paths/register'
import assert from 'node:assert/strict'
import { join } from 'node:path'

import {
  App,
  Configuration,
  ILifeCycle,
  Inject,
  Logger,
  MidwayInformationService,
} from '@midwayjs/core'
import { IMidwayLogger } from '@midwayjs/logger'
import { JwtConfigKey, JwtMiddlewareConfig } from '@mwcp/jwt'
import { TraceInit } from '@mwcp/otel'

import { useComponents, useDefaultRoutes } from './imports'
import {
  Application,
  ConfigKey,
  IMidwayContainer,
  NpmPkg,
} from './lib/index'
import {
  ErrorHandlerMiddleware,
  RequestIdMiddleware,
  ResponseHeadersMiddleware,
  ResponseMimeMiddleware,
} from './middleware/index.middleware'


@Configuration({
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class ContainerConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Logger() readonly logger: IMidwayLogger

  @Inject() readonly informationService: MidwayInformationService

  // 启动前处理
  @TraceInit(`INIT ${ConfigKey.componentName}.onReady`)
  async onReady(container: IMidwayContainer): Promise<void> {
    void container

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


  @TraceInit(`INIT ${ConfigKey.componentName}.onServerReady`)
  async onServerReady(container: IMidwayContainer): Promise<void> {
    void container
    const pkg = this.informationService.getPkg() as NpmPkg | undefined
    const info = {
      pkgName: pkg?.name,
      pkgVersion: pkg?.version,
    }

    const mwNames = this.app.getMiddleware().getNames()
    const mwReady = mwNames.filter(name => ! name.includes('Controller'))
    console.info({ mwReady })

    const jwtMiddlewareConfig = this.app.getConfig(JwtConfigKey.middlewareConfig) as JwtMiddlewareConfig
    assert(jwtMiddlewareConfig, 'jwt middleware config not found')

    if (useDefaultRoutes.length && Array.isArray(jwtMiddlewareConfig.ignore)) {
      const ignores = jwtMiddlewareConfig.ignore
      useDefaultRoutes.forEach((route) => {
        if (route && ! ignores.includes(route)) {
          ignores.push(route)
        }
      })
    }

    // eslint-disable-next-line no-console
    console.info('✅ midway ready', info)
  }

  // async onStop(): Promise<void> {
  //   return
  // }

}

