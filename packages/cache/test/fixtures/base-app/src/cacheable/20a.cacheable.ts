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

import { Cacheable } from '../../../../../src/index.js'
import { CachedResponse, Config, ConfigKey } from '../../../../../src/lib/types.js'
import { apiPrefix, apiRoute } from '../api-route.js'
import { validateMeta } from '../base.helper.js'


@Controller(apiPrefix.methodCacheable)
export class DecoratorController {

  @_Config(ConfigKey.config) readonly config: Config
  @Inject() readonly ctx: Context

  readonly controllerName = 'DecoratorController'

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<CachedResponse<'OK'>> {
    const cacheKey = `${this.controllerName}._simple`

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey, this.config.options.ttl)

    await sleep(this.config.options.ttl * 1001)
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey, this.config.options.ttl)


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
