/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

import { retrieveCacheMetaFrom } from './types/index.js'
import { CachedResponse, DataWithCacheMeta } from './types/lib-types.js'


export function validateMeta(
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  resp: CachedResponse<unknown> | DataWithCacheMeta,
  cacheKey: string,
  ttl: number,
): void {

  assert(resp, 'resp is undefined')
  assert(cacheKey, 'cacheKey is undefined')

  const meta = retrieveCacheMetaFrom(resp)

  assert(meta, 'CacheMetaType is undefined')
  assert(meta.cacheKey === cacheKey, `cacheKey: ${meta.cacheKey}, expected: ${cacheKey}`)
  assert(meta.ttl === ttl, JSON.stringify({ metaTTL: meta.ttl, ttl }))
}
