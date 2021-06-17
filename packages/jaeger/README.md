# @mw-components/jaeger

Jaeger opentracing client component for midway.js

[![Version](https://img.shields.io/npm/v/@mw-components/jaeger.svg)](https://www.npmjs.com/package/@mw-components/jaeger)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## Install

```sh
npm i @mw-components/jaeger
```

## Usage

Update project `src/configuration.ts`
```ts
import * as jaeger from '@mw-components/jaeger'

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
import { TracerConfig, defaultTracerConfig } from '@mw-components/jaeger'

export const tracer: TracerConfig = {
  ...defaultTracerConfig,
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
import { TracerConfig, defaultTracerConfig } from '@mw-components/jaeger'

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

