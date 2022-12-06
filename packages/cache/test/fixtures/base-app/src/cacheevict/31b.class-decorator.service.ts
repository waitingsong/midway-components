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

  @CacheEvict({
    cacheName: cacheNameSimple,
    condition: (
      _args: unknown, result: CachedResponse<number> | undefined
    ) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEven(input: number): Promise<CachedResponse<number>> {
    return { value: input + 1 }
  }


  @CacheEvict({
    cacheName: cacheNameSimple,
    key: (args: [number], result: CachedResponse<number> | undefined) => {
      const invalidStr = 'cache item will not exist due to this invalid string'
      if (args[0] === 0) {
        return invalidStr
      }
      return result && result.value % 2 === 0 ? void 0 : invalidStr
    },
    condition: (
      _args: unknown, result: CachedResponse<number> | undefined
    ) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEvenAndGreaterThanZero(input: number): Promise<CachedResponse<number>> {
    return { value: input }
  }

  @CacheEvict({
    cacheName: cacheNameSimple,
    key: (
      args: Parameters<ClassDecoratorEvictService['evictResultEvenAndGreaterThanZero2']>,
      result: Awaited<ReturnType<ClassDecoratorEvictService['evictResultEvenAndGreaterThanZero2']>> | undefined) => {
        const invalidStr = 'cache item will not exist due to this invalid string'
        if (args[0] === 0) {
          return invalidStr
        }
        return result && result.value % 2 === 0 ? void 0 : invalidStr
      },
      condition: (
        _args: unknown, result: CachedResponse<number> | undefined
      ) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEvenAndGreaterThanZero2(input: number): Promise<CachedResponse<number>> {
    return { value: input }
  }
}

