# [@mw-components/jwt](https://www.npmjs.com/package/@mw-components/jwt) 
Siging, verifying and authentication for midway framework.


## Installation
```sh
npm i @mw-components/jwt
```


## Configuration

### Enable Plugin

Edit `${app_root}/src/configuration.ts`:

```ts
import { join } from 'path'
import { ILifeCycle } from '@midwayjs/core'
import { Configuration } from '@midwayjs/decorator'
import * as jwt from '@mw-components/jwt'

@Configuration({
  imports: [
    jwt,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle { }


declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    jwtState: JwtState<User>
  }
}
export interface User {
  uid: string
  uname: string
}
```

### Add Configurations

```ts
/* location: ${app_root}/src/config/config.${env}.ts */

import {
  JwtConfig,
  JwtMiddlewareConfig,
  initPathArray,
} from '@mw-components/jwt'

export const jwtConfig: JwtConfig = {
  secret: '123456abc', // 默认密钥，生产环境一定要更改!
}
export const jwtMiddlewareConfig: JwtMiddlewareConfig = {
  enableMiddleware: true,
}
// OR add extra ignore rules
export const jwtMiddlewareConfig: JwtMiddlewareConfig = {
  enableMiddleware: true,
  ignore: [
    ...initPathArray,
    '/ip',
    '/test/sign',
    /\/foo\/bar.+/u,
  ]
}
```


## License
[MIT](LICENSE)

