# NPM mono repository


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/midway-components)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/midway-components/workflows/ci/badge.svg)](https://github.com/waitingsong/midway-components/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/midway-components/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)



## Packages

| Package      | Version                |
| ------------ | ---------------------- |
| [`demo`]     | [![main-svg]][main-ch] |
| [`demo-cli`] | [![cli-svg]][cli-ch]   |

## Initialize and install dependencies

run it at first time and any time
```sh
npm run repo:init
```


## Compile

Run under root folder
```sh
npm run build
# specify scope
npm run build @scope/demo-docs
# specify scopes
npm run build @scope/demo-docs @scope/demo-serivce
```


## Update package

```sh
npm run bootstrap
```

## Add package

```sh
npm run add:pkg new_module
```

## Test

- Use `npm run lint` to check code style.
- Use `npm run test` to run unit test.

## Clan or Purge

```sh
# clean build dist, cache and build
npm run reset
# clean and remove all node_modules
npm run purge && npm run bootstrap && npm run build
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

[`demo`]: https://github.com/waitingsong/npm-mono-base/tree/main/packages/demo
[main-svg]: https://img.shields.io/npm/v/kmore.svg?maxAge=7200
[main-ch]: https://github.com/waitingsong/kmore/tree/main/packages/demo/CHANGELOG.md
[main-d-svg]: https://david-dm.org/waitingsong/kmore.svg?path=packages/kmore
[main-d-link]: https://david-dm.org/waitingsong/kmore.svg?path=packages/kmore
[main-dd-svg]: https://david-dm.org/waitingsong/kmore/dev-status.svg?path=packages/kmore
[main-dd-link]: https://david-dm.org/waitingsong/kmore?path=packages/kmore#info=devDependencies

[`demo-cli`]: https://github.com/waitingsong/kmore/tree/main/packages/kmore-cli
[cli-svg]: https://img.shields.io/npm/v/kmore-cli.svg?maxAge=7200
[cli-ch]: https://github.com/waitingsong/kmore/tree/main/packages/kmore-clie/CHANGELOG.md
[cli-d-svg]: https://david-dm.org/waitingsong/kmore.svg?path=packages/kmore-cli
[cli-d-link]: https://david-dm.org/waitingsong/kmore.svg?path=packages/kmore-cli
[cli-dd-svg]: https://david-dm.org/waitingsong/kmore/dev-status.svg?path=packages/kmore-cli
[cli-dd-link]: https://david-dm.org/waitingsong/kmore?path=packages/kmore-cli#info=devDependencies

