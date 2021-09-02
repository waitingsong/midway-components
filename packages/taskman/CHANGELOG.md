# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [13.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@12.0.1...@mw-components/taskman@13.0.0) (2021-09-02)


### Bug Fixes

* **taskman:** define taskAgentConfig ([996e7c7](https://github.com/waitingsong/midway-components/commit/996e7c7a9bb6b6debfe5a408ddb21a2fb6fa5264))





## [12.0.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@12.0.0...@mw-components/taskman@12.0.1) (2021-09-02)

**Note:** Version bump only for package @mw-components/taskman





# [12.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@11.0.0...@mw-components/taskman@12.0.0) (2021-09-02)


### Bug Fixes

* **taskman:** event process within TaskAgentService:run() and TaskAgentService:stop() ([26f33fa](https://github.com/waitingsong/midway-components/commit/26f33fa87145c7782b02b9af16c2b40c28e931c9))
* **taskman:** expectStart value not update when create task ([dae504c](https://github.com/waitingsong/midway-components/commit/dae504c68ba6ff450d0a8ece0200ac7135c7ae15))


### Features

* **taskman:** add api /task_agent/start ([362edc6](https://github.com/waitingsong/midway-components/commit/362edc657e1584d533a8b981c00759c5f56d0909))
* **taskman:** start agent when create task ([3f34224](https://github.com/waitingsong/midway-components/commit/3f342243563d9083705c900b51aecaf2fda9515a))
* **taskman:** start one agent via /ping by config taskAgentConfig.enableStartOneByPing ([86a2c4c](https://github.com/waitingsong/midway-components/commit/86a2c4cb7fc477946ef51ea6af1b6a52535def04))
* **taskman:** use taskAgentSubscriptionMap instead of agentConcurrentConfig.count ([629aced](https://github.com/waitingsong/midway-components/commit/629aced3b48a6273025163b75c9289c93e5fe6eb))





# 11.0.0 (2021-09-01)


### Features

* **taskman:** breaking change params of processJsonHeaders() ([042b021](https://github.com/waitingsong/midway-components/commit/042b021fbdd45175dacfd14a1000172909b47686))
* **taskman:** httpCall() using new span for request header ([be9b6f8](https://github.com/waitingsong/midway-components/commit/be9b6f8e9093654a1e98395f878f160ee75d35b5))





## [10.0.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@10.0.0...@mw-components/taskman@10.0.1) (2021-08-31)

**Note:** Version bump only for package @mw-components/taskman





# [10.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.1.2...@mw-components/taskman@10.0.0) (2021-08-31)

**Note:** Version bump only for package @mw-components/taskman





## 9.1.2 (2021-08-30)

**Note:** Version bump only for package @mw-components/taskman





## 9.1.1 (2021-08-19)


### Bug Fixes

* **taskman:** TaskQueueRepository.pickInitTasksToPending() condition ([bcd71b3](https://github.com/waitingsong/midway-components/commit/bcd71b38aec84442a1adb2b7462e5a554298735e))





# [9.1.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.0.5...@mw-components/taskman@9.1.0) (2021-08-12)


### Features

* **taskman:** decrease initDbConfig.pool.max to 10 ([f650c83](https://github.com/waitingsong/midway-components/commit/f650c833617eb81c7b21f54ba55e54dc1a4fa908))





## [9.0.5](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.0.4...@mw-components/taskman@9.0.5) (2021-08-12)

**Note:** Version bump only for package @mw-components/taskman





## [9.0.4](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.0.3...@mw-components/taskman@9.0.4) (2021-08-10)

**Note:** Version bump only for package @mw-components/taskman





## [9.0.3](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.0.2...@mw-components/taskman@9.0.3) (2021-08-10)


### Bug Fixes

* **taskman:** takeWhile operator ([39e89c6](https://github.com/waitingsong/midway-components/commit/39e89c6a731c29307193d25eb6787262d76c9ae5))





## [9.0.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.0.1...@mw-components/taskman@9.0.2) (2021-08-10)


### Bug Fixes

* **taskman:** takeWhile return value ([5e606ca](https://github.com/waitingsong/midway-components/commit/5e606cae2dedb1281b7438714346813ec7094856))





## [9.0.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@9.0.0...@mw-components/taskman@9.0.1) (2021-08-10)

**Note:** Version bump only for package @mw-components/taskman





# [9.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@8.0.2...@mw-components/taskman@9.0.0) (2021-08-10)


### Features

* **taskman:** add TaskManClientConfig['minPickTaskCount'] ([63a39ca](https://github.com/waitingsong/midway-components/commit/63a39cafead892320cf30a0ed103af0ab10ed7ea))





## [8.0.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@8.0.1...@mw-components/taskman@8.0.2) (2021-08-09)


### Bug Fixes

* **taskman:** decreaseTaskRunnerCount() ([a372c46](https://github.com/waitingsong/midway-components/commit/a372c46d167e07789950ebbae308b1a26516c968))





## [8.0.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@8.0.0...@mw-components/taskman@8.0.1) (2021-08-09)


### Bug Fixes

* **taskman:** handle httpCode 429 from exception by resetTaskToInitDueTo429() ([38ae396](https://github.com/waitingsong/midway-components/commit/38ae39630c78be76d0ad24105d8c92a786bcf565))





# [8.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@7.0.5...@mw-components/taskman@8.0.0) (2021-08-09)


### Features

* **taskman:** set taskState to init if TaskRunner return httpCode 429 ([c260e55](https://github.com/waitingsong/midway-components/commit/c260e55b6fcde03801ae76c87c2d9fdc9f2c21f1))





## [7.0.5](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@7.0.4...@mw-components/taskman@7.0.5) (2021-08-09)

**Note:** Version bump only for package @mw-components/taskman





## [7.0.4](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@7.0.3...@mw-components/taskman@7.0.4) (2021-08-09)

**Note:** Version bump only for package @mw-components/taskman





## [7.0.3](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@7.0.2...@mw-components/taskman@7.0.3) (2021-08-09)

**Note:** Version bump only for package @mw-components/taskman





## [7.0.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@7.0.1...@mw-components/taskman@7.0.2) (2021-08-09)

**Note:** Version bump only for package @mw-components/taskman





## [7.0.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@7.0.0...@mw-components/taskman@7.0.1) (2021-08-09)

**Note:** Version bump only for package @mw-components/taskman





# [7.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@6.0.0...@mw-components/taskman@7.0.0) (2021-08-09)

**Note:** Version bump only for package @mw-components/taskman





# [6.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@5.0.0...@mw-components/taskman@6.0.0) (2021-08-09)


### Features

* **taskman:** change type TaskProgressDetailDTO ([990a815](https://github.com/waitingsong/midway-components/commit/990a815b3d254008299c0a91937350880b42cf12))





# [5.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.8.0...@mw-components/taskman@5.0.0) (2021-08-09)


### Bug Fixes

* **taskman:** calling order of decreaseRunningTaskCount() ([bcd0146](https://github.com/waitingsong/midway-components/commit/bcd01464c1d2bf9b5428c45f7b742a4eb1db88c5))


### Features

* **taskman:** add TaskManClientConfig['maxRunner'] ([2e25e54](https://github.com/waitingsong/midway-components/commit/2e25e54c1f70ebe53e468bcd794e7e7d0d9ad3c7))
* **taskman:** catch task exception ([fbfbace](https://github.com/waitingsong/midway-components/commit/fbfbace168c078dfd14a99f13ca09560a7354aaf))
* **taskman:** export increaseTaskRunnerCount(), decreaseTaskRunnerCount() ([38ff988](https://github.com/waitingsong/midway-components/commit/38ff9888e982b13249ec69af4ae7e3cece04225f))





# [4.8.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.7.0...@mw-components/taskman@4.8.0) (2021-08-06)


### Features

* **taskman:** increase taskRunningState.max to 4 ([0d5e9ff](https://github.com/waitingsong/midway-components/commit/0d5e9ff81de99f4eca43e9958be90caf8c176a5e))





# [4.7.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.7...@mw-components/taskman@4.7.0) (2021-08-06)


### Features

* **taskman:** export variable taskRunningState ([35fe986](https://github.com/waitingsong/midway-components/commit/35fe9866ffd0f3b98e1e614c7fa6e6aa7d6e8e64))





## [4.6.7](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.6...@mw-components/taskman@4.6.7) (2021-08-03)


### Bug Fixes

* **taskman:** process response format ([13ef17e](https://github.com/waitingsong/midway-components/commit/13ef17e5fb36ec6efc7d990708e984a158038c6c))





## [4.6.6](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.5...@mw-components/taskman@4.6.6) (2021-08-03)


### Bug Fixes

* **taskman:** variable may undefined ([c129059](https://github.com/waitingsong/midway-components/commit/c1290593e7fa6b053356629acda5d908d89360e5))





## [4.6.5](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.4...@mw-components/taskman@4.6.5) (2021-08-03)

**Note:** Version bump only for package @mw-components/taskman





## [4.6.4](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.3...@mw-components/taskman@4.6.4) (2021-08-03)

**Note:** Version bump only for package @mw-components/taskman





## [4.6.3](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.2...@mw-components/taskman@4.6.3) (2021-08-03)

**Note:** Version bump only for package @mw-components/taskman





## [4.6.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.1...@mw-components/taskman@4.6.2) (2021-08-03)


### Bug Fixes

* **taskman:** process msg ([8b0ba73](https://github.com/waitingsong/midway-components/commit/8b0ba7307162c3e97c42276e5c55e31f880ee2ee))





## [4.6.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.6.0...@mw-components/taskman@4.6.1) (2021-08-03)

**Note:** Version bump only for package @mw-components/taskman





# [4.6.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.5.0...@mw-components/taskman@4.6.0) (2021-08-02)


### Features

* **taskman:** decrease initTaskManClientConfig.maxPickTaskCount to 10 ([6d9275a](https://github.com/waitingsong/midway-components/commit/6d9275a4c6bdfb0215af8df39c9f57b5491e0e77))





# [4.5.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.4.0...@mw-components/taskman@4.5.0) (2021-07-30)


### Features

* **jaeger:** 任务分发器span ([00f7892](https://github.com/waitingsong/midway-components/commit/00f7892ec244cd30a957b13b34afdb84dbe2e044))
* **taskman:** undo orphan span ([b635907](https://github.com/waitingsong/midway-components/commit/b635907abf5fbedd77d984760e4d5c8c48bf859c))
* 创建任务添加默认header ([5b338fd](https://github.com/waitingsong/midway-components/commit/5b338fd053fcf42bd07665035383766e6415d2dd))





# [4.4.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.3.0...@mw-components/taskman@4.4.0) (2021-07-28)


### Features

* **jaeger:** 任务分发器span ([00f7892](https://github.com/waitingsong/midway-components/commit/00f7892ec244cd30a957b13b34afdb84dbe2e044))
* 创建任务添加默认header ([5b338fd](https://github.com/waitingsong/midway-components/commit/5b338fd053fcf42bd07665035383766e6415d2dd))





# [4.3.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.2.1...@mw-components/taskman@4.3.0) (2021-07-28)


### Bug Fixes

* 链路层级错误 ([9bfc203](https://github.com/waitingsong/midway-components/commit/9bfc20363a5392cc60b2fae1c82a44d4ed065d22))


### Features

* 创建任务添加默认header ([5b338fd](https://github.com/waitingsong/midway-components/commit/5b338fd053fcf42bd07665035383766e6415d2dd))





## [4.2.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.2.0...@mw-components/taskman@4.2.1) (2021-07-28)

**Note:** Version bump only for package @mw-components/taskman





# [4.2.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.1.1...@mw-components/taskman@4.2.0) (2021-07-28)


### Features

* 创建任务添加默认header ([5b338fd](https://github.com/waitingsong/midway-components/commit/5b338fd053fcf42bd07665035383766e6415d2dd))





## [4.1.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.1.0...@mw-components/taskman@4.1.1) (2021-07-27)

**Note:** Version bump only for package @mw-components/taskman





# [4.1.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@4.0.0...@mw-components/taskman@4.1.0) (2021-07-19)


### Features

* **taskman:** add FK task_id of tb_task_payload.sql ([f81f98a](https://github.com/waitingsong/midway-components/commit/f81f98ac14fbe98ed8e7d77bdc3d09da871d0eb2))





# [4.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.3.1...@mw-components/taskman@4.0.0) (2021-07-19)

**Note:** Version bump only for package @mw-components/taskman





## [3.3.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.3.0...@mw-components/taskman@3.3.1) (2021-07-15)

**Note:** Version bump only for package @mw-components/taskman





# [3.3.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.2.2...@mw-components/taskman@3.3.0) (2021-07-15)


### Features

* **taskman:** change DbConfig['pool'] required and set propagateCreateError default value ([3ef5b85](https://github.com/waitingsong/midway-components/commit/3ef5b8516f133fb5b7804429b89850b792ee907e))





## [3.2.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.2.1...@mw-components/taskman@3.2.2) (2021-07-14)

**Note:** Version bump only for package @mw-components/taskman





## [3.2.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.2.0...@mw-components/taskman@3.2.1) (2021-07-14)

**Note:** Version bump only for package @mw-components/taskman





# [3.2.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.1.0...@mw-components/taskman@3.2.0) (2021-07-14)


### Features

* **taskman:** initialize TaskAgentService when necessary ([dee8aa1](https://github.com/waitingsong/midway-components/commit/dee8aa1d5870e05e35b852a97038d35887f597ab))





# [3.1.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@3.0.0...@mw-components/taskman@3.1.0) (2021-07-13)


### Features

* **taskman:** not assign repo._dbManager ([b164018](https://github.com/waitingsong/midway-components/commit/b164018f32f75983329f1abf04bf025379c0f05b))





# [3.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@2.2.0...@mw-components/taskman@3.0.0) (2021-07-13)


### Features

* **taskman:** bump deps ([ed6ed50](https://github.com/waitingsong/midway-components/commit/ed6ed50f0d1ca286c3600ab8f7905dfb6c2f21f6))





# [2.2.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@2.1.2...@mw-components/taskman@2.2.0) (2021-07-09)


### Features

* **taskman:** do not call this.db.unsubscribe() with repo.destroy() ([e2c4fe4](https://github.com/waitingsong/midway-components/commit/e2c4fe4de6d95412eefd4073333b6ff6a304dde3))
* **taskman:** log reqId within processHttpCallExp() ([a03ed55](https://github.com/waitingsong/midway-components/commit/a03ed55144eddb1f3ce3f77e26346900578ccac5))





## [2.1.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@2.1.1...@mw-components/taskman@2.1.2) (2021-07-09)


### Bug Fixes

* **taskman:** field name converted to taskState ([c72bde2](https://github.com/waitingsong/midway-components/commit/c72bde2f8031bf72739b0a36203912dabb739faa))





## [2.1.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@2.1.0...@mw-components/taskman@2.1.1) (2021-07-09)

**Note:** Version bump only for package @mw-components/taskman





# [2.1.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@2.0.0...@mw-components/taskman@2.1.0) (2021-07-08)


### Features

* **taskman:** add TaskManClientConfig properties ([1e2901f](https://github.com/waitingsong/midway-components/commit/1e2901f6b7ea8d001b20be18f090725257c6dff9))





# [2.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.5.0...@mw-components/taskman@2.0.0) (2021-07-08)

**Note:** Version bump only for package @mw-components/taskman





# [1.5.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.4.0...@mw-components/taskman@1.5.0) (2021-07-08)


### Features

* **taskman:** add destroy() for servier and repo ([26d0f11](https://github.com/waitingsong/midway-components/commit/26d0f11934bf5e6d0a68a9891e081c05da734b5e))





# [1.4.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.3.2...@mw-components/taskman@1.4.0) (2021-07-07)


### Features

* **taskman:** decrease intv time to 10(s) ([7b857fa](https://github.com/waitingsong/midway-components/commit/7b857fa8a80252cefc1c14ea2033969e616a9d6d))





## [1.3.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.3.1...@mw-components/taskman@1.3.2) (2021-07-07)

**Note:** Version bump only for package @mw-components/taskman





## [1.3.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.3.0...@mw-components/taskman@1.3.1) (2021-07-07)

**Note:** Version bump only for package @mw-components/taskman





# [1.3.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.2.0...@mw-components/taskman@1.3.0) (2021-07-07)


### Features

* **taskman:** tracing query response with DbConfig['tracingResponse'] ([911468d](https://github.com/waitingsong/midway-components/commit/911468dbf2c1853a55760dd8cdd18c0f21145224))





# [1.2.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.1.0...@mw-components/taskman@1.2.0) (2021-07-07)


### Features

* **taskman:** append headers when request to taskAgent api ([a326ff0](https://github.com/waitingsong/midway-components/commit/a326ff0d59cad2ec514a6396dee24b2577ea24bb))
* **taskman:** set global fetch timeout to 60(s) ([41317c4](https://github.com/waitingsong/midway-components/commit/41317c4f4fe851cba41af34c2356d74cfe6d8240))





# [1.1.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.0.1...@mw-components/taskman@1.1.0) (2021-07-06)


### Bug Fixes

* **taskman:** post json.headers when create task ([a3bef8d](https://github.com/waitingsong/midway-components/commit/a3bef8d70fe66554c325c47b7ecfe3124b959535))


### Features

* **taskman:** add config types DbConfig['pool'] ([d5c8197](https://github.com/waitingsong/midway-components/commit/d5c819726874d0ceaba5b83ac6847025d19da9cc))





## [1.0.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@1.0.0...@mw-components/taskman@1.0.1) (2021-07-06)


### Bug Fixes

* **taskman:** create ([e3d78f6](https://github.com/waitingsong/midway-components/commit/e3d78f684b41047ccc86fe339baa4f2d06703e42))





# [1.0.0](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@0.16.2...@mw-components/taskman@1.0.0) (2021-07-05)


### Features

* **taskman:** breaking change rename field will_start to expect_start ([330f47b](https://github.com/waitingsong/midway-components/commit/330f47b4cbf692c852c2d716317c83ed9cfc8f50))





## [0.16.2](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@0.16.1...@mw-components/taskman@0.16.2) (2021-07-05)

**Note:** Version bump only for package @mw-components/taskman





## [0.16.1](https://github.com/waitingsong/midway-components/compare/@mw-components/taskman@0.16.0...@mw-components/taskman@0.16.1) (2021-07-02)

**Note:** Version bump only for package @mw-components/taskman





# 0.16.0 (2021-07-01)


### Features

* **taskman:** set failed if httpCall() failed ([b839696](https://github.com/waitingsong/midway-components/commit/b839696970546b13b3139c82a3acf45c1c4362f8))





## 0.15.2 (2021-07-01)


### Bug Fixes

* **taskman:** api input ([727ac69](https://github.com/waitingsong/midway-components/commit/727ac69aeb3ace5f9597efff6b48c7f8161ec2b6))





## 0.15.1 (2021-07-01)


### Bug Fixes

* **taskman:** api method and input data ([c65f7e8](https://github.com/waitingsong/midway-components/commit/c65f7e82e839a7e2bcddfc36ce34f1eadd76e048))





# 0.15.0 (2021-07-01)


### Features

* **taskman:** cache Task in TaskManComponent ([a807aea](https://github.com/waitingsong/midway-components/commit/a807aea7c762b4f5fd1640337c381c8df234d418))





## 0.14.3 (2021-07-01)


### Bug Fixes

* **taskman:** api method ([0b7af16](https://github.com/waitingsong/midway-components/commit/0b7af16f790d7b34b3a80a69893ff2cd6d37a405))





## 0.14.2 (2021-07-01)


### Bug Fixes

* **task-man:** save req header as payload headers if undefined when create task ([20beaf4](https://github.com/waitingsong/midway-components/commit/20beaf400b966d29224c4da01446c657a7cc12ef))





## 0.14.1 (2021-07-01)


### Bug Fixes

* **task-man:** header when create task ([c8af3c0](https://github.com/waitingsong/midway-components/commit/c8af3c043013d69d3b04cad6b3b87bbe4b9efdc5))





# 0.14.0 (2021-07-01)


### Features

* **taskman:** log more info when sendTaskToRun fail ([3da788f](https://github.com/waitingsong/midway-components/commit/3da788feddd42f004fa319e25ff23a79241e9b5f))





# 0.13.0 (2021-07-01)


### Features

* **taskman:** write log when sendTaskToRun fail ([ba44f2e](https://github.com/waitingsong/midway-components/commit/ba44f2ef1084a4b659464d648fee473b485d17e8))





## 0.12.3 (2021-07-01)


### Bug Fixes

* **taskman:** set default fetch options within httpCall() ([8abf3e3](https://github.com/waitingsong/midway-components/commit/8abf3e31f2faf56e0a0beae9843341dabb555b65))





## 0.12.2 (2021-07-01)


### Bug Fixes

* **taskman:** retrieve DbManager from app instead of ctx ([94acd6a](https://github.com/waitingsong/midway-components/commit/94acd6a68781b5a0c89e4647073f0fcc65f95d62))





## 0.12.1 (2021-07-01)


### Bug Fixes

* **taskman:** retrieve DbManager from app instead of ctx ([a3216af](https://github.com/waitingsong/midway-components/commit/a3216afd1bb9a7da43c8ccf9e303524e4bfb980b))





# 0.12.0 (2021-07-01)


### Features

* **taskman:** retrieveTask() accept input taskId ([bd1a610](https://github.com/waitingsong/midway-components/commit/bd1a610375c1ffbf90005dd8b9096f34757ac603))





## 0.11.1 (2021-06-30)

**Note:** Version bump only for package @mw-components/taskman





# 0.11.0 (2021-06-30)


### Features

* **taskman:** api get_result ([c05dfb7](https://github.com/waitingsong/midway-components/commit/c05dfb771d330497f424bded02afaf3285ceb50b))





# 0.10.0 (2021-06-30)


### Features

* **taskman:** update progress ([d0d0ee3](https://github.com/waitingsong/midway-components/commit/d0d0ee35d38dcc46773dd44ae7c9707cd877ad3c))





# 0.9.0 (2021-06-30)


### Features

* **taskman:** task class ([3a59496](https://github.com/waitingsong/midway-components/commit/3a59496f2415d65bc88bb86c804a0f6e3e804e09))





# 0.8.0 (2021-06-29)


### Features

* **taskman:** create() by POST ([5e159ca](https://github.com/waitingsong/midway-components/commit/5e159ca5731d8f253cd154dc439ca3e336f7b03d))





# 0.7.0 (2021-06-29)

**Note:** Version bump only for package @mw-components/taskman





# 0.6.0 (2021-06-29)


### Features

* **taskman:** add getProgress() ([1a88ce6](https://github.com/waitingsong/midway-components/commit/1a88ce63c07eb3b1cd9c63437d76a9aeb589299b))





# 0.5.0 (2021-06-29)


### Features

* **taskman:** control number of task running with middleware ([963a872](https://github.com/waitingsong/midway-components/commit/963a872d5d0a7fd776fb8ac777c1fdc63838176c))





## 0.4.2 (2021-06-29)

**Note:** Version bump only for package @mw-components/taskman





## 0.4.1 (2021-06-28)


### Bug Fixes

* **taskman:** TaskAgentService run once ([cfdd818](https://github.com/waitingsong/midway-components/commit/cfdd8183413903caef301d11a8fd4fd31ec81a32))





# 0.4.0 (2021-06-28)


### Features

* **taskman:** TaskAgentService run once ([0e28048](https://github.com/waitingsong/midway-components/commit/0e28048224bc40f5fc16c68d546e63795266b3e1))





## 0.3.1 (2021-06-28)


### Bug Fixes

* **taskman:** transaction missing commit/rollback ([583e6ae](https://github.com/waitingsong/midway-components/commit/583e6aed6e314d846dff060cd0d8a5b6cb685187))





# 0.3.0 (2021-06-28)


### Features

* **taskman:** breaking change return type of TaskAgentService.run() to Promise<void> ([7b8f28c](https://github.com/waitingsong/midway-components/commit/7b8f28cd9b9adf5e2dbb9a878580aec1f659355e))





# 0.2.0 (2021-06-28)


### Features

* **jaeger:** change TracerManager.spans scope to public ([03c6692](https://github.com/waitingsong/midway-components/commit/03c669272ddb62d8e9d5a3dafaa0df77b02fea05))





## 0.1.1 (2021-06-28)

**Note:** Version bump only for package @mw-components/taskman





# 0.1.0 (2021-06-28)


### Features

* **task-man:** implementation ([3b000fd](https://github.com/waitingsong/midway-components/commit/3b000fd5f14db18370b8cb9fb4bb59d3e92f0f9c))
