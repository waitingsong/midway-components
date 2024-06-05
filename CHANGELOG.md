# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [30.6.0](https://github.com/waitingsong/midway-components/compare/v30.5.0...v30.6.0) (2024-06-05)


### Features

* **otel:** expose genTraceScope() ([74cfd8d](https://github.com/waitingsong/midway-components/commit/74cfd8d1d2740b7d843c96d185fabc664ffca61d))





# [30.5.0](https://github.com/waitingsong/midway-components/compare/v30.4.0...v30.5.0) (2024-06-05)


### Features

* **otel:** Trace decorator accepts scope ([865bf31](https://github.com/waitingsong/midway-components/commit/865bf31fad008e9cb8871258446e2b6c8c398d00))
* **share:** expose types InstanceWithDecorator, ClassWithDecorator ([1bed479](https://github.com/waitingsong/midway-components/commit/1bed47955892179505b24b4056d1839eb39af5f9))





# [30.4.0](https://github.com/waitingsong/midway-components/compare/v30.3.0...v30.4.0) (2024-06-04)


### Bug Fixes

* **otel:** check span ended within OtelComponent.getActiveContextFromArray() ([2c4d83f](https://github.com/waitingsong/midway-components/commit/2c4d83f37342afa688ad37d26a58a31a3da80a0a))


### Features

* **otel:** isSpanEnded() ([4e3e9a5](https://github.com/waitingsong/midway-components/commit/4e3e9a5907b2dcdc608ddbf329198037451c0a58))





# [30.3.0](https://github.com/waitingsong/midway-components/compare/v30.2.0...v30.3.0) (2024-06-04)


### Features

* **otel:** add TraceService.startScopeActiveSpan() ([08c4534](https://github.com/waitingsong/midway-components/commit/08c45346b226afbda99fc1cd87d3bcf76f8da218))





# [30.2.0](https://github.com/waitingsong/midway-components/compare/v30.1.1...v30.2.0) (2024-06-04)


### Features

* **otel:** add TraceService.delActiveContext() ([bbf3d3b](https://github.com/waitingsong/midway-components/commit/bbf3d3bfd216b6d78b822e14bf7310969bad8ccd))
* **otel:** TraceService.getActiveContext() accepts optional param scope ([5d8d235](https://github.com/waitingsong/midway-components/commit/5d8d235ad1a43843a21356a2f8c55faf42397d9d))
* **otel:** TraceService.getActiveSpan()/startSpan()/startActiveSpan() accepts optional param scope ([5013d60](https://github.com/waitingsong/midway-components/commit/5013d60a2653bc2c2122356d6561912347e7b79d))
* **otel:** TraceService.setActiveContext() accepts 2nd param scope ([3c13781](https://github.com/waitingsong/midway-components/commit/3c137814da5ae37bf64db654f7ed1f0503bbb914))





## [30.1.1](https://github.com/waitingsong/midway-components/compare/v30.1.0...v30.1.1) (2024-06-04)

**Note:** Version bump only for package midway-components





# [30.1.0](https://github.com/waitingsong/midway-components/compare/v30.0.0...v30.1.0) (2024-06-03)


### Features

* **otel:** manage trace Context on OtelComponent ([dc55f8e](https://github.com/waitingsong/midway-components/commit/dc55f8e7782208227117c7fe82aa9e46ff61f85f))





# [30.0.0](https://github.com/waitingsong/midway-components/compare/v29.3.1...v30.0.0) (2024-06-02)


### Features

* **cache:** breaking change key generation strategy genCacheKey() ([4ecdc61](https://github.com/waitingsong/midway-components/commit/4ecdc6108b666c8988392b6b944e1961ce0b0051))





## [29.3.1](https://github.com/waitingsong/midway-components/compare/v29.3.0...v29.3.1) (2024-05-31)

**Note:** Version bump only for package midway-components





# [29.3.0](https://github.com/waitingsong/midway-components/compare/v29.2.0...v29.3.0) (2024-05-31)


### Features

* **jwt:** decorator Public() to skip JWT Authentication ([7f72eb1](https://github.com/waitingsong/midway-components/commit/7f72eb14a5b99d359d5814e65984b490c13aecb3))
* **share:** add routerInfoConfig.enable to controller use of router-info.middleware.ts ([181b809](https://github.com/waitingsong/midway-components/commit/181b809bf9e98e50b30d91a7c9c968e6b0992ba3))
* **share:** expose type DecoratorMetaData ([9d8cc31](https://github.com/waitingsong/midway-components/commit/9d8cc317c7813d8204a9544398a83bc48397bcb2))
* **share:** expose type MiddlewarePathPattern ([def72ea](https://github.com/waitingsong/midway-components/commit/def72ea85359b99d3cc727a2857b356e1c4349cb))





# [29.2.0](https://github.com/waitingsong/midway-components/compare/v29.1.0...v29.2.0) (2024-05-30)


### Features

* **share:** retrieve and append routerInfo on ctx._routerINfo via router-info.middleware.ts ([f2b301d](https://github.com/waitingsong/midway-components/commit/f2b301dfbf65f800098648239a4d2259b84308b3))





# [29.1.0](https://github.com/waitingsong/midway-components/compare/v29.0.1...v29.1.0) (2024-05-29)

**Note:** Version bump only for package midway-components





## [29.0.1](https://github.com/waitingsong/midway-components/compare/v29.0.0...v29.0.1) (2024-05-28)

**Note:** Version bump only for package midway-components





# [29.0.0](https://github.com/waitingsong/midway-components/compare/v28.2.0...v29.0.0) (2024-05-27)


### Features

* **share:** breaking change decorator types and implementation ([289eee3](https://github.com/waitingsong/midway-components/commit/289eee3a3d0aeffb42c93e2bf2f43313fa0938fc))





# [28.2.0](https://github.com/waitingsong/midway-components/compare/v28.1.1...v28.2.0) (2024-05-24)


### Features

* **share:** add 3rd param of getRouterInfo() limit, default 1000 ([cebbc89](https://github.com/waitingsong/midway-components/commit/cebbc89860c346647435c9ab8903d2649876982c))





## [28.1.1](https://github.com/waitingsong/midway-components/compare/v28.1.0...v28.1.1) (2024-05-24)

**Note:** Version bump only for package midway-components





# [28.1.0](https://github.com/waitingsong/midway-components/compare/v28.0.0...v28.1.0) (2024-05-23)


### Features

* **otel:** set enableMiddleware to true in config.default.ts ([a5f34a3](https://github.com/waitingsong/midway-components/commit/a5f34a34bf4ff3cd9f15054bd1aa15ca20c68fa3))





# [28.0.0](https://github.com/waitingsong/midway-components/compare/v27.0.1...v28.0.0) (2024-05-23)


### Features

* **otel:** breaking change parameters order and return type of decorator before()/after() ([f8eb988](https://github.com/waitingsong/midway-components/commit/f8eb98831a6e4deb25e7c1867e7bec3cc9e8dfe2))
* **share:** breaking change properties name of CustomDecoratorFactoryOptions ([1d0f70e](https://github.com/waitingsong/midway-components/commit/1d0f70ef9457c4516fbc0ad8d31616e29ef1c106))





## [27.0.1](https://github.com/waitingsong/midway-components/compare/v27.0.0...v27.0.1) (2024-05-22)

**Note:** Version bump only for package midway-components





# [27.0.0](https://github.com/waitingsong/midway-components/compare/v26.5.3...v27.0.0) (2024-05-21)


### Features

* **otel:** breaking change functions ([a6d5459](https://github.com/waitingsong/midway-components/commit/a6d54596ee5e620bc690eb5f7436875e134d3787))
* **otel:** process span name correctly ([6773857](https://github.com/waitingsong/midway-components/commit/6773857c6e8541ff830010013a055b26873f6643))
* **share:** getRouterInfo() ([3a1108f](https://github.com/waitingsong/midway-components/commit/3a1108f667e6c39d723c15a202f0cb36021e07e6))





## [26.5.3](https://github.com/waitingsong/midway-components/compare/v26.5.2...v26.5.3) (2024-05-21)


### Bug Fixes

* **otel:** tracing event if ctx.path matched  otelMiddlewareConfig.ignore lists ([4c1d55c](https://github.com/waitingsong/midway-components/commit/4c1d55c7aa92e8cc448935a34c8ea609fed8ef5a))





## [26.5.2](https://github.com/waitingsong/midway-components/compare/v26.5.1...v26.5.2) (2024-05-09)

**Note:** Version bump only for package midway-components





## [26.5.1](https://github.com/waitingsong/midway-components/compare/v26.5.0...v26.5.1) (2024-04-25)


### Bug Fixes

* **otel:** import assert {type} to import with {type} ([c788e6b](https://github.com/waitingsong/midway-components/commit/c788e6b0fd22a752979b9a6fb44f188a94278bf2))





# [26.5.0](https://github.com/waitingsong/midway-components/compare/v26.4.0...v26.5.0) (2024-04-24)


### Features

* **share:** change value of bypassDecoratorHandlerExecutor unique ([84381e2](https://github.com/waitingsong/midway-components/commit/84381e293cadd96960c52aaada9ada4c4ea168fd))





# [26.4.0](https://github.com/waitingsong/midway-components/compare/v26.3.2...v26.4.0) (2024-04-24)


### Features

* **share:** use constant bypassDecoratorHandlerExecutor to skip the decorator executor ([4e91957](https://github.com/waitingsong/midway-components/commit/4e9195736925a58a81c1bb8ee5d159136ab15fab))





## [26.3.2](https://github.com/waitingsong/midway-components/compare/v26.3.1...v26.3.2) (2024-04-24)


### Bug Fixes

* **share:** retrieveMetadataPayloadsOnMethod() ([ce8b204](https://github.com/waitingsong/midway-components/commit/ce8b20457bd078650ca2cfb98101a462d51e113d))





## [26.3.1](https://github.com/waitingsong/midway-components/compare/v26.3.0...v26.3.1) (2024-04-23)

**Note:** Version bump only for package midway-components





# [26.3.0](https://github.com/waitingsong/midway-components/compare/v26.2.1...v26.3.0) (2024-04-23)


### Features

* **share:** add and export registerDecoratorHandlers() ([367e4be](https://github.com/waitingsong/midway-components/commit/367e4bef57c20b52e088bec5c0da5e8ff7c7fe9a))





## [26.2.1](https://github.com/waitingsong/midway-components/compare/v26.2.0...v26.2.1) (2024-04-22)

**Note:** Version bump only for package midway-components





# [26.2.0](https://github.com/waitingsong/midway-components/compare/v26.1.0...v26.2.0) (2024-04-22)


### Features

* **cache:** remove METHOD_KEY_Transactional usage from cacheableMethodIgnoreIfMethodDecoratorKeys ([6723e01](https://github.com/waitingsong/midway-components/commit/6723e0145385b926b9a365c07157b1b15f4cd546))





# [26.1.0](https://github.com/waitingsong/midway-components/compare/v26.0.2...v26.1.0) (2024-04-22)


### Features

* **otel:** update TraceInit span name for MidwayJs lifeCycle ([541c47c](https://github.com/waitingsong/midway-components/commit/541c47c11b8a541ed1e70cfca2fdf6f1792725f5))





## [26.0.2](https://github.com/waitingsong/midway-components/compare/v26.0.1...v26.0.2) (2024-04-22)

**Note:** Version bump only for package midway-components





## [26.0.1](https://github.com/waitingsong/midway-components/compare/v26.0.0...v26.0.1) (2024-04-21)

**Note:** Version bump only for package midway-components





# [26.0.0](https://github.com/waitingsong/midway-components/compare/v25.2.3...v26.0.0) (2024-04-21)


### Features

* **share:** breaking change customDecoratorFactory with autoRegisterDecoratorHandlers ([8272580](https://github.com/waitingsong/midway-components/commit/8272580cb2509e69b69f3b2fd8bd41691420f8c3))





## [25.2.3](https://github.com/waitingsong/midway-components/compare/v25.2.2...v25.2.3) (2024-04-14)

**Note:** Version bump only for package midway-components





## [25.2.2](https://github.com/waitingsong/midway-components/compare/v25.2.1...v25.2.2) (2024-04-09)


### Bug Fixes

* **share:** regMethodDecorator() got error "Cannot redefine property: decoratedType" ([da6625d](https://github.com/waitingsong/midway-components/commit/da6625d2f16ee5d5eee8a17cde2c46934bbb3fea))





## [25.2.1](https://github.com/waitingsong/midway-components/compare/v25.2.0...v25.2.1) (2024-04-09)

**Note:** Version bump only for package midway-components





# [25.2.0](https://github.com/waitingsong/midway-components/compare/v25.1.0...v25.2.0) (2024-04-09)


### Features

* **share:** update shouldEnableMiddleware() ([a1d2fc6](https://github.com/waitingsong/midway-components/commit/a1d2fc61c3d504722387f1b598d7cf0edfb94fd3))





# [25.1.0](https://github.com/waitingsong/midway-components/compare/v25.0.2...v25.1.0) (2024-04-09)


### Features

* **share:** RegisterDecoratorHandlerParam['fnDecoratorExecutorAsync'] accepts 'bypass' value ([b6dc402](https://github.com/waitingsong/midway-components/commit/b6dc402b93b8f5f52b3cd6427db2829dfaf733c8))





## [25.0.2](https://github.com/waitingsong/midway-components/compare/v25.0.1...v25.0.2) (2024-04-08)


### Bug Fixes

* **share:** setImplToFalseIfDecoratedWithBothClassAndMethod() ([b7a3e31](https://github.com/waitingsong/midway-components/commit/b7a3e3126617c1779f9ee9a8880e4c5c7d18b6c0))





## [25.0.1](https://github.com/waitingsong/midway-components/compare/v25.0.0...v25.0.1) (2024-04-08)

**Note:** Version bump only for package midway-components





# [25.0.0](https://github.com/waitingsong/midway-components/compare/v24.2.4...v25.0.0) (2024-04-08)


### Bug Fixes

* **share:** wrong parameter of prepareOptions() ([1c13ee5](https://github.com/waitingsong/midway-components/commit/1c13ee5c81a559ab68a96662818eaf322a4dbe9f))





## [24.2.4](https://github.com/waitingsong/midway-components/compare/v24.2.3...v24.2.4) (2024-04-08)


### Bug Fixes

* **share:** wrong rule calculation of requestPathMatched() ([59c61aa](https://github.com/waitingsong/midway-components/commit/59c61aa564f50aaad4c4873ba05387d3a5c4b2d7))





## [24.2.3](https://github.com/waitingsong/midway-components/compare/v24.2.2...v24.2.3) (2024-04-08)

**Note:** Version bump only for package midway-components





## [24.2.2](https://github.com/waitingsong/midway-components/compare/v24.2.1...v24.2.2) (2024-04-07)

**Note:** Version bump only for package midway-components





## [24.2.1](https://github.com/waitingsong/midway-components/compare/v24.2.0...v24.2.1) (2024-04-05)

**Note:** Version bump only for package midway-components





# [24.2.0](https://github.com/waitingsong/midway-components/compare/v24.1.0...v24.2.0) (2024-04-05)


### Features

* **share:** export Config as MConfig from '@midwayjs/core' ([618af3e](https://github.com/waitingsong/midway-components/commit/618af3e354b0797407d1b1363f4084ba0b247cb7))





# [24.1.0](https://github.com/waitingsong/midway-components/compare/v24.0.0...v24.1.0) (2024-04-05)


### Features

* **otel:** update AttrNames ([d0362e2](https://github.com/waitingsong/midway-components/commit/d0362e2205f83e678156fdc508b31c137ed6836c))





# [24.0.0](https://github.com/waitingsong/midway-components/compare/v23.2.0...v24.0.0) (2024-04-03)


### Features

* **cache:** breaking change types and strategy of caching read and write ([59de5b3](https://github.com/waitingsong/midway-components/commit/59de5b3a0817c2ff0b73b1d4d1e2cdefd1e23c21))





# [23.2.0](https://github.com/waitingsong/midway-components/compare/v23.1.0...v23.2.0) (2024-04-03)


### Features

* **cache:** retrieveCacheMetaFrom() ([8d2a74d](https://github.com/waitingsong/midway-components/commit/8d2a74ddec0b5daf25ed5ca15694e98a2cfc7853))





# [23.1.0](https://github.com/waitingsong/midway-components/compare/v23.0.0...v23.1.0) (2024-04-02)


### Features

* **cache:** return type of genCacheKey() accept false ([13ed5f4](https://github.com/waitingsong/midway-components/commit/13ed5f4dd7ef7c2a783cb00038c0bc71fff73399))





# [23.0.0](https://github.com/waitingsong/midway-components/compare/v22.1.2...v23.0.0) (2024-03-27)

**Note:** Version bump only for package midway-components





## [22.1.2](https://github.com/waitingsong/midway-components/compare/v22.1.1...v22.1.2) (2024-03-08)

**Note:** Version bump only for package midway-components





## [22.1.1](https://github.com/waitingsong/midway-components/compare/v22.1.0...v22.1.1) (2024-03-06)


### Bug Fixes

* **cache:** return of @PUT invalid ([91f0080](https://github.com/waitingsong/midway-components/commit/91f0080cfea72378c323b22602b45b3a4110a6eb))





# [22.1.0](https://github.com/waitingsong/midway-components/compare/v22.0.1...v22.1.0) (2024-03-05)


### Features

* **core:** update commonValidSchemas ([eaa5a93](https://github.com/waitingsong/midway-components/commit/eaa5a931c9dd6a816dd72e4d9260780427fe2506))
* **share:** export function and options ([03d6e7c](https://github.com/waitingsong/midway-components/commit/03d6e7c2368036f43b15749c7f50c5e8634121e8))





## [22.0.1](https://github.com/waitingsong/midway-components/compare/v22.0.0...v22.0.1) (2024-02-26)

**Note:** Version bump only for package midway-components





# [22.0.0](https://github.com/waitingsong/midway-components/compare/v21.1.0...v22.0.0) (2024-02-25)


### Bug Fixes

* **cache:** breaking change var type ..Decortaor.. to ..Decorator from @mwcp/share ([55ed64b](https://github.com/waitingsong/midway-components/commit/55ed64ba27a6a7bfbb5076806f8ed6f57fb8245c))
* **otel:** breaking change var type ..Decortaor.. to ..Decorator from @mwcp/share ([0984de2](https://github.com/waitingsong/midway-components/commit/0984de236e6bfd0eae705e5fb53015df01eca5bb))
* **share:** breaking change var type ..Decortaor.. to ..Decorator ([059da38](https://github.com/waitingsong/midway-components/commit/059da38dd6ac55cae0649c6d38eb83bb89b70e0d))





# [21.1.0](https://github.com/waitingsong/midway-components/compare/v21.0.0...v21.1.0) (2024-02-25)


### Features

* **cache:** export from @midwayjs/cache-manager ([ca7e61c](https://github.com/waitingsong/midway-components/commit/ca7e61c7d1687669a394fe4116354e4462a58f8f))





# [21.0.0](https://github.com/waitingsong/midway-components/compare/v20.12.0...v21.0.0) (2024-02-25)


### Features

* **cache:** breaking change use @midwayjs/cache-manager instead of @midwayjs/cache ([7fb786c](https://github.com/waitingsong/midway-components/commit/7fb786cb7e65663d68d042b54cfeb2f2bdb6e024))





# [20.12.0](https://github.com/waitingsong/midway-components/compare/v20.11.1...v20.12.0) (2024-02-25)


### Features

* **share:** remove min(1) from commonValidSchemas.string ([e5dc556](https://github.com/waitingsong/midway-components/commit/e5dc5562e73dfff81dca95d1c93543076ef33965))





## [20.11.1](https://github.com/waitingsong/midway-components/compare/v20.11.0...v20.11.1) (2024-02-22)

**Note:** Version bump only for package midway-components





# [20.11.0](https://github.com/waitingsong/midway-components/compare/v20.10.1...v20.11.0) (2024-02-22)


### Features

* **share:** update commonValidSchemas ([85e3572](https://github.com/waitingsong/midway-components/commit/85e357272e0eb707161a64772a80c07370a2cd8f))





## [20.10.1](https://github.com/waitingsong/midway-components/compare/v20.10.0...v20.10.1) (2024-02-03)

**Note:** Version bump only for package midway-components





# [20.10.0](https://github.com/waitingsong/midway-components/compare/v20.9.0...v20.10.0) (2024-02-02)


### Features

* **share:** export functions ([9fabdf0](https://github.com/waitingsong/midway-components/commit/9fabdf0502293d1cad3504818a2d4921d55669c9))
* **share:** update commonValidSchemas ([7a6171f](https://github.com/waitingsong/midway-components/commit/7a6171f336f93774dee9efae7661caff56e51c14))
* **share:** update type PageOrderByRule ([aac4e3e](https://github.com/waitingsong/midway-components/commit/aac4e3e0e2cb3f922478741c8961e73847b42dee))





# [20.9.0](https://github.com/waitingsong/midway-components/compare/v20.8.1...v20.9.0) (2024-01-27)

**Note:** Version bump only for package midway-components





## [20.8.1](https://github.com/waitingsong/midway-components/compare/v20.8.0...v20.8.1) (2024-01-26)


### Bug Fixes

* **cache:** comment assert.deepEqual(config, this.cacheConfig) out ([9ad80d8](https://github.com/waitingsong/midway-components/commit/9ad80d88b03f90226e5b339398181deb6750e021))





# [20.8.0](https://github.com/waitingsong/midway-components/compare/v20.7.0...v20.8.0) (2024-01-26)


### Features

* deleteRouter if enableDefaultRoute false ([bc4027e](https://github.com/waitingsong/midway-components/commit/bc4027ed6c4233ee906dee9bae97986ff9f5e1c2))





# [20.7.0](https://github.com/waitingsong/midway-components/compare/v20.6.0...v20.7.0) (2024-01-26)


### Features

* **share:** add deleteRouter() ([16c53af](https://github.com/waitingsong/midway-components/commit/16c53af62a01858b5dc777a6b2b07d77402f9a5d))





# [20.6.0](https://github.com/waitingsong/midway-components/compare/v20.5.0...v20.6.0) (2024-01-26)


### Features

* **cache:** add genCacheKeyFromPagingDTO() ([c72ac3b](https://github.com/waitingsong/midway-components/commit/c72ac3b3cb0fd5048f0bf8c8c6098d5e50e6534d))
* **share:** add types for page query ([f173308](https://github.com/waitingsong/midway-components/commit/f173308ea92e5794020845a7797ca343e94efe1d))





# [20.5.0](https://github.com/waitingsong/midway-components/compare/v20.4.0...v20.5.0) (2024-01-26)


### Features

* **share:** add common.schema.ts ([1e08a06](https://github.com/waitingsong/midway-components/commit/1e08a067483b27b611b94e242645b28a3f8d8a06))





# [20.4.0](https://github.com/waitingsong/midway-components/compare/v20.3.0...v20.4.0) (2024-01-26)


### Features

* **boot:** export types from @mwcp/koid ([1a1982f](https://github.com/waitingsong/midway-components/commit/1a1982f989f332c9bddcd568e2892fa031fe5105))





# [20.3.0](https://github.com/waitingsong/midway-components/compare/v20.2.0...v20.3.0) (2024-01-25)


### Features

* **share:** define type PagingResult<T> ([ffb7674](https://github.com/waitingsong/midway-components/commit/ffb76743e1e79fe221911e1926f988a9abd0e98e))





# [20.2.0](https://github.com/waitingsong/midway-components/compare/v20.1.0...v20.2.0) (2024-01-24)


### Features

* **jwt:** update ignore list ([16dbe85](https://github.com/waitingsong/midway-components/commit/16dbe8563ed4b19dc1094528f9b17415ec39e27f))





# [20.1.0](https://github.com/waitingsong/midway-components/compare/v20.0.2...v20.1.0) (2024-01-24)


### Features

* **boot:** declare jsonRespMiddlewareConfig ([88c6c52](https://github.com/waitingsong/midway-components/commit/88c6c5295cd48de4e14dbdf028fc32e6b6620d3e))





## [20.0.2](https://github.com/waitingsong/midway-components/compare/v20.0.1...v20.0.2) (2024-01-23)

**Note:** Version bump only for package midway-components





## [20.0.1](https://github.com/waitingsong/midway-components/compare/v20.0.0...v20.0.1) (2024-01-21)

**Note:** Version bump only for package midway-components





# [20.0.0](https://github.com/waitingsong/midway-components/compare/v19.2.5...v20.0.0) (2024-01-21)

**Note:** Version bump only for package midway-components
