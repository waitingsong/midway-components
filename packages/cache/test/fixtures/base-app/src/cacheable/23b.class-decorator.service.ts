import { Config as _Config } from '@midwayjs/core'

import { Cacheable } from '../../../../../src/index.js'
import { CachedResponse } from '../../../../../src/lib/types.js'


export const ttl = 1

const cacheName = 'foo'

@Cacheable()
export class ClassDecoratorService {

  async simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ ttl: 1 })
  async ttl(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable<ClassDecoratorService['ttlFn']>({
    ttl: ([input]) => input === 'foo' ? ttl : 0,
  })
  async ttlFn(input: string): Promise<CachedResponse<'OK'>> {
    void input
    return { value: 'OK' }
  }

  @Cacheable<ClassDecoratorService['ttlFn2']>({
    ttl: ([input], resp) => input.length && resp && +resp.value > 0 ? +resp.value : 0,
  })
  async ttlFn2(input: string): Promise<CachedResponse<number>> {
    return { value: +input }
  }

  @Cacheable({ cacheName, ttl })
  async name(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

}
