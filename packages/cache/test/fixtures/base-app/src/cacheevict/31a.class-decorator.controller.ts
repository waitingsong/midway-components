import assert from 'node:assert/strict'

import { SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Controller,
  Get,
  Init,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { ConfigKey, Config } from '../../../../../src/lib/types.js'
import { apiPrefix, apiRoute } from '../api-route.js'
import { validateMeta } from '../base.helper.js'

import { ClassDecoratorEvictService, cacheNameSimple } from './31b.class-decorator.service.js'


@Controller(apiPrefix.classCacheable)
export class ClassDecoratorEvictController {

  @MConfig(ConfigKey.config) readonly cacheManagerConfig: Config

  @Inject() readonly svc: ClassDecoratorEvictService

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

  @Get(`/${apiRoute.hello}`)
  async hello(): Promise<'OK'> {
    const cacheKey = 'ClassDecoratorEvictService.hello'

    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, cacheKey, this.midwayConfig.ttl)

    return 'OK'
  }

  @Get(`/${apiRoute.evictOverride}`)
  async simple(): Promise<'OK'> {
    const cacheKey = cacheNameSimple

    await this.svc.evictHello()

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictSimple()

    const ret3 = await this.svc.simple2('hello')
    assert(! ret3[ConfigKey.CacheMetaType], JSON.stringify(ret3[ConfigKey.CacheMetaType]))

    const ret4 = await this.svc.simple()
    validateMeta(ret4, cacheKey, this.midwayConfig.ttl)

    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello', this.midwayConfig.ttl)

    await this.svc.evictSimple()
    return 'OK'
  }

  @Get(`/${apiRoute.evictCondition}`)
  async evictCondition(): Promise<'OK'> {
    const cacheKey = cacheNameSimple

    await this.svc.evictHello()
    await this.svc.evictSimple()

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictSimpleCondition(0) // not evict

    const ret3 = await this.svc.simple()
    validateMeta(ret3, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictSimpleCondition(0.1) // evict

    const ret3a = await this.svc.simple()
    assert(! ret3a[ConfigKey.CacheMetaType])

    const ret4 = await this.svc.simple()
    validateMeta(ret4, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictHello()
    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello', this.midwayConfig.ttl)

    return 'OK'
  }

  @Get(`/${apiRoute.evictResult}`)
  async evictResult(): Promise<'OK'> {
    const cacheKey = cacheNameSimple

    await this.svc.evictHello()
    await this.svc.evictSimple()

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEven(0) // (0+1) not evict

    const ret3 = await this.svc.simple()
    validateMeta(ret3, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEven(0.1) // (0+.1) not evict

    const ret3a = await this.svc.simple()
    validateMeta(ret3a, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEven(1) // (1+1) evict

    const ret4 = await this.svc.simple()
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this.svc.simple()
    validateMeta(ret4a, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictHello()
    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello', this.midwayConfig.ttl)

    return 'OK'
  }


  @Get(`/${apiRoute.evictResultEvenAndGreaterThanZero}`)
  async evictResultEvenAndGreaterThanZero(): Promise<'OK'> {
    const cacheKey = cacheNameSimple

    await this.svc.evictHello()
    await this.svc.evictSimple()

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEvenAndGreaterThanZero(0) // (even, but not gt zero) not evict

    const ret3 = await this.svc.simple()
    validateMeta(ret3, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEvenAndGreaterThanZero(1) // (odd) not evict

    const ret3a = await this.svc.simple()
    validateMeta(ret3a, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEvenAndGreaterThanZero(2) // (even and >0) evict

    const ret4 = await this.svc.simple()
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this.svc.simple()
    validateMeta(ret4a, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictHello()
    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello', this.midwayConfig.ttl)

    return 'OK'
  }

  @Get(`/${apiRoute.evictGenerics}`)
  async evictGenerics(): Promise<'OK'> {
    const cacheKey = cacheNameSimple

    await this.svc.evictHello()
    await this.svc.evictSimple()

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEvenAndGreaterThanZeroGenerics(0) // (even, but not gt zero) not evict

    const ret3 = await this.svc.simple()
    validateMeta(ret3, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEvenAndGreaterThanZeroGenerics(1) // (odd) not evict

    const ret3a = await this.svc.simple()
    validateMeta(ret3a, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictResultEvenAndGreaterThanZeroGenerics(2) // (even and >0) evict

    const ret4 = await this.svc.simple()
    assert(! ret4[ConfigKey.CacheMetaType])

    const ret4a = await this.svc.simple()
    validateMeta(ret4a, cacheKey, this.midwayConfig.ttl)

    await this.svc.evictHello()
    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello', this.midwayConfig.ttl)

    return 'OK'
  }

}

