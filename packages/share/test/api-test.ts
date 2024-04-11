import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',
  methodCacheable: '/method_cacheable',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',
  simple: 'simple',
  simpleSyncOnly: 'simple_sync_only',
  simpleSyncWithAsyncBypass: 'simple_sync_with_async_bypass',
}
