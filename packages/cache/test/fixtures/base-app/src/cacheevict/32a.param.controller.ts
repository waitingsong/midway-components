
import assert from 'node:assert/strict'

import { SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Controller,
  Get,
  Init,
  Inject,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'

import { validateMeta } from '../base.helper.js'
import { apiBase, apiMethod } from '../types/api-test.js'
import { CacheEvict, Cacheable } from '../types/index.js'
import { CachedResponse, Config, ConfigKey, Msg } from '../types/lib-types.js'


const cacheKey = 'CacheEvictController.simple'
const cacheKey2 = 'CacheEvictController.param_mix'

@Controller(apiBase.method_cacheevict)
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

  @Get(`/${apiMethod.param}`)
  async simple(): Promise<'OK'> {

    const ret = await this._simple(1)
    assert(ret.value === 1)
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this._simple(2)
    assert(! ret2[ConfigKey.CacheMetaType])

    const ret2a = await this._simple(1)
    validateMeta(ret2a, `${cacheKey}:1`, this.midwayConfig.ttl)

    await this._del(1)

    const ret3 = await this._simple(1)
    assert(ret3.value === 1)
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this._simple(2)
    validateMeta(ret3a, `${cacheKey}:2`, this.midwayConfig.ttl)

    return 'OK'
  }

  @Cacheable({ cacheName: cacheKey })
  protected async _simple(simpleInput: number): Promise<CachedResponse<number>> {
    return { value: simpleInput }
  }

  @CacheEvict({ cacheName: cacheKey })
  protected async _del(simpleInput: number): Promise<void> {
    void simpleInput
    return
  }

  // #region evict array

  @Get(`/${apiMethod.param_array}`)
  async param_array(): Promise<'OK'> {
    try {
      await this._simple_array([1, 2, 3])
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message.includes(Msg.paramArrayNeedCustomSerializer))
      return 'OK'
    }
    assert(false, 'should not go here')
  }

  @Cacheable({ cacheName: cacheKey })
  protected async _simple_array(input: number[]): Promise<CachedResponse<'OK'>> {
    void input
    return { value: 'OK' }
  }

  // #region evict mix

  @Get(`/${apiMethod.param_mix}`)
  async param_mix(): Promise<'OK'> {

    let input: Input2 | number | bigint = 1
    const ret2a = await this._simple_mix(input)
    assert(! ret2a[ConfigKey.CacheMetaType])
    const ret2b = await this._simple_mix(input)
    validateMeta(ret2b, `${cacheKey2}:${input}`, this.midwayConfig.ttl)

    input = 1n
    const ret3a = await this._simple_mix(input)
    assert(! ret3a[ConfigKey.CacheMetaType])
    const ret3b = await this._simple_mix(input)
    validateMeta(ret3b, `${cacheKey2}:${input}n`, this.midwayConfig.ttl) // note `n` after number

    input = {
      foo: 1,
      bar: 'barz',
    }
    const ret4a = await this._simple_mix(input)
    assert(! ret4a[ConfigKey.CacheMetaType])
    const ret4b = await this._simple_mix(input)
    const expectedKey = `${cacheKey2}:bar:barz,foo:1`
    validateMeta(ret4b, expectedKey, this.midwayConfig.ttl)

    return 'OK'
  }

  @Cacheable({ cacheName: cacheKey2 })
  protected async _simple_mix(input: Input2 | number | bigint): Promise<CachedResponse<'OK'>> {
    void input
    return { value: 'OK' }
  }
}

interface Input2 {
  foo: number
  bar: string
}
