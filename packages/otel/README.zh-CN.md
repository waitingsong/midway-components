# @mwcp/otel

Open Telemetry Component for Midway.js

[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![Version](https://img.shields.io/npm/v/@mwcp/otel.svg)](https://www.npmjs.com/package/midway-components)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/actions/workflows/nodejs.yml/badge.svg
)](https://github.com/waitingsong/midway-components/actions)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Note

ESM build only, requires `@midwayjs >= 3.16` and set `"type": "module"` in `packages.json`


## 支持协议

- HTTP
- [gRPC (Unary)]

## 安装依赖

```sh
npm i @mwcp/otel
```

## 更新配置

Update project `src/configuration.ts`
```ts
import { Configuration } from '@midwayjs/decorator'
import * as koa from '@midwayjs/koa'
import * as otel from '@mwcp/otel'

@Configuration({
  imports: [
    koa,
    otel,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {
}
```

## 使用

- [Exporter][Exporter]
- [Exporter Configuration][Exporter Configuration]

使用 [Jaeger] 容器快速启动一个 [OTLPTraceExporter][Exporter Configuration] 服务：
```sh
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest
```

启动项目：
```sh
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
npm start
```

Jaeger Web UI address:
> http://localhost:16686/


## `Trace` 装饰器

```ts
import { Trace } from '@mwcp/otel'

@Controller('/')
export class FooController {

  @Inject() readonly svc: FooService

  /* span name will be `{class name}/{method name}` => "FooController/hello" */
  @Trace()
  async hello(): Promise<string> {
    return 'hello'
  }

  /* span name will be "hello" */
  @Trace('hello')
  async world(): Promise<string> {
    return 'world'
  }

  @Trace({
    spanName: 'hello'
  })
  async world2(): Promise<string> {
    return 'world'
  }
}
```

使用 `scope` 避免异步方法并发请求时调用链混乱

```ts
import { Trace } from '@mwcp/otel'

@Controller('/')
export class FooController {

  @Trace()
  async hello(): Promise<string> {
    await Promise.all([
      this._simple1(),
      this._simple2(),
    ])
    return 'OK'
  }

  @Trace({ scope: 'hello1' })
  async _hello1(): Promise<string> {
    return 'world'
  }

  @Trace({ scope: 'hello2' })
  async _hello2(): Promise<string> {
    return 'world'
  }

  @Trace({ scope: 'hello1' })
  async _hello1a(): Promise<string> {
    return 'world'
  }

  @Trace({ scope: 'hello2' })
  async _hello2a(): Promise<string> {
    return 'world'
  }
}
```

![Trace Info](img/trace-scope.png)


在 `before()` `after()` 内使用指向被装饰类实例的 `this`

```ts
export class FooService {
  foo = 1

  @Trace<Foo['home']>({
    before([options], decoratorContext) {
      assert(this instanceof FooService) // <--- this point to FooService 
      assert(this === decoratorContext.instance)
      assert(this.foo === 1)

      return void 0
    },
    after([options], res, decoratorContext) {
      assert(this instanceof FooService)
      assert(this === decoratorContext.instance)
      assert(this.foo === 1)

      return void 0
    },
  })
  async home(this: FooService, options: InputOptions): Promise<string> { // <--- pass this type explicitly
    const ret = await options.input
    return ret
  }
}
```

## `TraceLog` 装饰器

通过装饰器的 `before()`/`after()` 方法返回对象给当前Span和根Span添加 tag/log 信息，
不会新建 Span 

装饰器参数 `before()`  `after()` 返回类型应该是：
```ts
interface DecoratorTraceData {
  attrs?: Attributes
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes
}
```


```ts
import { TraceLog, DecoratorTraceData } from '@mwcp/otel'

@Controller('/')
export class FooController {

  @Trace()
  async hello(): Promise<string> {
    return 'hello'
  }

  @TraceLog({
    before: async ([input], { instanceName, methodName }) => {
      const attrs: Attributes = {
        args0: input,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      const rootAttrs: Attributes = { rootAttrs: 'rootAttrs' }
      const rootEvents: Attributes = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents } as DecoratorTraceDataResp
    },
    after: ([input], res, { instanceName, methodName }) => {
      const attrs: Attributes = {
        args0: input,
        res,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      return { events }
    },
  })
  async world(): Promise<string> {
    return 'world'
  }
}
```



## `TraceInit` 装饰器

```ts
// src/configuration.ts
import { TraceInit } from '@mwcp/otel'

export class AutoConfiguration implements ILifeCycle {
  @TraceInit({ namespace: 'Foo' })
  async onReady(container: IMidwayContainer): Promise<void> {
    // some code
  }
}
```





## 装饰器泛型参数
### 从泛型参数自动获取方法调用参数类型

```ts
@Controller('/')
export class FooController {

  @Inject() readonly svc: FooService

  hello(): string {
    // spanName should be 'foo-124-abc'
    const msg = this.svc.concat(123, 'abc')
    return msg
  }
}

@Provide()
export class FooService {
  @Trace<FooService['concat']>({
    spanName: ([v1, v2]) => `foo-${v1 + 1}-${v2}`,
  })
  concat(v1: number, v2: string): string {
    return `${v1.toString()}-${v2}`
  }

  @Trace<FooService['concat2']>({
    spanName: (args) => `foo-${args[0] + 1}-${args[1]}`,
  })
  concat2(v1: number, v2: string): string {
    return `${v1.toString()}-${v2}`
  }
}
```


## License
[MIT](LICENSE)


### Languages
- [English](./README.md)
- [中文](./README.zh-CN.md)

<br>

[Exporter]: https://opentelemetry.io/docs/instrumentation/js/exporters/
[Exporter Configuration]: https://opentelemetry.io/docs/reference/specification/protocol/exporter/#configuration-options
[Jaeger]: https://www.jaegertracing.io/

[gRPC (Unary)]: https://github.com/midwayjs/midway/tree/main/packages/grpc

