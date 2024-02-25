/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { CachingFactory, MidwayCache, SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Config as _Config,
  Controller,
  Get,
  Init,
  Inject,
  InjectClient,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { Cacheable } from '../../../../../src/index.js'
import { CachedResponse, Config, ConfigKey } from '../../../../../src/lib/types.js'
import { apiPrefix, apiRoute } from '../api-route.js'
import { validateMeta } from '../base.helper.js'


@Controller(apiPrefix.methodCacheable)
export class DecoratorController {

  @_Config(ConfigKey.config) readonly cacheManagerConfig: Config
  @Inject() readonly ctx: Context

  @InjectClient(CachingFactory, 'default') cache: MidwayCache

  readonly controllerName = 'DecoratorController'
  private midwayConfig: { ttl: number } // MidwayConfig

  @Init()
  async init() {
    const defaultConfig = this.cacheManagerConfig.clients['default'] as SingleCacheOptions
    assert(defaultConfig)
    // @ts-expect-error
    const configOpt = defaultConfig.options as { ttl: number} // MidwayConfig
    assert(configOpt)
    this.midwayConfig = configOpt
  }

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<CachedResponse<'OK'>> {
    const cacheKey = `${this.controllerName}._simple`

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey, this.midwayConfig.ttl)

    await sleep(this.midwayConfig.ttl * 1001)
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey, this.midwayConfig.ttl)


    const ret4 = await this._simple2()
    assert(ret4 === 'OK')
    const ret5 = await this._simple2()
    // @ts-ignore
    assert(! ret5[ConfigKey.CacheMetaType])

    return ret3
  }

  @Cacheable()
  protected async _simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable()
  protected async _simple2(): Promise<'OK'> {
    return 'OK'
  }

}
