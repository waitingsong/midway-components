import {
  Config as _Config,
} from '@midwayjs/core'

import { CachedResponse } from '~/lib/types'
import { Cacheable, CacheEvict } from '~/index'


export const cacheNameHello = `ClassDecoratorEvictService.hello`
export const cacheNameSimple = `CacheEvictService.simple`

@Cacheable()
export class ClassDecoratorEvictService  {

  // value of cacheName is cacheNameHello
  async hello(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName: cacheNameHello })
  async evictHello(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ cacheName: cacheNameSimple })
  async simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName: cacheNameSimple })
  async evictSimple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName: cacheNameSimple, condition: (args: [number]) => args[0] > 0 })
  async evictSimpleCondition(input: number): Promise<CachedResponse<'OK'>> {
    void input
    return { value: 'OK' }
  }
}

