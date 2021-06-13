# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 6.4.0 (2021-06-13)


### Features

* **jaeger:** add tags pid and ppid after start span ([728ef94](https://github.com/waitingsong/midway-components/commit/728ef94cc628ca7be9d5bd56b206e7162c7ddaf2))





# 6.3.0 (2021-06-10)


### Features

* **jaeger:** update defaultTracerConfig.loggingReqHeaders with 'host' ([ec5150e](https://github.com/waitingsong/midway-components/commit/ec5150ed526ee74b32dedc2a508ca1e76082a773))





# 6.2.0 (2021-06-10)


### Features

* **jaeger:** sample request path and protocol ([cf83e9d](https://github.com/waitingsong/midway-components/commit/cf83e9d9b1db7910323f6191f31810fd65fc7c5f))





# 6.1.0 (2021-06-10)


### Features

* **jaeger:** export defaultTracerConfig ([2f54e1f](https://github.com/waitingsong/midway-components/commit/2f54e1f83b3566de3245f086ecfdf12ba0f5e976))





# 6.0.0 (2021-06-10)


### Features

* **jaeger:** catch exception at two stages ([316cbfc](https://github.com/waitingsong/midway-components/commit/316cbfc78d4bc8b455b949cbcdf01ca823ae7acb))





# 5.1.0 (2021-06-10)


### Features

* **jaeger:** call processRequestQuery() in tracer-ext.middleware ([7d4538b](https://github.com/waitingsong/midway-components/commit/7d4538bddf77e944f23babecf39832ee5e241ff2))





# 5.0.0 (2021-06-10)

**Note:** Version bump only for package midway-component-jaeger





# 4.0.0 (2021-06-09)


### Features

* **jaeger:** logging specify headers with TracerConfig['loggingReqHeaders'] ([a51acd9](https://github.com/waitingsong/midway-components/commit/a51acd9b813c9634de9ad746f5b498599fe328db))





# 3.6.0 (2021-06-09)


### Features

* **jaeger:** add TracerTag.httpAuthorization ([eef6bae](https://github.com/waitingsong/midway-components/commit/eef6bae59152276df3575be7e3cb88002ee6f711))





# 3.5.0 (2021-06-09)


### Features

* **jaeger:** remove type declaration of egg.EggAppConfig ([d1c88d5](https://github.com/waitingsong/midway-components/commit/d1c88d59e54c0dbac37da48bd4dbcf8ec1d2e9cd))





## 3.4.1 (2021-06-09)

**Note:** Version bump only for package midway-component-jaeger





# 3.4.0 (2021-06-07)


### Features

* **jaeger:** headerOfCurrentSpan() accept optional current span ([4e3d769](https://github.com/waitingsong/midway-components/commit/4e3d76996d3aaf3b61a7be86e471b4bba86ad694))





# 3.3.0 (2021-06-04)

**Note:** Version bump only for package midway-component-jaeger





# 3.2.0 (2021-06-04)

**Note:** Version bump only for package midway-component-jaeger





# 3.1.0 (2021-06-04)


### Features

* **jaeger:** sample request user-agent ([e239a64](https://github.com/waitingsong/midway-components/commit/e239a64e8ca8ea66ba6a77040d221bf06e62f435))





## 3.0.1 (2021-06-03)

**Note:** Version bump only for package midway-component-jaeger





# 3.0.0 (2021-06-03)

**Note:** Version bump only for package midway-component-jaeger





# 2.4.0 (2021-06-03)


### Features

* **jaeger:** add TracerTag.logLevel ([41addd5](https://github.com/waitingsong/midway-components/commit/41addd5831fa17b3016d6b3322adf47e354cd468))





## 2.3.1 (2021-06-03)

**Note:** Version bump only for package midway-component-jaeger





# 2.3.0 (2021-06-03)


### Features

* **jaeger:** info of tracerLogger() accept SpanLogInput ([0da7932](https://github.com/waitingsong/midway-components/commit/0da7932b70a9ae658ae346c11a85c4b732425d18))





# 2.2.0 (2021-06-03)


### Features

* **jaeger:** change LogInfo['level'] optional ([d16f460](https://github.com/waitingsong/midway-components/commit/d16f460f33cc8c170da2e554ad95a16c3db8d337))





# 2.1.0 (2021-06-03)


### Features

* **jaeger:** change LogInfo ([df9c959](https://github.com/waitingsong/midway-components/commit/df9c959c3bdae060fb37afc8c703d2d0d269a63d))





# 2.0.0 (2021-06-03)


### Features

* **jaeger:** change parameter of tracerLogger() ([4a6e208](https://github.com/waitingsong/midway-components/commit/4a6e208bf16128b5de23f7b89624c253e5ea0ffb))





# 1.3.0 (2021-06-03)


### Features

* **jaeger:** refactor tracerLogger() with optional parameter span ([c2b35f2](https://github.com/waitingsong/midway-components/commit/c2b35f20f60dd49ba3165a76dfd68479d2535021))





# 1.2.0 (2021-06-03)


### Features

* **jaeger:** add TracerLog.queryCostThottleInMS ([1e4ea45](https://github.com/waitingsong/midway-components/commit/1e4ea45ddd0e85867d2759307c3d60f9efafc89c))





## 1.1.1 (2021-05-28)

**Note:** Version bump only for package midway-component-jaeger





# 1.1.0 (2021-05-28)


### Features

* **jaeger:** memoryUsage via humanMemoryUsage() ([3a6ce13](https://github.com/waitingsong/midway-components/commit/3a6ce13ca032a58a8cc99b448c1b0f8c8f7cb3a4))





## 1.0.1 (2021-05-28)

**Note:** Version bump only for package midway-component-jaeger





# 1.0.0 (2021-05-28)


### Features

* **jaeger:** sample process.memoryUsage() ([6e358f0](https://github.com/waitingsong/midway-components/commit/6e358f0cddbf968caeddaaa7b06588f8d94dafea))





# 0.4.0 (2021-05-27)


### Features

* **jaeger:** log with time via genISO8601String() ([513d50f](https://github.com/waitingsong/midway-components/commit/513d50f87dfe86bf45a341dfdae93ffc973e7500))





# 0.3.0 (2021-05-27)


### Bug Fixes

* **jaeger:** Logger ([373bf7d](https://github.com/waitingsong/midway-components/commit/373bf7d8e650053775609085ff4c97d5ba708628))





# 0.2.0 (2021-05-27)


### Features

* **jaeger:** set component namespace: jaeger ([096ee5a](https://github.com/waitingsong/midway-components/commit/096ee5a5ca7c8a60f17f2acf8e7b3d1eb7bfe2b2))





## 0.1.1 (2021-05-26)

**Note:** Version bump only for package @waiting/midway-component-jaeger





# 0.1.0 (2021-05-26)


### Features

* **jaeger:** change registerMiddleware() not throw error if appMiddleware invalid ([d21de2f](https://github.com/waitingsong/midway-components/commit/d21de2f72729d6a81b4ad0887f48435fdb3c8498))





## 0.0.1 (2021-05-26)

**Note:** Version bump only for package @waiting/midway-component-jaeger
