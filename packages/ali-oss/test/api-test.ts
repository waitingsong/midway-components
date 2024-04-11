import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',
  oss: '/oss',
}

export const apiPath = {
  root: '/',
  hello: 'hello',
  component: 'component',
  stat: 'stat',
  mkdir: 'mkdir',
}
