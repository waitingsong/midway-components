# NPM mono repository


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/workflows/ci/badge.svg)](https://github.com/waitingsong/midway-components/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)



## Packages

| Package     | Version                      |
| ----------- | ---------------------------- |
| [`ali-oss`] | [![ali-oss-svg]][ali-oss-ch] |
| [`jaeger`]  | [![jaeger-svg]][jaeger-ch]   |
| [`jwt`]     | [![jwt-svg]][jwt-ch]         |
| [`taskman`] | [![taskman-svg]][taskman-ch] |


## Initialize and install dependencies

## Update package

```sh
npm run bootstrap
```

## Test

- Use `npm run lint` to check code style.
- Use `npm run test` to run unit test.

## Clan or Purge

```sh
# clean build dist, cache and build
npm run clean
# clean and remove all node_modules
npm run purge
```

## Note

- Run `npm run clean` before `npm run build`, if any file under typescript outDir folder was deleted manually.
- Default publish registry is `NPM`, configurated in file `lerna.json`
- Any commands above (such as `npm run build`) running in `Git-Bash` under Windows OS

## License
[MIT](LICENSE)


### Languages
- [English](README.md)
- [中文](README.zh-CN.md)

<br>

[`ali-oss`]: https://github.com/waitingsong/midway-components/tree/main/packages/ali-oss
[ali-oss-svg]: https://img.shields.io/npm/v/@mw-components/ali-oss.svg?maxAge=7200
[ali-oss-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/ali-oss/CHANGELOG.md

[`jaeger`]: https://github.com/waitingsong/midway-components/tree/main/packages/jaeger
[jaeger-svg]: https://img.shields.io/npm/v/@mw-components/jaeger.svg?maxAge=7200
[jaeger-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/jaeger/CHANGELOG.md

[`jwt`]: https://github.com/waitingsong/midway-components/tree/main/packages/jwt
[jwt-svg]: https://img.shields.io/npm/v/@mw-components/jwt.svg?maxAge=7200
[jwt-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/jwt/CHANGELOG.md

[`taskman`]: https://github.com/waitingsong/midway-components/tree/main/packages/taskman
[taskman-svg]: https://img.shields.io/npm/v/@mw-components/taskman.svg?maxAge=7200
[taskman-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/taskman/CHANGELOG.md

