import assert from 'node:assert/strict'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'

import { apiPrefix, apiRoute } from '../api-route'
import { validateMeta } from '../base.helper'

import { Cacheable, CacheEvict } from '~/index'
import { CachedResponse, ConfigKey } from '~/lib/types'


const cacheKey = `CacheEvictController.simple`

@Controller(apiPrefix.methodCacheEvict)
export class CacheEvictController {

  @Inject() readonly ctx: Context

  readonly controllerName = 'CacheEvictController'

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<CachedResponse<'OK'>> {

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey)

    await this._del()
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey)

    await this._del2()
    const ret4 = await this._simple()
    assert(ret4.value === 'OK')
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this._simple()
    validateMeta(ret4a, cacheKey)

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
