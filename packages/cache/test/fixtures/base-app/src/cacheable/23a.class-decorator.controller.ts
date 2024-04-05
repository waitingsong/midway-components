/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import assert from 'node:assert/strict'

import { CachingFactory, MidwayCache, SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Controller,
  Get,
  Init,
  Inject,
  InjectClient,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { Config, ConfigKey } from '../../../../../src/lib/types.js'
import { apiPrefix, apiRoute } from '../api-route.js'
import { validateMeta } from '../base.helper.js'

import { ClassDecoratorService, ttl } from './23b.class-decorator.service.js'


@Controller(apiPrefix.classCacheable)
export class ClassDecoratorController {

  @MConfig(ConfigKey.config) readonly cacheManagerConfig: Config

  @InjectClient(CachingFactory, 'default') cache: MidwayCache

  @Inject() svc: ClassDecoratorService

  readonly controllerName = 'ClassDecoratorService'

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
  async simple(): Promise<'OK'> {
    const cacheKey = `${this.controllerName}.simple`

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    await sleep(ttl * 1001)

    const ret2a = await this.svc.simple()
    validateMeta(ret2a, cacheKey, this.midwayConfig.ttl)

    return 'OK'
  }

  @Get(`/${apiRoute.argsOverride}`)
  async argsOverride(): Promise<'OK'> {
    const cacheKey = `${this.controllerName}.ttl`

    const ret = await this.svc.ttl()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.ttl()
    validateMeta(ret2, cacheKey, ttl)

    await sleep(ttl * 1001)

    const ret2a = await this.svc.ttl()
    assert(! ret2a[ConfigKey.CacheMetaType])

    return 'OK'
  }

  @Get(`/${apiRoute.ttlFn}`)
  async ttlFn(): Promise<'OK'> {

    let cacheKey = `${this.controllerName}.ttlFn`

    const ret = await this.svc.ttlFn('fake')
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.ttlFn('fake')
    assert(ret2.value === 'OK')
    assert(! ret2[ConfigKey.CacheMetaType])

    const ret3 = await this.svc.ttlFn('foo')
    assert(ret3.value === 'OK')
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret3a = await this.svc.ttlFn('foo')
    assert(ret3a.value === 'OK')
    validateMeta(ret3a, cacheKey, ttl)

    await sleep(ttl * 1001)

    const ret4 = await this.svc.ttlFn('foo')
    assert(ret4.value === 'OK')
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this.svc.ttlFn('foo')
    assert(ret4a.value === 'OK')
    validateMeta(ret4a, cacheKey, ttl)


    await sleep(ttl * 1001)
    cacheKey = `${this.controllerName}.ttlFn2`

    const ret5 = await this.svc.ttlFn2('fake')
    assert(Number.isNaN(ret5.value))
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.ttlFn2('')
    assert(ret5a.value === 0)
    assert(! ret5a[ConfigKey.CacheMetaType])

    const ret5b = await this.svc.ttlFn2('')
    assert(ret5b.value === 0)
    assert(! ret5b[ConfigKey.CacheMetaType])

    const ret6 = await this.svc.ttlFn2('-1')
    assert(ret6.value === -1)
    assert(! ret6[ConfigKey.CacheMetaType])

    const ret6a = await this.svc.ttlFn2('-1')
    assert(ret6a.value === -1)
    assert(! ret6[ConfigKey.CacheMetaType])

    const ret7 = await this.svc.ttlFn2('0')
    assert(ret7.value === 0)
    assert(! ret7[ConfigKey.CacheMetaType])

    const ret7a = await this.svc.ttlFn2('0')
    assert(ret7a.value === 0)
    assert(! ret7[ConfigKey.CacheMetaType])

    const ret8 = await this.svc.ttlFn2('1')
    assert(ret8.value === 1)
    assert(! ret8[ConfigKey.CacheMetaType])

    const ret8a = await this.svc.ttlFn2('1')
    assert(ret8a.value === 1)
    validateMeta(ret8a, cacheKey, 1)

    await sleep(ttl * 1001)

    const ret9 = await this.svc.ttlFn2('1')
    assert(ret9.value === 1)
    assert(! ret9[ConfigKey.CacheMetaType])

    const ret9b = await this.svc.ttlFn2('1')
    assert(ret9b.value === 1)
    validateMeta(ret9b, cacheKey, 1)

    const ret10 = await this.svc.ttlFn2('2')
    assert(ret10.value === 1)
    validateMeta(ret10, cacheKey, 1)

    // await sleep(ttl * 1001)

    return 'OK'

  }

}

