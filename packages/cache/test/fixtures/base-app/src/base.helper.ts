import assert from 'node:assert/strict'

import {
  CachedResponse,
  ConfigKey,
  DataWithCacheMeta,
  initConfig,
} from '~/index'


export function validateMeta(
  resp: CachedResponse<unknown> | DataWithCacheMeta,
  cacheKey: string,
  ttl: number = initConfig.options.ttl,
): void {

  assert(resp, 'resp is undefined')
  assert(cacheKey, 'cacheKey is undefined')

  // @ts-ignore
  const meta = resp[ConfigKey.CacheMetaType]
  assert(meta, 'CacheMetaType is undefined')
  assert(meta.cacheKey === cacheKey, meta.cacheKey)
  assert(meta.ttl === ttl, JSON.stringify({ metaTTL: meta.ttl, ttl }) )
}
