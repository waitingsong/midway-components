# @mwcp/cache

[Midway.js] 声明式缓存组件

[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![Version](https://img.shields.io/npm/v/@mwcp/cache.svg)](https://www.npmjs.com/package/midway-components)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/workflows/ci/badge.svg)](https://github.com/waitingsong/midway-components/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## 安装依赖

```sh
npm i @mwcp/cache
```

## 更新配置

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

更改默认设置，通过文件 `src/config/config.{default | prod | unittest}.ts`
```ts
import { CacheConfig } from '@mwcp/cache'

export const cacheConfig: CacheConfig = {
  store: 'memory',
  options: {
    max: 512,
    ttl: 10,
  },
}
```

## 使用

Normal [Cache-Docs]


## Cacheable 装饰器

supports class and method

`CacheableArgs` Parameters

| name      | type                                                    | default value            |
| --------- | ------------------------------------------------------- | ------------------------ |
| cacheName | string \| undefined                                     | {className}.{methodName} |
| key       | string \| number \| bigint \| KeyGenerator \| undefined | undefined                |
| ttl       | number \| undefined                                     | 10(sec)                  |
| condition | CacheConditionFn \| boolean \| undefined                | undefined (always cache) |

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

  @Cacheable<FooService['world']>({  // pass generics and then input will get the type automatically
    key: input => input.uid.toString()
  }) // cacheKey will be `FooService.world:${uid}`
  async world(input: UserDTO): Promise<string> {
    return 'world'
  }
}
```

## CacheEvict 装饰器

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

## CachePut 装饰器

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

## 装饰器泛型

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

