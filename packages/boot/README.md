# Midway.js Boot Component

Various midway.js components integrated


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/workflows/ci/badge.svg)](https://github.com/waitingsong/midway-components/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Install

```sh
npm i @mwcp/boot
```


## Config

Update your project `src/configuration.ts`

```ts
import * as boot from '@mwcp/boot'
@Configuration({
  importConfigs: [join(__dirname, 'config')],
  imports: [
    boot,
    // others...
  ],
})
export class ContainerConfiguration implements ILifeCycle { }
```


## License
[MIT](LICENSE)



<br>
