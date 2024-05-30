/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import {
  Init,
  CONTROLLER_KEY,
  Singleton,
  WEB_ROUTER_KEY,
  listModule,
  getClassMetadata,
} from '@midwayjs/core'
import {
  ConfigKey as ShareConfigKey,
  MConfig,
  DecoratorHandlerBase,
  MiddlewarePathPattern,
  instanceMethodHasMethodDecorator,
} from '@mwcp/share'

import { DECORATOR_KEY_Public } from '../config.js'
import { Config, ConfigKey, MiddlewareConfig } from '../types.js'


@Singleton()
export class DecoratorHandlerPublic extends DecoratorHandlerBase {
  @MConfig(ConfigKey.config) protected readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @MConfig(ShareConfigKey.routerInfoConfig) protected readonly routerInfoConfig: { enable: boolean }

  @Init()
  async init() {
    if (! this.mwConfig.enableMiddleware) { return }

    this.enableRouterInfo()
    this.processIgnoreList()
  }


  // #region private methods

  private enableRouterInfo(): void {
    if (! this.routerInfoConfig.enable) {
      this.routerInfoConfig.enable = true
    }
  }

  private processIgnoreList(): void {
    const arr: MiddlewarePathPattern = []
    listModule(CONTROLLER_KEY).forEach((module) => {
      const list = this.genList(module)
      if (list.length) {
        arr.push(...list)
      }
    })

    if (arr.length) {
      this.mwConfig.ignore = this.mwConfig.ignore ? arr.concat(this.mwConfig.ignore) : arr
    }
  }

  private genList(module: unknown): MiddlewarePathPattern {
    const { mwConfig } = this
    const ret: MiddlewarePathPattern = []

    const { prefix } = getClassMetadata(
      CONTROLLER_KEY,
      module,
    )
    if (! prefix) {
      return ret
    }
    assert(typeof prefix === 'string', 'prefix must be string')

    const webRouterInfo: unknown[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module,
    )
    // console.info({ webRouterInfo })
    webRouterInfo.forEach((info) => {
      const { method, path } = info as any
      // @ts-expect-error - module
      const isDecorated = instanceMethodHasMethodDecorator(module, DECORATOR_KEY_Public, method)
      if (! isDecorated) { return }

      const needle = `${prefix}${path}`

      if (mwConfig.match?.includes(needle)) { // remove needle from match
        mwConfig.match = mwConfig.match.filter(val => val !== needle)
      }

      if (! mwConfig.ignore || mwConfig.ignore.includes(needle)) { return }
      ret.push(needle)
    })

    return ret
  }

}

