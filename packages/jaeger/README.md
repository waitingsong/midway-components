# midway-component-jaeger

Jaeger opentracing client component for midway.js

[![Version](https://img.shields.io/npm/v/midway-component-jaeger.svg)](https://www.npmjs.com/package/midway-component-jaeger)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## Install

```sh
npm i midway-component-jaeger
```

## Usage

Update project `src/configuration.ts`
```ts
import * as jaeger from 'midway-component-jaeger'

@Configuration({
  imports: [
    jaeger,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {
}
```

Update project `src/config/config.prod.ts`
```ts
import { TracerConfig, defaultTracerConfig } from 'midway-component-jaeger'

export const tracer: TracerConfig = {
  ...defaultTracerConfig,
  loggingOutputBody: true,
  reqThrottleMsForPriority: 300,
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 0.0001,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
}
```

Update project `src/config/config.(local | unittest).ts`
```ts
import { TracerConfig, defaultTracerConfig } from 'midway-component-jaeger'

export const tracer: TracerConfig = {
  ...defaultTracerConfig,
  loggingOutputBody: true,
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 1,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
}
```

## License

[MIT](LICENSE)

