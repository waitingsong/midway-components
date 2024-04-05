/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Controller,
  Get,
  Init,
  Inject,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'

import { Cacheable, CacheEvict } from '../../../../../src/index.js'
import { CachedResponse, Config, ConfigKey } from '../../../../../src/lib/types.js'
import { apiPrefix, apiRoute } from '../api-route.js'
import { validateMeta } from '../base.helper.js'


const cacheKey = 'CacheEvictController.simple'

@Controller(apiPrefix.methodCacheEvict)
export class CacheEvictController {

  @MConfig(ConfigKey.config) readonly cacheManagerConfig: Config

  @Inject() readonly ctx: Context

  readonly controllerName = 'CacheEvictController'

  private midwayConfig: { ttl: number } // MidwayConfig

  @Init()
  async init() {
    const defaultConfig = this.cacheManagerConfig.clients['default'] as SingleCacheOptions
    assert(defaultConfig)
    // @ts-expect-error
    const configOpt = defaultConfig.options as { ttl: number } // MidwayConfig
    assert(configOpt)
    this.midwayConfig = configOpt
  }

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<CachedResponse<'OK'>> {

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey, this.midwayConfig.ttl)

    await this._del()
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey, this.midwayConfig.ttl)

    await this._del2()
    const ret4 = await this._simple()
    assert(ret4.value === 'OK')
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this._simple()
    validateMeta(ret4a, cacheKey, this.midwayConfig.ttl)

    return ret3
  }

  @Cacheable({ cacheName: cacheKey })
  protected async _simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName: cacheKey })
  protected async _del(): Promise<void> {
    return
  }

  @CacheEvict({ cacheName: cacheKey, beforeInvocation: true })
  protected async _del2(): Promise<void> {
    return
  }

}
