/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { Cacheable, CachePut } from '../../../../../src/index.js'
import { CachedResponse, Config, ConfigKey } from '../../../../../src/lib/types.js'
import { apiPrefix, apiRoute } from '../api-route.js'
import { validateMeta } from '../base.helper.js'


const cacheKey = 'CachePutController.simple'

@Controller(apiPrefix.methodCachePut)
export class CachePutController {

  @_Config(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: Context

  readonly controllerName = 'CachePutController'

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<CachedResponse<string>> {

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    assert(ret.value === 'OK')
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    const ret2a = await this._simple()
    assert(ret.value === 'OK')
    validateMeta(ret2a, cacheKey, this.config.options.ttl)

    await this._put()
    const ret3 = await this._simple()
    assert(ret3.value === 'PUT')
    validateMeta(ret3, cacheKey, this.config.options.ttl)

    const ret3a = await this._simple()
    assert(ret3.value === 'PUT')
    validateMeta(ret3a, cacheKey, this.config.options.ttl)

    await sleep(this.config.options.ttl * 1001)

    const ret4 = await this._simple()
    assert(ret4.value === 'OK')
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this._simple()
    assert(ret4a.value === 'OK')
    validateMeta(ret4a, cacheKey, this.config.options.ttl)

    await this._put()
    const ret5 = await this._simple()
    assert(ret5.value === 'PUT')
    validateMeta(ret5, cacheKey, this.config.options.ttl)

    const ret5a = await this._simple()
    assert(ret5.value === 'PUT')
    validateMeta(ret5a, cacheKey, this.config.options.ttl)

    return ret5a
  }

  @Cacheable({ cacheName: cacheKey })
  protected async _simple(): Promise<CachedResponse<'OK' | 'PUT'>> {
    return { value: 'OK' }
  }

  @CachePut({ cacheName: cacheKey })
  protected async _put(): Promise<CachedResponse<'PUT'>> {
    return { value: 'PUT' }
  }

}
