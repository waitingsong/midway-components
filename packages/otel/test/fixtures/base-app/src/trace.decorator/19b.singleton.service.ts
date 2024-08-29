/* eslint-disable @typescript-eslint/await-thenable */
import assert from 'node:assert'

import { Inject, Singleton } from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'


@Singleton()
export class SingletonService {

  @MConfig(ConfigKey.config) readonly config: Config
  @Inject() readonly traceSvc: TraceService

  @Trace({ scope: 'SingletonServiceTest' })
  async hello(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    await this.helloAsync(input)
    this.helloSync(input)
    return input
  }

  @Trace({ scope: 'SingletonServiceTest' })
  async helloAsync(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

  @Trace({ scope: 'SingletonServiceTest' })
  helloSync(input: string): string {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

}

