/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { CachingFactory, MidwayCache, SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Controller,
  Get,
  Init,
  Inject,
  InjectClient,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { validateMeta } from '../base.helper.js'
import { apiBase, apiMethod } from '../types/api-test.js'
import { Cacheable } from '../types/index.js'
import { CachedResponse, Config, ConfigKey } from '../types/lib-types.js'


@Controller(apiBase.method_cacheable)
export class DecoratorController {

  @MConfig(ConfigKey.config) readonly cacheManagerConfig: Config
  @Inject() readonly ctx: Context

  @InjectClient(CachingFactory, 'default') cache: MidwayCache

  readonly controllerName = 'DecoratorController'
  private midwayConfig: { ttl: number } // MidwayConfig
  ttl: number

  @Init()
  async init() {
    const defaultConfig = this.cacheManagerConfig.clients['default'] as SingleCacheOptions
    assert(defaultConfig)
    // @ts-expect-error
    const configOpt = defaultConfig.options as { ttl: number } // MidwayConfig
    assert(configOpt)
    this.midwayConfig = configOpt
    this.ttl = configOpt.ttl
    // this.ttl = 30
  }

  @Get(`/${apiMethod.simple}`)
  async simple(): Promise<CachedResponse<'OK'>> {
    const cacheKey = `${this.controllerName}._simple`

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey, this.ttl)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey, this.ttl)

    await sleep(this.midwayConfig.ttl * 1001)
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey, this.ttl)


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
