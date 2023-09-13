/* eslint-disable import/max-dependencies */
import assert from 'node:assert/strict'

import {
  App,
  Configuration,
  ILifeCycle,
  Inject,
  ILogger,
  Logger,
  MidwayInformationService,
} from '@midwayjs/core'
import { JwtConfigKey, JwtMiddlewareConfig } from '@mwcp/jwt'
import { TraceInit } from '@mwcp/otel'
import {
  Application,
  IMidwayContainer,
  registerMiddleware,
} from '@mwcp/share'

import * as DefulatConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents, useDefaultRoutes } from './imports.js'
import {
  ConfigKey,
  NpmPkg,
} from './lib/index.js'
import {
  ErrorHandlerMiddleware,
  JsonRespMiddleware,
  RequestIdMiddleware,
  ResponseHeadersMiddleware,
  ResponseMimeMiddleware,
} from './middleware/index.middleware.js'


@Configuration({
  importConfigs: [
    {
      default: DefulatConfig,
      local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
export class ContainerConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Logger() protected readonly logger: ILogger

  @Inject() readonly informationService: MidwayInformationService

  // 启动前处理
  @TraceInit({ namespace: ConfigKey.componentName })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container

    // 定制化日志
    // customLogger(this.logger, this.app)

    // 全局x-request-id处理中间件
    registerMiddleware(this.app, RequestIdMiddleware, 'first')

    // 全局错误处理中间件（尽量靠前）
    registerMiddleware(this.app, ErrorHandlerMiddleware, 'first')
    registerMiddleware(this.app, JsonRespMiddleware, 'first', true)

    const mws = [
      ResponseMimeMiddleware,
      ResponseHeadersMiddleware,
      // JsonRespMiddleware,
    ]
    // @ts-ignore
    this.app.useMiddleware(mws)

    const pkg = this.informationService.getPkg() as NpmPkg | undefined
    if (pkg && Object.keys(pkg).length) {
      assert(pkg, 'retrieve package.json failed')
      this.app.addConfigObject({ pkg })
    }

    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }


  @TraceInit({ namespace: ConfigKey.componentName })
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
    // console.info({ jwtMiddlewareConfig })

    // const configAll = this.app.getConfig() as unknown
    // console.info({ configAll })

    const serviceEnv = this.app.getEnv()
    console.info({ serviceEnv })

    this.logger.info(`[${ConfigKey.componentName}] onServerReady`, info)
  }

  // async onStop(): Promise<void> {
  //   return
  // }

}

