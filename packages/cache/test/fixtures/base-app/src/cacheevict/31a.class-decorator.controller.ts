import assert from 'node:assert/strict'

import { SingleCacheOptions } from '@midwayjs/cache-manager'
import {
  Controller,
  Get,
  Init,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { validateMeta } from '../base.helper.js'
import { apiBase, apiMethod } from '../types/api-test.js'
import { Config, ConfigKey } from '../types/lib-types.js'

import { ClassDecoratorEvictService, cacheNameSimple } from './31b.class-decorator.service.js'


@Controller(apiBase.class_cacheable)
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

  @Get(`/${apiMethod.hello}`)
  async hello(): Promise<'OK'> {
    const cacheKey = 'ClassDecoratorEvictService.hello'

    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, cacheKey, this.midwayConfig.ttl)

    return 'OK'
  }

  @Get(`/${apiMethod.evict_override}`)
  async simple(): Promise<'OK'> {
    const cacheKey = cacheNameSimple

    await this.svc.evictHello()

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey, this.midwayConfig.ttl)

    const ret2a = await this.svc.simple2('hello')
    assert(! ret2a[ConfigKey.CacheMetaType], JSON.stringify(ret2a[ConfigKey.CacheMetaType]))

    await this.svc.evictSimple()

    const ret3 = await this.svc.simple2('hello')
    validateMeta(ret3, `${cacheKey}:hello`, this.midwayConfig.ttl)

    const ret3a = await this.svc.simple()
    assert(! ret3a[ConfigKey.CacheMetaType], JSON.stringify(ret3a[ConfigKey.CacheMetaType]))

    const ret4 = await this.svc.simple()
    validateMeta(ret4, cacheKey, this.midwayConfig.ttl)

    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello', this.midwayConfig.ttl)

    await this.svc.evictSimple()
    return 'OK'
  }

  @Get(`/${apiMethod.evict_condition}`)
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

  @Get(`/${apiMethod.evict_result}`)
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

}

