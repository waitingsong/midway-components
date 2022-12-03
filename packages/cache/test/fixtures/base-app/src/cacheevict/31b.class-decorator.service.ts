import {
  Config as _Config,
} from '@midwayjs/core'

import { CachedResponse } from '~/lib/types'
import { Cacheable, CacheEvict } from '~/index'


export const cacheName = `CacheEvictService.simple`

@Cacheable()
export class ClassDecoratorEvictService  {

  async hello(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ cacheName })
  async simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName })
  async evict(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

}

