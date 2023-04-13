import assert from 'node:assert/strict'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
  Param,
  Query,
} from '@midwayjs/core'
import type { Context } from '@mwcp/share'

import { apiPrefix, apiRoute } from '../api-route'
import { validateMeta } from '../base.helper'

import { CachedResponse, Config, ConfigKey, DataWithCacheMeta } from '~/lib/types'
import { Cacheable, } from '~/index'


const bigint = 1024n

@Controller(apiPrefix.keyGenerator)
export class ParamController {

  @_Config(ConfigKey.config) readonly config: Config
  @Inject() readonly ctx: Context

  readonly controllerName = 'ParamController'

  @Get(`/${apiRoute.param}/:uid`)
  async param(@Param('uid') uid: number | string): Promise<CachedResponse<number | string>> {
    const cacheKey = `${this.controllerName}._simple:arg-${uid.toString()}`

    const ret = await this._simple(uid)
    assert(ret.value === uid)
    assert(! ret[ConfigKey.CacheMetaType])

    const rnd = Math.random().toString()
    const ret2 = await this._simple(rnd)
    assert(! ret2[ConfigKey.CacheMetaType])

    const ret3 = await this._simple(uid)
    validateMeta(ret3, cacheKey, this.config.options.ttl)

    const cacheKey2 = `${this.controllerName}._big:${bigint.toString()}`
    await this._big(uid)
    const ret4 = await this._big(uid)
    validateMeta(ret4, cacheKey2, this.config.options.ttl)

    return ret3
  }

  @Cacheable<ParamController['_simple']>({ key: (args) => `arg-${args[0]}` })
  protected async _simple<T>(value: T, input: string = 'abc'): Promise<CachedResponse<T>> {
    void input // default param not support
    return { value }
  }


  @Cacheable({ key: 1024n })
  protected async _big<T>(value: T): Promise<CachedResponse<T>> {
    return { value }
  }


  @Get(`/${apiRoute.query}`)
  async query(@Query() input: GetUserDTO): Promise<string> {
    const cacheKey = `${this.controllerName}._simple2:${JSON.stringify(input)}`

    const ret = await this._simple2(input)
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple2(input)
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    return 'OK'
  }

  @Cacheable({ key: (args: [GetUserDTO]) => JSON.stringify(args[0]) })
  protected async _simple2(input: GetUserDTO): Promise<DataWithCacheMeta<GetUserDTO>> {
    return input
  }

}

interface GetUserDTO {
  uid: number
  name: string
}
