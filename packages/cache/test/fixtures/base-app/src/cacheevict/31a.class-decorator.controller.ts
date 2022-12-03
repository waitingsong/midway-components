import assert from 'node:assert/strict'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { apiPrefix, apiRoute } from '../api-route'
import { validateMeta } from '../base.helper'
import { ClassDecoratorEvictService, cacheName } from './31b.class-decorator.service'

import { ConfigKey } from '~/index'


@Controller(apiPrefix.classCacheable)
export class ClassDecoratorEvictController {

  @Inject() svc: ClassDecoratorEvictService

  readonly controllerName = 'ClassDecoratorService'

  @Get(`/${apiRoute.evictOverride}`)
  async simple(): Promise<'OK'> {
    const cacheKey = cacheName

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey)

    await this.svc.evict()

    const ret3 = await this.svc.simple()
    assert(! ret3[ConfigKey.CacheMetaType])

    const ret4 = await this.svc.simple()
    validateMeta(ret4, cacheKey)

    const ret5 = await this.svc.hello()
    assert(! ret5[ConfigKey.CacheMetaType])

    const ret5a = await this.svc.hello()
    validateMeta(ret5a, 'ClassDecoratorEvictService.hello')

    return 'OK'
  }

}

