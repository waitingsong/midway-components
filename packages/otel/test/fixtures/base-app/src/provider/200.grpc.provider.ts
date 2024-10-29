import assert from 'node:assert'

import { GrpcMethod, Inject, MSProviderType, Provider } from '@midwayjs/core'
import { type GrpcContext, MConfig } from '@mwcp/share'

import { helloworld } from '../types/domain.js'
import { Trace, TraceService } from '../types/index.js'
import { TraceAppLogger, TraceLogger } from '../types/lib-index.js'
import { Config, ConfigKey } from '../types/lib-types.js'


@Provider(MSProviderType.GRPC, { package: 'helloworld' })
export class Greeter implements helloworld.Greeter {
  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: GrpcContext
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger
  @Inject() readonly appLogger: TraceAppLogger


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
  sayHello2(req: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
    assert(typeof req.id === 'number', 'request.id must be number')
    throw new Error('Method not implemented.')
  }

}


