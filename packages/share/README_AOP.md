## `customDecoratorFactory()` 自定义装饰器生命期


### 方法能力

| 方法        | 修改入参 | 调用原方法 | 获取返回值 | 修改返回值 | 获取异常 | 抛出异常 |
| ----------- | :------: | :--------: | :--------: | :--------: | :------: | :------: |
| before      |    ✔ ️    |     ✔      |            |            |          |    ✔     |
| around      |    ✔     |     ✔      |     ✔      |     ✔      |    ✔     |    ✔     |
| afterReturn |          |            |     ✔      |     ✔      |          |    ✔     |
| after       |          |            |     ✔      |            |  ✔ (1)   |    ✔     |
| afterThrow  |          |            |            |            |    ✔     |    ✔     |


### 备注

- `afterThrow` 方法可以获得所有生命周期抛出的异常，除了自己
- 方法通过入参 `options.error` 变量获取异常
- Boolean `options.errorProcessed` 变量标识异常是否被 `afterThrow` 处理过

- (1) 当获得异常时 `options.errorProcessed` 为 `true`
