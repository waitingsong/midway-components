import assert from 'node:assert'

import { GrpcMethod, Init, Inject, Singleton } from '@midwayjs/core'
import { Clients } from '@midwayjs/grpc'
import { type GrpcContext, MConfig } from '@mwcp/share'

import { helloworld } from '../types/domain.js'
import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'


@Singleton()
export class GreeterService {
  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: GrpcContext
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly grpcClients: Clients

  private greeterService: helloworld.GreeterClient

  @Init()
  async init() {
    // 赋值一个服务实例
    this.greeterService = this.grpcClients.getService<helloworld.GreeterClient>(
      'helloworld.Greeter',
    )
    assert(this.greeterService, 'this.greeterService not exists')
  }


  @Trace()
  async sayHello3(req: helloworld.HelloRequest): Promise<helloworld.HelloReply> {
    // 调用服务
    const res = await this.greeterService.sayHello().sendMessage(req)
    return res
  }
}


