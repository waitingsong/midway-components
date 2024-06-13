# [Midway.js] Components


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/actions/workflows/nodejs.yml/badge.svg
)](https://github.com/waitingsong/midway-components/actions)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Note

ESM build only, requires `@midwayjs >= 3.15` and set `"type": "module"` in `packages.json`

## Packages

| Package     | Version                      |
| ----------- | ---------------------------- |
| [`share`]   | [![share-svg]][share-ch]     |
| [`ali-oss`] | [![ali-oss-svg]][ali-oss-ch] |
| [`cache`]   | [![cache-svg]][cache-ch]     |
| [`jwt`]     | [![jwt-svg]][jwt-ch]         |
| [`otel`]    | [![otel-svg]][otel-ch]       |


## Initialize and install dependencies

## 安装全局依赖
```sh
npm i -g c8 lerna madge rollup tsx zx
```

## Update package

```sh
npm i && npm run build
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

[Midway.js]: https://midwayjs.org/

[`ali-oss`]: https://github.com/waitingsong/midway-components/tree/main/packages/ali-oss
[ali-oss-svg]: https://img.shields.io/npm/v/@mwcp/ali-oss.svg?maxAge=7200
[ali-oss-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/ali-oss/CHANGELOG.md

[`cache`]: https://github.com/waitingsong/midway-components/tree/main/packages/cache
[cache-svg]: https://img.shields.io/npm/v/@mwcp/cache.svg?maxAge=7200
[cache-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/cache/CHANGELOG.md

[`jwt`]: https://github.com/waitingsong/midway-components/tree/main/packages/jwt
[jwt-svg]: https://img.shields.io/npm/v/@mwcp/jwt.svg?maxAge=7200
[jwt-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/jwt/CHANGELOG.md

[`otel`]: https://github.com/waitingsong/midway-components/tree/main/packages/otel
[otel-svg]: https://img.shields.io/npm/v/@mwcp/otel.svg?maxAge=7200
[otel-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/otel/CHANGELOG.md

[`share`]: https://github.com/waitingsong/midway-components/tree/main/packages/share
[share-svg]: https://img.shields.io/npm/v/@mwcp/share.svg?maxAge=7200
[share-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/share/CHANGELOG.md

