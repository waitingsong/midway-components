import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import { Cacheable } from '../types/index.js'
import { CachedResponse } from '../types/lib-types.js'


const cacheName = 'foo'

@Cacheable()
@Singleton()
export class ThisService {
  readonly ttlValue = 1

  async simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable<ThisService['ttl']>({
    ttl() {
      assert(typeof this === 'object', 'this must be object')
      assert(typeof this.ttlValue === 'number', 'this.ttlValue must be number')
      return this.ttlValue
    },
  })
  async ttl(this: ThisService): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable<ThisService['ttlFn']>({
    ttl([input]) {
      return input === 'foo' ? this.ttlValue : 0
    },
  })
  async ttlFn(this: ThisService, input: string): Promise<CachedResponse<'OK'>> {
    void input
    return { value: 'OK' }
  }

  @Cacheable<ThisService['ttlFn2']>({
    ttl: ([input], resp) => input.length && resp && +resp.value > 0 ? +resp.value : 0,
  })
  async ttlFn2(this: ThisService, input: string): Promise<CachedResponse<number>> {
    return { value: +input }
  }

  @Cacheable<ThisService['name']>({
    cacheName,
    ttl() {
      assert(typeof this === 'object', 'this must be object')
      assert(typeof this.ttlValue === 'number', 'this.ttlValue must be number')
      return this.ttlValue
    },
  })
  async name(this: ThisService): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

}
