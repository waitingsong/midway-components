import {
  Config as _Config,
} from '@midwayjs/core'

import { Cacheable, CachedResponse } from '~/index'

const ttl = 1
const cacheName = 'foo'

@Cacheable()
export class ClassDecoratorService  {

  async simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ ttl: 1 })
  async ttl(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ cacheName, ttl })
  async name(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

}
