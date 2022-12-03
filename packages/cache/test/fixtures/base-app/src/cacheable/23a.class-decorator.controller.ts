import assert from 'node:assert/strict'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { sleep } from '@waiting/shared-core'

import { apiPrefix, apiRoute } from '../api-route'
import { validateMeta } from '../base.helper'
import { ClassDecoratorService } from './23b.class-decorator.service'

import { ConfigKey } from '~/lib/types'


const ttl = 1

@Controller(apiPrefix.classCacheable)
export class ClassDecoratorController {

  @Inject() svc: ClassDecoratorService

  readonly controllerName = 'ClassDecoratorService'

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<'OK'> {
    const cacheKey = `${this.controllerName}.simple`

    const ret = await this.svc.simple()
    assert(ret.value === 'OK')
    assert(! ret[ConfigKey.CacheMetaType])

    const ret2 = await this.svc.simple()
    validateMeta(ret2, cacheKey)

    await sleep(ttl * 1001)

    const ret2a = await this.svc.simple()
    validateMeta(ret2a, cacheKey)

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

}

