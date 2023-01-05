import assert from 'node:assert'

import {
  Config as _Config,
} from '@midwayjs/core'

import { validateMeta } from '../base.helper'

import { CachedResponse, Config, ConfigKey } from '~/lib/types'
import { Cacheable, } from '~/index'


@Cacheable()
export class ArgsDecoratorService  {

  @_Config(ConfigKey.config) readonly config: Config

  async assertUndefined(): Promise<void> {
    const cacheKey = 'ArgsDecoratorService.conditionUndefined'

    const ret = await this.conditionUndefined()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionUndefined()
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    const ret2a = await this.conditionUndefined()
    validateMeta(ret2a, cacheKey, this.config.options.ttl)
  }

  async assertTrue(): Promise<void> {
    const cacheKey = 'ArgsDecoratorService.conditionTrue'

    const ret = await this.conditionTrue()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionTrue()
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    const ret2a = await this.conditionTrue()
    validateMeta(ret2a, cacheKey, this.config.options.ttl)
  }

  async assertFnTrue(): Promise<void> {
    const cacheKey = 'ArgsDecoratorService.conditionFnTrue'

    const ret = await this.conditionFnTrue()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionFnTrue()
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    const ret2a = await this.conditionFnTrue()
    validateMeta(ret2a, cacheKey, this.config.options.ttl)
  }

  async assertPromiseTrue(): Promise<void> {
    const cacheKey = 'ArgsDecoratorService.conditionPromiseTrue'

    const ret = await this.conditionPromiseTrue()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionPromiseTrue()
    validateMeta(ret2, cacheKey, this.config.options.ttl)

    const ret2a = await this.conditionPromiseTrue()
    validateMeta(ret2a, cacheKey, this.config.options.ttl)
  }


  async assertFalse(): Promise<void> {
    const ret = await this.conditionFalse()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionFalse()
    assert(! ret2[ConfigKey.CacheMetaType], JSON.stringify(ret2[ConfigKey.CacheMetaType]))

    const ret2a = await this.conditionFalse()
    assert(! ret2a[ConfigKey.CacheMetaType], JSON.stringify(ret2a[ConfigKey.CacheMetaType]))
  }

  async assertFnFalse(): Promise<void> {
    const ret = await this.conditionFnFalse()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionFnFalse()
    assert(! ret2[ConfigKey.CacheMetaType], JSON.stringify(ret2[ConfigKey.CacheMetaType]))

    const ret2a = await this.conditionFnFalse()
    assert(! ret2a[ConfigKey.CacheMetaType], JSON.stringify(ret2a[ConfigKey.CacheMetaType]))
  }

  async assertPromiseFalse(): Promise<void> {
    const ret = await this.conditionPromiseFalse()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType], JSON.stringify(ret[ConfigKey.CacheMetaType]))

    const ret2 = await this.conditionPromiseFalse()
    assert(! ret2[ConfigKey.CacheMetaType], JSON.stringify(ret2[ConfigKey.CacheMetaType]))

    const ret2a = await this.conditionPromiseFalse()
    assert(! ret2a[ConfigKey.CacheMetaType], JSON.stringify(ret2a[ConfigKey.CacheMetaType]))
  }


  @Cacheable({ condition: undefined })
  protected async conditionUndefined(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ condition: true })
  protected async conditionTrue(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ condition: false })
  protected async conditionFalse(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ condition: () => true })
  protected async conditionFnTrue(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ condition: () => false })
  protected async conditionFnFalse(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ condition: async () => true })
  protected async conditionPromiseTrue(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ condition: async () => false })
  protected async conditionPromiseFalse(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

}
