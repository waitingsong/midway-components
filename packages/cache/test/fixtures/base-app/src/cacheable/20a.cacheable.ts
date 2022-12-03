import assert from 'node:assert/strict'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { apiPrefix, apiRoute } from '../api-route'
import { validateMeta } from '../base.helper'

import { Cacheable, CachedResponse, ConfigKey } from '~/index'


@Controller(apiPrefix.methodCacheable)
export class DecoratorController {

  @Inject() readonly ctx: Context

  readonly controllerName = 'DecoratorController'

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<CachedResponse<'OK'>> {
    const cacheKey = `${this.controllerName}._simple`

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey)

    await sleep(10_010)
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey)


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
