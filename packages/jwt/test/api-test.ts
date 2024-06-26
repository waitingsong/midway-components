import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',
  home2: 'home2',
  test: 'test',
  id: 'id',
}
