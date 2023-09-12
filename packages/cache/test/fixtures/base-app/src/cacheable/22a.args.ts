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

import { ArgsDecoratorService } from './22b.args.service.js'


const ttl = 1
const cacheName = 'foo'

@Controller(apiPrefix.args)
export class ArgsController {

  @_Config(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: Context
  @Inject() readonly svc: ArgsDecoratorService

  readonly controllerName = 'ArgsController'

  @Get(`/${apiRoute.ttl}`)
  async simple(): Promise<CachedResponse<'OK'>> {
    const cacheKey = `${this.controllerName}._simple`

    const ret = await this._simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple()
    validateMeta(ret2, cacheKey, ttl)

    const ret2a = await this._simple()
    validateMeta(ret2a, cacheKey, ttl)

    await sleep(ttl * 1001)
    const ret3 = await this._simple()
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType], JSON.stringify(ret3[ConfigKey.CacheMetaType]))

    const ret3a = await this._simple()
    validateMeta(ret3a, cacheKey, ttl)

    return ret3
  }

  @Cacheable({ ttl: 1 })
  protected async _simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }


  @Get(`/${apiRoute.cacheName}`)
  async cacheName(): Promise<CachedResponse<'OK'>> {
    const cacheKey = cacheName

    const ret = await this._name()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this._name()
    validateMeta(ret2, cacheKey, ttl)

    const ret2a = await this._name()
    validateMeta(ret2a, cacheKey, ttl)

    return ret2
  }

  @Cacheable({ cacheName, ttl })
  protected async _name(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }


  @Get(`/${apiRoute.condition}`)
  async condition(): Promise<'OK'> {
    await this.svc.assertUndefined()

    await this.svc.assertTrue()
    await this.svc.assertFnTrue()
    await this.svc.assertPromiseTrue()

    await this.svc.assertFalse()
    await this.svc.assertFnFalse()
    await this.svc.assertPromiseFalse()
    return 'OK'
  }
}
