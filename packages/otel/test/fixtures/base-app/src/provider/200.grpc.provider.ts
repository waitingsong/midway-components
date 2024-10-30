import assert from 'node:assert'

import { GrpcMethod, Init, Inject, MSProviderType, Provider } from '@midwayjs/core'
import { Clients } from '@midwayjs/grpc'
import { type GrpcContext, MConfig } from '@mwcp/share'

import { helloworld } from '../types/domain.js'
import { Trace, TraceService } from '../types/index.js'
import { TraceAppLogger, TraceLogger } from '../types/lib-index.js'
import { Config, ConfigKey } from '../types/lib-types.js'

import { GreeterService } from './200s.grpc.service.js'


@Provider(MSProviderType.GRPC, { package: 'helloworld' })
export class Greeter implements helloworld.Greeter {
  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: GrpcContext
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger
  @Inject() readonly appLogger: TraceAppLogger

  @Inject() readonly greeterSvc: GreeterService

  @Trace()
  @GrpcMethod()
  async sayHello(req: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
    assert(typeof req.id === 'number', 'request.id must be number')
    const traceId = this.traceSvc.getTraceId()
    const res: helloworld.HelloReply = {
      id: req.id,
      message: 'Hello ' + req.name,
      traceId,
    }
    return res
  }

  @Trace()
  @GrpcMethod()
  sayError(req: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
    assert(typeof req.id === 'number', 'request.id must be number')
    throw new Error('Method not implemented.')
  }

  @Trace()
  @GrpcMethod()
  async sayHello3(req: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
    const traceId = this.traceSvc.getTraceId()
    const res = await this.greeterSvc.sayHello3(req)
    res.traceId = traceId
    return res
  }
}


