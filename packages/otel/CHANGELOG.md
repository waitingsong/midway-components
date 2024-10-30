# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [39.1.0](https://github.com/waitingsong/midway-components/compare/v39.0.2...v39.1.0) (2024-10-30)


### Bug Fixes

* **otel:** middlewares using order ([ed07659](https://github.com/waitingsong/midway-components/commit/ed076594dd345a2cb8b22483758caa38950b0fec))


### Features

* **otel:** addSpanEventWithIncomingRequestData() skip log if none ([73b536c](https://github.com/waitingsong/midway-components/commit/73b536ce403979a02cc1b7c6cd63968daf95e40b))





## [39.0.2](https://github.com/waitingsong/midway-components/compare/v39.0.1...v39.0.2) (2024-10-29)


### Bug Fixes

* **otel:** fix src/configuration.ts using middleware ([e965166](https://github.com/waitingsong/midway-components/commit/e9651663c7c0e5c9a2e365c36164a9328ce3dccf))
* **otel:** order of using TraceMiddlewareInnerGRpc ([3e56a14](https://github.com/waitingsong/midway-components/commit/3e56a14a3f515ff8d4201c186d0042ea53af7d30))





## [39.0.1](https://github.com/waitingsong/midway-components/compare/v39.0.0...v39.0.1) (2024-10-29)

**Note:** Version bump only for package @mwcp/otel





# [39.0.0](https://github.com/waitingsong/midway-components/compare/v38.4.0...v39.0.0) (2024-10-29)


### Features

* **otel:** add property of parameter of AssertsRootOptions() ([9897828](https://github.com/waitingsong/midway-components/commit/9897828e022eb18157f56e510cabcb70f249ea9f))
* **otel:** addSpanEventWithIncomingRequestData() always log AttrNames.Incoming_Request_data ([cd120b9](https://github.com/waitingsong/midway-components/commit/cd120b9b58172dd0938b0a8b55a2941181a15c46))
* **otel:** supports RPC request by @midwayjs/grpc ([c4e1333](https://github.com/waitingsong/midway-components/commit/c4e1333d8fbdc55d103b84049ddf4328b1af831f))
* **otel:** TraceServiceSpan.getTraceId() accepts optional param scope ([bb05a60](https://github.com/waitingsong/midway-components/commit/bb05a60065f4fcd8256e74c773a18b3e52fcb1b3))





# [38.4.0](https://github.com/waitingsong/midway-components/compare/v38.3.0...v38.4.0) (2024-10-28)

**Note:** Version bump only for package @mwcp/otel





# [38.3.0](https://github.com/waitingsong/midway-components/compare/v38.2.3...v38.3.0) (2024-10-28)

**Note:** Version bump only for package @mwcp/otel





## [38.2.3](https://github.com/waitingsong/midway-components/compare/v38.2.2...v38.2.3) (2024-10-25)

**Note:** Version bump only for package @mwcp/otel





## [38.2.2](https://github.com/waitingsong/midway-components/compare/v38.2.1...v38.2.2) (2024-10-05)

**Note:** Version bump only for package @mwcp/otel





## [38.2.1](https://github.com/waitingsong/midway-components/compare/v38.2.0...v38.2.1) (2024-09-15)


### Bug Fixes

* **otel:** assertJaegerTagItem(), assertJaegerLogField() ([e981248](https://github.com/waitingsong/midway-components/commit/e981248ce5e5ad38ea87ff08442353ebb45a3560))





# [38.2.0](https://github.com/waitingsong/midway-components/compare/v38.1.0...v38.2.0) (2024-09-15)


### Features

* **otel:** assertJaegerTagItem(), assertJaegerLogField() ([cb941c5](https://github.com/waitingsong/midway-components/commit/cb941c59e22968d16a92c799e87093d21d42cd7d))
* **otel:** update ExpectAttributes support RegExp value for assertsSpan() ([31a2e4e](https://github.com/waitingsong/midway-components/commit/31a2e4e023189102ccfc96287cd6edf50fac88f6))





# [38.1.0](https://github.com/waitingsong/midway-components/compare/v38.0.0...v38.1.0) (2024-09-15)


### Features

* **otel:** update type AssertsRootOp for assertRootSpan() ([382e6a3](https://github.com/waitingsong/midway-components/commit/382e6a385f2fb108bd0959da8dc9104d9ca85471))





# [38.0.0](https://github.com/waitingsong/midway-components/compare/v37.4.1...v38.0.0) (2024-09-14)


### Features

* **otel:** breaking change DecoratorHandlerTraceBase.getWebContext() eat error ([8b8c509](https://github.com/waitingsong/midway-components/commit/8b8c509950730bcd679f0d6d57a6c949a6f5c63a))





## [37.4.1](https://github.com/waitingsong/midway-components/compare/v37.4.0...v37.4.1) (2024-09-10)

**Note:** Version bump only for package @mwcp/otel





# [37.4.0](https://github.com/waitingsong/midway-components/compare/v37.3.0...v37.4.0) (2024-09-07)


### Bug Fixes

* **otel:** assign traceContext for Trace() ([fa00c3b](https://github.com/waitingsong/midway-components/commit/fa00c3bf88de10df4218b2b44688d98ec1ba86fe))


### Features

* **otel:** add properties of DecoratorTraceData for TraceLog() ([ba26cc6](https://github.com/waitingsong/midway-components/commit/ba26cc65ad4653ec53d77b7dc5d2a3233cb81600))
* **otel:** TraceServiceSpan.getActiveTraceInfo() ([5802b1c](https://github.com/waitingsong/midway-components/commit/5802b1c3eb9abaf2a7cce89fba2e5069116dc9b2))





# [37.3.0](https://github.com/waitingsong/midway-components/compare/v37.2.4...v37.3.0) (2024-09-04)


### Features

* **otel:** TraceService.retrieveContextBySpanId() ([55bbe5b](https://github.com/waitingsong/midway-components/commit/55bbe5b1c142da6a206d70c2abfbe1623d07c3cd))
* **otel:** TraceService.retrieveParentTraceInfoBySpan() and retrieveTraceInfoBySpanId() ([e96ea2f](https://github.com/waitingsong/midway-components/commit/e96ea2f683a5c18ddcbe12039152d97669467d98))
* **otel:** type TraceInfo ([5690552](https://github.com/waitingsong/midway-components/commit/56905524eb70af940e2ceafd614e26b484177a98))





## [37.2.4](https://github.com/waitingsong/midway-components/compare/v37.2.3...v37.2.4) (2024-09-04)

**Note:** Version bump only for package @mwcp/otel





## [37.2.3](https://github.com/waitingsong/midway-components/compare/v37.2.2...v37.2.3) (2024-09-04)

**Note:** Version bump only for package @mwcp/otel





## [37.2.2](https://github.com/waitingsong/midway-components/compare/v37.2.1...v37.2.2) (2024-09-04)

**Note:** Version bump only for package @mwcp/otel





## [37.2.1](https://github.com/waitingsong/midway-components/compare/v37.2.0...v37.2.1) (2024-08-29)

**Note:** Version bump only for package @mwcp/otel





# [37.2.0](https://github.com/waitingsong/midway-components/compare/v37.1.0...v37.2.0) (2024-08-17)

**Note:** Version bump only for package @mwcp/otel





# [37.1.0](https://github.com/waitingsong/midway-components/compare/v37.0.0...v37.1.0) (2024-08-16)

**Note:** Version bump only for package @mwcp/otel





# [37.0.0](https://github.com/waitingsong/midway-components/compare/v36.1.3...v37.0.0) (2024-08-12)


### Bug Fixes

* **otel:** wrong type of afterReturnSync() ([0006dfd](https://github.com/waitingsong/midway-components/commit/0006dfd18e8f50b751dc4cf39a8d1183999227da))


### Features

* **otel:** add TraceService methods ([e7c3346](https://github.com/waitingsong/midway-components/commit/e7c3346132839948e272ca66d8dbaa0f04718c95))
* **otel:** breaking change return type of startSpan() ([0f3943d](https://github.com/waitingsong/midway-components/commit/0f3943d410f251caa0ae67e30d4d852d94cb0de6))
* **otel:** DecoratorTraceData['spanStatusOptions'] ([cb6d479](https://github.com/waitingsong/midway-components/commit/cb6d479bf7ee0e00438fd30a7394159ee4e962e6))
* **otel:** DecoratorTraceDataResp accepts null ([9c54840](https://github.com/waitingsong/midway-components/commit/9c5484001fd7ffddb60e005aa5882c178341d5a9))
* **otel:** getRootSpan() ([93372b3](https://github.com/waitingsong/midway-components/commit/93372b3f5d0e849f775c9368091482518825033f))
* **otel:** remove TraceService.rootSpanMap and TraceService.setRootSpan() ([0c10347](https://github.com/waitingsong/midway-components/commit/0c103474a1dd3a1d6d1f0a003f7b56ff9fb52b73))
* **otel:** rename OtelComponent.delScopeActiveContext() to emptyScopeActiveContext() ([8286b2b](https://github.com/waitingsong/midway-components/commit/8286b2b221ff9fc9d7245a2cc6fb11731ef2cbca))
* **otel:** TraceLog supports end span ([0978a0c](https://github.com/waitingsong/midway-components/commit/0978a0ccf83b910d4e6f8f843bb67438774a3d25))
* **otel:** update TraceService.getActiveContext() ([6124291](https://github.com/waitingsong/midway-components/commit/6124291929874c4ebdfa34feb2dc9b32519495a7))





## [36.1.3](https://github.com/waitingsong/midway-components/compare/v36.1.2...v36.1.3) (2024-08-06)

**Note:** Version bump only for package @mwcp/otel





## [36.1.2](https://github.com/waitingsong/midway-components/compare/v36.1.1...v36.1.2) (2024-08-06)

**Note:** Version bump only for package @mwcp/otel





## [36.1.1](https://github.com/waitingsong/midway-components/compare/v36.1.0...v36.1.1) (2024-08-06)


### Bug Fixes

* **otel:** trace scope ([47b7cef](https://github.com/waitingsong/midway-components/commit/47b7cef8bfd1df6f30cbf4c64eafd0133598492b))





# [36.1.0](https://github.com/waitingsong/midway-components/compare/v36.0.0...v36.1.0) (2024-08-03)

**Note:** Version bump only for package @mwcp/otel





# [36.0.0](https://github.com/waitingsong/midway-components/compare/v35.2.1...v36.0.0) (2024-08-02)

**Note:** Version bump only for package @mwcp/otel





## [35.2.1](https://github.com/waitingsong/midway-components/compare/v35.2.0...v35.2.1) (2024-08-02)


### Bug Fixes

* **otel:** param inner DecoratorHandlerTraceBase.traceError() ([30a26fd](https://github.com/waitingsong/midway-components/commit/30a26fdb677a48b749eb4e0355e8ec2162057070))





# [35.2.0](https://github.com/waitingsong/midway-components/compare/v35.1.0...v35.2.0) (2024-08-01)

**Note:** Version bump only for package @mwcp/otel





# [35.1.0](https://github.com/waitingsong/midway-components/compare/v35.0.1...v35.1.0) (2024-08-01)

**Note:** Version bump only for package @mwcp/otel





## [35.0.1](https://github.com/waitingsong/midway-components/compare/v35.0.0...v35.0.1) (2024-07-30)

**Note:** Version bump only for package @mwcp/otel





# [35.0.0](https://github.com/waitingsong/midway-components/compare/v34.0.1...v35.0.0) (2024-07-30)

**Note:** Version bump only for package @mwcp/otel





## [34.0.1](https://github.com/waitingsong/midway-components/compare/v34.0.0...v34.0.1) (2024-07-30)

**Note:** Version bump only for package @mwcp/otel





# [34.0.0](https://github.com/waitingsong/midway-components/compare/v33.0.0...v34.0.0) (2024-07-30)

**Note:** Version bump only for package @mwcp/otel





# [33.0.0](https://github.com/waitingsong/midway-components/compare/v32.0.0...v33.0.0) (2024-07-28)

**Note:** Version bump only for package @mwcp/otel





# [32.0.0](https://github.com/waitingsong/midway-components/compare/v31.0.0...v32.0.0) (2024-07-24)

**Note:** Version bump only for package @mwcp/otel





# [31.0.0](https://github.com/waitingsong/midway-components/compare/v30.21.0...v31.0.0) (2024-07-22)

**Note:** Version bump only for package @mwcp/otel





# [30.21.0](https://github.com/waitingsong/midway-components/compare/v30.20.0...v30.21.0) (2024-07-22)


### Features

* **otel:** add util function ([df8b66e](https://github.com/waitingsong/midway-components/commit/df8b66e11e0f4a17f223881bf555eaf14914dad2))





# [30.20.0](https://github.com/waitingsong/midway-components/compare/v30.19.0...v30.20.0) (2024-07-15)

**Note:** Version bump only for package @mwcp/otel





# [30.19.0](https://github.com/waitingsong/midway-components/compare/v30.18.0...v30.19.0) (2024-07-14)

**Note:** Version bump only for package @mwcp/otel





# [30.18.0](https://github.com/waitingsong/midway-components/compare/v30.17.1...v30.18.0) (2024-07-12)


### Features

* **otel:** decorator method spanName(), scope() support this param ([a438d22](https://github.com/waitingsong/midway-components/commit/a438d22e6f16394ffa8c11f22b3f8d0cff674737))





## [30.17.1](https://github.com/waitingsong/midway-components/compare/v30.17.0...v30.17.1) (2024-07-12)

**Note:** Version bump only for package @mwcp/otel





# [30.17.0](https://github.com/waitingsong/midway-components/compare/v30.16.1...v30.17.0) (2024-07-06)


### Features

* **otel:** add HeadersKey.TRACE_PARENT_HEADER and TRACE_STATE_HEADER ([bdd1016](https://github.com/waitingsong/midway-components/commit/bdd10162435db729299cc911a8cabb43dee311e3))
* **otel:** retrieveTraceparentFromHeader() ([e63eca2](https://github.com/waitingsong/midway-components/commit/e63eca25350b41590fb696b916c61eace8d10d16))





## [30.16.1](https://github.com/waitingsong/midway-components/compare/v30.16.0...v30.16.1) (2024-07-05)

**Note:** Version bump only for package @mwcp/otel





# [30.16.0](https://github.com/waitingsong/midway-components/compare/v30.15.2...v30.16.0) (2024-07-04)


### Features

* **otel:** TraceLog accepts afterThrow callback via TraceDecoratorOptions['afterThrow'] ([3e38a51](https://github.com/waitingsong/midway-components/commit/3e38a51a2400971458fb8b4082b87ae53f0dc601))





## [30.15.2](https://github.com/waitingsong/midway-components/compare/v30.15.1...v30.15.2) (2024-07-03)

**Note:** Version bump only for package @mwcp/otel





## [30.15.1](https://github.com/waitingsong/midway-components/compare/v30.15.0...v30.15.1) (2024-07-02)

**Note:** Version bump only for package @mwcp/otel





# [30.15.0](https://github.com/waitingsong/midway-components/compare/v30.14.0...v30.15.0) (2024-07-02)

**Note:** Version bump only for package @mwcp/otel





# [30.14.0](https://github.com/waitingsong/midway-components/compare/v30.13.0...v30.14.0) (2024-06-12)


### Features

* **otel:** move test.helper.ts to src/util/common.ts ([077e92c](https://github.com/waitingsong/midway-components/commit/077e92cdacd0a2bb929ed813358e6da7b0c6fd3d))





# [30.13.0](https://github.com/waitingsong/midway-components/compare/v30.12.1...v30.13.0) (2024-06-12)


### Features

* **otel:** add generics MThis of TraceOptions ([72c59a4](https://github.com/waitingsong/midway-components/commit/72c59a4dbb115d1654471c30118fdb0a2d3eebf5))
* **otel:** use ClzInstance isntead of InstanceWithDecorator ([0758993](https://github.com/waitingsong/midway-components/commit/0758993e180706a3364c6e28a7fab57971099079))





## [30.12.1](https://github.com/waitingsong/midway-components/compare/v30.12.0...v30.12.1) (2024-06-12)

**Note:** Version bump only for package @mwcp/otel





# [30.12.0](https://github.com/waitingsong/midway-components/compare/v30.11.2...v30.12.0) (2024-06-12)


### Features

* **otel:** pass decorated instance as decorator before/after callback this param ([d9f99a7](https://github.com/waitingsong/midway-components/commit/d9f99a752573bfc9e506ae85faf57110d78764c1))





## [30.11.2](https://github.com/waitingsong/midway-components/compare/v30.11.1...v30.11.2) (2024-06-11)

**Note:** Version bump only for package @mwcp/otel





## [30.11.1](https://github.com/waitingsong/midway-components/compare/v30.11.0...v30.11.1) (2024-06-11)


### Bug Fixes

* **otel:** key of span event name ([3071ea0](https://github.com/waitingsong/midway-components/commit/3071ea068a6cad443acc2dcaf210df19fca3b8d7))





# [30.11.0](https://github.com/waitingsong/midway-components/compare/v30.10.2...v30.11.0) (2024-06-11)


### Features

* **otel:** expose DecoratorContext ([d7953e9](https://github.com/waitingsong/midway-components/commit/d7953e9efb8e196849b81c0bb5a9d5d7439a933e))





## [30.10.2](https://github.com/waitingsong/midway-components/compare/v30.10.1...v30.10.2) (2024-06-11)


### Bug Fixes

* **otel:** ctx.status assignment within handleTopExceptionAndNext() in middleware/helper.middleware.ts ([60ce644](https://github.com/waitingsong/midway-components/commit/60ce644278e956ea5499764fb80ed148aaa354b4))





## [30.10.1](https://github.com/waitingsong/midway-components/compare/v30.10.0...v30.10.1) (2024-06-09)

**Note:** Version bump only for package @mwcp/otel





# [30.10.0](https://github.com/waitingsong/midway-components/compare/v30.9.1...v30.10.0) (2024-06-09)


### Bug Fixes

* **otel:** isSpanEnded() in util.ts ([ba40cca](https://github.com/waitingsong/midway-components/commit/ba40ccaf2ce29181e8b654419f1feeaf50dd1cb2))


### Features

* **otel:** retrieve traceScope from methodArgs automatically ([644732d](https://github.com/waitingsong/midway-components/commit/644732d196b985516b72ac428f1c6ce75831800b))





## [30.9.1](https://github.com/waitingsong/midway-components/compare/v30.9.0...v30.9.1) (2024-06-08)

**Note:** Version bump only for package @mwcp/otel





# [30.9.0](https://github.com/waitingsong/midway-components/compare/v30.8.0...v30.9.0) (2024-06-08)


### Features

* **otel:** update AttrNames ([a9c92fd](https://github.com/waitingsong/midway-components/commit/a9c92fd627e4ee40b7f74b8b918c109ed0b59b01))





# [30.8.0](https://github.com/waitingsong/midway-components/compare/v30.7.2...v30.8.0) (2024-06-07)


### Features

* **otel:** decorator TraceLog() ([e427604](https://github.com/waitingsong/midway-components/commit/e4276040d9e45e9f62abd67f4fa1842114754b9e))
* **otel:** update DecoratorTraceDataResp, DecoratorTraceDataRespAsync ([b604ca9](https://github.com/waitingsong/midway-components/commit/b604ca9866f3eed313c6680fb254a87325aca9de))





## [30.7.2](https://github.com/waitingsong/midway-components/compare/v30.7.1...v30.7.2) (2024-06-07)


### Bug Fixes

* **otel:** DecoratorHandlerTraceInit.traceError() ([ab6f201](https://github.com/waitingsong/midway-components/commit/ab6f2010023c49ace75aa6b7132616bb0085d282))





## [30.7.1](https://github.com/waitingsong/midway-components/compare/v30.7.0...v30.7.1) (2024-06-07)


### Bug Fixes

* **otel:** DecoratorHandlerTraceBase.traceError() ([9872643](https://github.com/waitingsong/midway-components/commit/98726437db7636d89002d3f3eae2373c7bd73fa8))





# [30.7.0](https://github.com/waitingsong/midway-components/compare/v30.6.1...v30.7.0) (2024-06-06)


### Features

* **otel:** add properties of type DecoratorContextBase ([049d0de](https://github.com/waitingsong/midway-components/commit/049d0ded7209c7b1a2cb151cdb0beccdf119c208))





## [30.6.1](https://github.com/waitingsong/midway-components/compare/v30.6.0...v30.6.1) (2024-06-06)

**Note:** Version bump only for package @mwcp/otel





# [30.6.0](https://github.com/waitingsong/midway-components/compare/v30.5.0...v30.6.0) (2024-06-05)


### Features

* **otel:** expose genTraceScope() ([74cfd8d](https://github.com/waitingsong/midway-components/commit/74cfd8d1d2740b7d843c96d185fabc664ffca61d))





# [30.5.0](https://github.com/waitingsong/midway-components/compare/v30.4.0...v30.5.0) (2024-06-05)


### Features

* **otel:** Trace decorator accepts scope ([865bf31](https://github.com/waitingsong/midway-components/commit/865bf31fad008e9cb8871258446e2b6c8c398d00))





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

**Note:** Version bump only for package @mwcp/otel





# [30.1.0](https://github.com/waitingsong/midway-components/compare/v30.0.0...v30.1.0) (2024-06-03)


### Features

* **otel:** manage trace Context on OtelComponent ([dc55f8e](https://github.com/waitingsong/midway-components/commit/dc55f8e7782208227117c7fe82aa9e46ff61f85f))





# [30.0.0](https://github.com/waitingsong/midway-components/compare/v29.3.1...v30.0.0) (2024-06-02)

**Note:** Version bump only for package @mwcp/otel





## [29.3.1](https://github.com/waitingsong/midway-components/compare/v29.3.0...v29.3.1) (2024-05-31)

**Note:** Version bump only for package @mwcp/otel





# [29.3.0](https://github.com/waitingsong/midway-components/compare/v29.2.0...v29.3.0) (2024-05-31)

**Note:** Version bump only for package @mwcp/otel





# [29.2.0](https://github.com/waitingsong/midway-components/compare/v29.1.0...v29.2.0) (2024-05-30)

**Note:** Version bump only for package @mwcp/otel





# [29.1.0](https://github.com/waitingsong/midway-components/compare/v29.0.1...v29.1.0) (2024-05-29)

**Note:** Version bump only for package @mwcp/otel





## [29.0.1](https://github.com/waitingsong/midway-components/compare/v29.0.0...v29.0.1) (2024-05-28)

**Note:** Version bump only for package @mwcp/otel





# [29.0.0](https://github.com/waitingsong/midway-components/compare/v28.2.0...v29.0.0) (2024-05-27)

**Note:** Version bump only for package @mwcp/otel





# [28.2.0](https://github.com/waitingsong/midway-components/compare/v28.1.1...v28.2.0) (2024-05-24)

**Note:** Version bump only for package @mwcp/otel





## [28.1.1](https://github.com/waitingsong/midway-components/compare/v28.1.0...v28.1.1) (2024-05-24)

**Note:** Version bump only for package @mwcp/otel





# [28.1.0](https://github.com/waitingsong/midway-components/compare/v28.0.0...v28.1.0) (2024-05-23)


### Features

* **otel:** set enableMiddleware to true in config.default.ts ([a5f34a3](https://github.com/waitingsong/midway-components/commit/a5f34a34bf4ff3cd9f15054bd1aa15ca20c68fa3))





# [28.0.0](https://github.com/waitingsong/midway-components/compare/v27.0.1...v28.0.0) (2024-05-23)


### Features

* **otel:** breaking change parameters order and return type of decorator before()/after() ([f8eb988](https://github.com/waitingsong/midway-components/commit/f8eb98831a6e4deb25e7c1867e7bec3cc9e8dfe2))





## [27.0.1](https://github.com/waitingsong/midway-components/compare/v27.0.0...v27.0.1) (2024-05-22)

**Note:** Version bump only for package @mwcp/otel





# [27.0.0](https://github.com/waitingsong/midway-components/compare/v26.5.3...v27.0.0) (2024-05-21)


### Features

* **otel:** breaking change functions ([a6d5459](https://github.com/waitingsong/midway-components/commit/a6d54596ee5e620bc690eb5f7436875e134d3787))
* **otel:** process span name correctly ([6773857](https://github.com/waitingsong/midway-components/commit/6773857c6e8541ff830010013a055b26873f6643))





## [26.5.3](https://github.com/waitingsong/midway-components/compare/v26.5.2...v26.5.3) (2024-05-21)


### Bug Fixes

* **otel:** tracing event if ctx.path matched  otelMiddlewareConfig.ignore lists ([4c1d55c](https://github.com/waitingsong/midway-components/commit/4c1d55c7aa92e8cc448935a34c8ea609fed8ef5a))





## [26.5.2](https://github.com/waitingsong/midway-components/compare/v26.5.1...v26.5.2) (2024-05-09)

**Note:** Version bump only for package @mwcp/otel





## [26.5.1](https://github.com/waitingsong/midway-components/compare/v26.5.0...v26.5.1) (2024-04-25)


### Bug Fixes

* **otel:** import assert {type} to import with {type} ([c788e6b](https://github.com/waitingsong/midway-components/commit/c788e6b0fd22a752979b9a6fb44f188a94278bf2))





# [26.5.0](https://github.com/waitingsong/midway-components/compare/v26.4.0...v26.5.0) (2024-04-24)

**Note:** Version bump only for package @mwcp/otel





# [26.4.0](https://github.com/waitingsong/midway-components/compare/v26.3.2...v26.4.0) (2024-04-24)

**Note:** Version bump only for package @mwcp/otel





## [26.3.2](https://github.com/waitingsong/midway-components/compare/v26.3.1...v26.3.2) (2024-04-24)

**Note:** Version bump only for package @mwcp/otel





## [26.3.1](https://github.com/waitingsong/midway-components/compare/v26.3.0...v26.3.1) (2024-04-23)

**Note:** Version bump only for package @mwcp/otel





# [26.3.0](https://github.com/waitingsong/midway-components/compare/v26.2.1...v26.3.0) (2024-04-23)

**Note:** Version bump only for package @mwcp/otel





# [26.2.0](https://github.com/waitingsong/midway-components/compare/v26.1.0...v26.2.0) (2024-04-22)

**Note:** Version bump only for package @mwcp/otel





# [26.1.0](https://github.com/waitingsong/midway-components/compare/v26.0.2...v26.1.0) (2024-04-22)


### Features

* **otel:** update TraceInit span name for MidwayJs lifeCycle ([541c47c](https://github.com/waitingsong/midway-components/commit/541c47c11b8a541ed1e70cfca2fdf6f1792725f5))





## [26.0.2](https://github.com/waitingsong/midway-components/compare/v26.0.1...v26.0.2) (2024-04-22)

**Note:** Version bump only for package @mwcp/otel





# [26.0.0](https://github.com/waitingsong/midway-components/compare/v25.2.3...v26.0.0) (2024-04-21)

**Note:** Version bump only for package @mwcp/otel





## [25.2.3](https://github.com/waitingsong/midway-components/compare/v25.2.2...v25.2.3) (2024-04-14)

**Note:** Version bump only for package @mwcp/otel





## [25.2.2](https://github.com/waitingsong/midway-components/compare/v25.2.1...v25.2.2) (2024-04-09)

**Note:** Version bump only for package @mwcp/otel





## [25.2.1](https://github.com/waitingsong/midway-components/compare/v25.2.0...v25.2.1) (2024-04-09)

**Note:** Version bump only for package @mwcp/otel





# [25.2.0](https://github.com/waitingsong/midway-components/compare/v25.1.0...v25.2.0) (2024-04-09)

**Note:** Version bump only for package @mwcp/otel





# [25.1.0](https://github.com/waitingsong/midway-components/compare/v25.0.2...v25.1.0) (2024-04-09)

**Note:** Version bump only for package @mwcp/otel





## [25.0.2](https://github.com/waitingsong/midway-components/compare/v25.0.1...v25.0.2) (2024-04-08)

**Note:** Version bump only for package @mwcp/otel





## [25.0.1](https://github.com/waitingsong/midway-components/compare/v25.0.0...v25.0.1) (2024-04-08)

**Note:** Version bump only for package @mwcp/otel





# [25.0.0](https://github.com/waitingsong/midway-components/compare/v24.2.4...v25.0.0) (2024-04-08)

**Note:** Version bump only for package @mwcp/otel





## [24.2.4](https://github.com/waitingsong/midway-components/compare/v24.2.3...v24.2.4) (2024-04-08)

**Note:** Version bump only for package @mwcp/otel





## [24.2.3](https://github.com/waitingsong/midway-components/compare/v24.2.2...v24.2.3) (2024-04-08)

**Note:** Version bump only for package @mwcp/otel





## [24.2.2](https://github.com/waitingsong/midway-components/compare/v24.2.1...v24.2.2) (2024-04-07)

**Note:** Version bump only for package @mwcp/otel





## [24.2.1](https://github.com/waitingsong/midway-components/compare/v24.2.0...v24.2.1) (2024-04-05)

**Note:** Version bump only for package @mwcp/otel





# [24.2.0](https://github.com/waitingsong/midway-components/compare/v24.1.0...v24.2.0) (2024-04-05)

**Note:** Version bump only for package @mwcp/otel





# [24.1.0](https://github.com/waitingsong/midway-components/compare/v24.0.0...v24.1.0) (2024-04-05)


### Features

* **otel:** update AttrNames ([d0362e2](https://github.com/waitingsong/midway-components/commit/d0362e2205f83e678156fdc508b31c137ed6836c))





# [24.0.0](https://github.com/waitingsong/midway-components/compare/v23.2.0...v24.0.0) (2024-04-03)

**Note:** Version bump only for package @mwcp/otel





# [23.1.0](https://github.com/waitingsong/midway-components/compare/v23.0.0...v23.1.0) (2024-04-02)

**Note:** Version bump only for package @mwcp/otel





# [23.0.0](https://github.com/waitingsong/midway-components/compare/v22.1.2...v23.0.0) (2024-03-27)

**Note:** Version bump only for package @mwcp/otel





## [22.1.2](https://github.com/waitingsong/midway-components/compare/v22.1.1...v22.1.2) (2024-03-08)

**Note:** Version bump only for package @mwcp/otel





# [22.1.0](https://github.com/waitingsong/midway-components/compare/v22.0.1...v22.1.0) (2024-03-05)

**Note:** Version bump only for package @mwcp/otel





## [22.0.1](https://github.com/waitingsong/midway-components/compare/v22.0.0...v22.0.1) (2024-02-26)

**Note:** Version bump only for package @mwcp/otel





# [22.0.0](https://github.com/waitingsong/midway-components/compare/v21.1.0...v22.0.0) (2024-02-25)


### Bug Fixes

* **otel:** breaking change var type ..Decortaor.. to ..Decorator from @mwcp/share ([0984de2](https://github.com/waitingsong/midway-components/commit/0984de236e6bfd0eae705e5fb53015df01eca5bb))





# [21.0.0](https://github.com/waitingsong/midway-components/compare/v20.12.0...v21.0.0) (2024-02-25)

**Note:** Version bump only for package @mwcp/otel





# [20.12.0](https://github.com/waitingsong/midway-components/compare/v20.11.1...v20.12.0) (2024-02-25)

**Note:** Version bump only for package @mwcp/otel





# [20.11.0](https://github.com/waitingsong/midway-components/compare/v20.10.1...v20.11.0) (2024-02-22)

**Note:** Version bump only for package @mwcp/otel





## [20.10.1](https://github.com/waitingsong/midway-components/compare/v20.10.0...v20.10.1) (2024-02-03)

**Note:** Version bump only for package @mwcp/otel





# [20.10.0](https://github.com/waitingsong/midway-components/compare/v20.9.0...v20.10.0) (2024-02-02)

**Note:** Version bump only for package @mwcp/otel





# [20.9.0](https://github.com/waitingsong/midway-components/compare/v20.8.1...v20.9.0) (2024-01-27)

**Note:** Version bump only for package @mwcp/otel





# [20.8.0](https://github.com/waitingsong/midway-components/compare/v20.7.0...v20.8.0) (2024-01-26)


### Features

* deleteRouter if enableDefaultRoute false ([bc4027e](https://github.com/waitingsong/midway-components/commit/bc4027ed6c4233ee906dee9bae97986ff9f5e1c2))





# [20.7.0](https://github.com/waitingsong/midway-components/compare/v20.6.0...v20.7.0) (2024-01-26)

**Note:** Version bump only for package @mwcp/otel





# [20.6.0](https://github.com/waitingsong/midway-components/compare/v20.5.0...v20.6.0) (2024-01-26)

**Note:** Version bump only for package @mwcp/otel





# [20.5.0](https://github.com/waitingsong/midway-components/compare/v20.4.0...v20.5.0) (2024-01-26)

**Note:** Version bump only for package @mwcp/otel





# [20.3.0](https://github.com/waitingsong/midway-components/compare/v20.2.0...v20.3.0) (2024-01-25)

**Note:** Version bump only for package @mwcp/otel





# [20.0.0](https://github.com/waitingsong/midway-components/compare/v19.2.5...v20.0.0) (2024-01-21)

**Note:** Version bump only for package @mwcp/otel
