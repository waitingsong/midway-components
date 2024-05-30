# [@mwcp/jwt](https://www.npmjs.com/package/@mwcp/jwt) 
Siging, verifying and authentication for midway framework.


## Note

ESM build only, requires `@midwayjs >= 3.12` and set `"type": "module"` in `packages.json`

## Installation
```sh
npm i @mwcp/jwt
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

## `Public` Decorator

No JWT Authentication

Caution:
- it works even if the route is in the match list
- it will cause some latency when first request for each route

```ts
import { Public } from '@mwcp/jwt'

@Controller('/')
export class FooController {

  @Inject() readonly svc: FooService

  @Public()
  async hello(): Promise<string> {
    return 'hello'
  }

}
```

## License
[MIT](LICENSE)

