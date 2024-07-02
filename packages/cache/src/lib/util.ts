import { ConfigKey } from '##/lib/types.js'
import type { CacheMetaType, CachedResponse, DataWithCacheMeta } from '##/lib/types.js'


/**
 * Retrieve cache meta from a cached response or data with cache meta.
 * @description Only for object data
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function retrieveCacheMetaFrom(data: CachedResponse | DataWithCacheMeta<unknown>): CacheMetaType | undefined {
  if (typeof data !== 'object') {
    return
  }

  // @ts-expect-error
  const meta = data[ConfigKey.CacheMetaType] as CacheMetaType | undefined
  if (! meta) {
    return
  }
  if (typeof meta.cacheKey === 'string' && typeof meta.ttl === 'number') {
    return meta
  }
}
