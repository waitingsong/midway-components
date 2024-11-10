# @mwcp/cache

Declarative Cache Component for [Midway.js]

[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![Version](https://img.shields.io/npm/v/@mwcp/cache.svg)](https://www.npmjs.com/package/midway-components)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/actions/workflows/nodejs.yml/badge.svg
)](https://github.com/waitingsong/midway-components/actions)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Note

ESM build only, requires `@midwayjs >= 3.16` and set `"type": "module"` in `packages.json`

## Install

```sh
npm i @mwcp/cache
```

## Configuration

Update project `src/configuration.ts`
```ts
import { Configuration } from '@midwayjs/decorator'
import * as koa from '@midwayjs/koa'
import * as cache from '@mwcp/cache'

@Configuration({
  imports: [
    koa,
    cache,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {
}
```

Change default config via  `src/config/config.{default | prod | unittest}.ts`
```ts
import { CacheManagerConfig } from '@mwcp/cache'

export const cacheManagerConfig: CacheManagerConfig = {
  clients: {
    default: {
      store: 'memory',
      options: {
        max: 512,
        ttl: 10,  // Second!
      },
    }
  }
}
```

## Usage

Normal [Cache-Docs-EN]


## How to determine an `object` result is from cache?
```ts
assert(retrieveCacheMetaFrom(data))
```


## Generation of Cache entry

- none of cacheName and key: `{className}.{methodName}` + serialization of method arguments
- cacheName string
  - key `string | number | bigint`: `{className}.{methodName}:{key.toString()}`
  - key `undefined`: `{className}.{methodName}` + serialization of method arguments
  - key `false`: no cache operation
  - key `KeyGenerator`
    - `undefined`: `{className}.{methodName}` + serialization of method arguments
    - `string`: `{className}.{methodName}:{key.toString()}` 
    - `false`: no cache operation

## Cacheable Decorator

supports class and method

`CacheableArgs` Parameters

| name      | type                                                             | default value            |
| --------- | ---------------------------------------------------------------- | ------------------------ |
| cacheName | string \| undefined                                              | {className}.{methodName} |
| key       | string \| number \| bigint \| KeyGenerator \| undefined \| false | undefined                |
| ttl       | number \| undefined                                              | 10(sec)                  |
| condition | CacheConditionFn \| boolean \| undefined                         | undefined (always cache) |

```ts
import { Cacheable } from '@mwcp/cache'

@Controller('/')
export class FooController {

  async hello(): Promise<string> {
    return this._hello()
  }

  /* cacheName will be `{class name}.{method name}` => "FooController.hello" */
  @Cacheable()
  async _hello(): Promise<string> {
    return 'world'
  }

  @Cacheable({ ttl: 5 })
  async _hello2(): Promise<string> {
    return 'world'
  }
}
```

```ts
import { Cacheable } from '@mwcp/cache'

@Cacheable() 
export class FooService {

  async hello(): Promise<string> {
    return 'hello'
  }

  @Cacheable({ ttl: 5 })  // override parameters of class decorator
  async hello2(): Promise<string> {
    return 'world'
  }

  @Cacheable({ key: 'bar' }) // cacheKey will be `FooService.hello2:bar`
  async hello2(): Promise<string> {
    return 'world'
  }

  @Cacheable({ key: (input: UserDTO) => input.uid.toString() }) // cacheKey will be `FooService.world:${uid}`
  async world(input: UserDTO): Promise<string> {
    return 'world'
  }

}
```

## CacheEvict Decorator

supports method

`CacheEvictArgs` Parameters

| name             | type                                                    | default value                             |
| ---------------- | ------------------------------------------------------- | ----------------------------------------- |
| cacheName        | string \| undefined                                     | {className}.{methodName}                  |
| key              | string \| number \| bigint \| KeyGenerator \| undefined | undefined                                 |
| beforeInvocation | boolean \| undefined                                    | false                                     |
| condition        | CacheConditionFn \| boolean \| undefined                | undefined (always evict)                  |
| result           | any \| undefined                                        | always undefined if beforeInvocation true |

```ts
import { Cacheable, CacheEvict } from '@mwcp/cache'

const cacheName = 'UserService.getOne' 

@Cacheable() 
export class UserService {

  @Cacheable({ cacheName })
  async getOne(): Promise<UserDTO> {
    return { uid: 1 }
  }

  @CacheEvict({ cacheName }) // same cacheName with getOne()
  async updateOne(): Promise<UserDTO> {
    return { uid: 2 }
  }
}
```

## CachePut Decorator

supports method

```ts
import { CachePut } from '@mwcp/cache'

const cacheName = 'FooRepo.getOne'

@Controller('/')
export class FooRepo {

  @Cacheable({ cacheName, ttl: 5 })
  async getOne(): Promise<string> {
    return 'world'
  }

  @CachePut({ cacheName })
  async update(): Promise<string> {
    return 'hello'
  }

}
```

## Decorator Generics
### Auto parameter type of keyGenerator from generics

```ts
import { Cacheable } from '@mwcp/cache'

@Cacheable() 
export class FooService {

  @Cacheable<FooService['world']>({  // pass generics and then input will get the type automatically
    key: ([input]) => input.uid.toString()
  }) // cacheKey will be `FooService.world:${uid}`
  async world(input: UserDTO): Promise<string> {
    return 'world'
  }

}
```

```ts
@Cacheable() 
export class FooService {
  @Cacheable<FooService['hello']>({  // <--- pass FooService['hello'] as method type
    key: (args) => args[0].uid.toString()   // <--- args 自动推导为类型 [UserDTO, string | undefined]
  }) 
  async hello(input: UserDTO, input2?: string): Promise<string> {
    return 'world'
  }
}
```


[More examples]


## License
[MIT](LICENSE)


### Languages
- [English](./README.md)
- [中文](./README.zh-CN.md)

<br>

[Midway.js]: https://midwayjs.org/
[Cache-Docs]: https://midwayjs.org/en/docs/extensions/cache
[Cache-Docs-EN]: https://midwayjs.org/en/docs/extensions/cache
[KeyGenerator]: https://github.com/waitingsong/midway-components/blob/main/packages/cache/src/lib/types.ts#L43
[More examples]: https://github.com/waitingsong/midway-components/tree/main/packages/cache/test/fixtures/base-app/src

