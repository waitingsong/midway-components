
import { CacheEvict, Cacheable } from '../types/index.js'
import { CachedResponse } from '../types/lib-types.js'


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

  @CacheEvict<ClassDecoratorEvictService['evictSimpleCondition']>({
    cacheName: cacheNameSimple,
    key: ([, simpleInput]) => simpleInput?.toString() ?? '',
    writeCondition: ([input]) => input > 0,
  })
  async evictSimpleCondition(
    input: number,
    simpleInput = '', // param of this.svc.simple()
  ): Promise<CachedResponse<'OK'>> {
    void input
    void simpleInput
    return { value: 'OK' }
  }

  @CacheEvict<ClassDecoratorEvictService['evictResultEven']>({
    cacheName: cacheNameSimple,
    key: ([, simpleInput]) => simpleInput?.toString() ?? '',
    writeCondition: (_args, result) => result ? result.value % 2 === 0 : false,
  })
  async evictResultEven(
    input: number,
    simpleInput = '', // param of this.svc.simple()
  ): Promise<CachedResponse<number>> {
    void simpleInput
    return { value: input + 1 }
  }



}

