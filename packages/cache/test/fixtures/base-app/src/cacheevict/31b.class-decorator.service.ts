/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Cacheable, CacheEvict } from '../../../../../dist/index.js'
import { CachedResponse } from '../../../../../dist/lib/types.js'


// should equal to the cacheName of ClassDecoratorEvictService.hello()
export const cacheNameHello = 'ClassDecoratorEvictService.hello'
export const cacheNameSimple = 'CacheEvictService.simple'

@Cacheable({
  condition: true,
})
export class ClassDecoratorEvictService {

  async hello(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName: cacheNameHello, traceLogCacheHit: true })
  async evictHello(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ cacheName: cacheNameSimple, traceLogCacheHit: true })
  async simple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @Cacheable({ cacheName: cacheNameSimple })
  async simple2(input: string): Promise<CachedResponse<string>> {
    return { value: input }
  }

  @CacheEvict({ cacheName: cacheNameSimple })
  async evictSimple(): Promise<CachedResponse<'OK'>> {
    return { value: 'OK' }
  }

  @CacheEvict({ cacheName: cacheNameSimple, writeCondition: (args: [number]) => args[0] > 0 })
  async evictSimpleCondition(input: number): Promise<CachedResponse<'OK'>> {
    void input
    return { value: 'OK' }
  }

  @CacheEvict({
    cacheName: cacheNameSimple,
    writeCondition: (_args: unknown, result: CachedResponse<number> | undefined) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEven(input: number): Promise<CachedResponse<number>> {
    return { value: input + 1 }
  }


  @CacheEvict<ClassDecoratorEvictService['evictResultEvenAndGreaterThanZero']>({
    cacheName: cacheNameSimple,
    key: ([input], result) => {
      const invalidStr = 'cache item will not exist due to this invalid string'
      if (input === 0) {
        return invalidStr
      }
      return result && result.value % 2 === 0 ? void 0 : invalidStr
    },
    writeCondition: (_args, result) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEvenAndGreaterThanZero(input: number): Promise<CachedResponse<number>> {
    return { value: input }
  }


  @CacheEvict<ClassDecoratorEvictService['evictResultEvenAndGreaterThanZeroGenerics']>({
    cacheName: cacheNameSimple,
    key: (args, result) => {
      const invalidStr = 'cache item will not exist(no evict) due to this invalid string'
      if (args[0] === 0) {
        return invalidStr
      }
      return result && result.value % 2 === 0 ? void 0 : invalidStr
    },
    writeCondition: (_args, result) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEvenAndGreaterThanZeroGenerics(
    input: number,
    notUsed?: string | number,
  ): Promise<CachedResponse<number>> {

    void notUsed
    return { value: input }
  }

}

