import assert from 'assert'

import {
  Config as _Config,
  Provide,
} from '@midwayjs/core'

import { Trace } from '~/lib/trace.decorator'
import { Config, ConfigKey } from '~/lib/types'


@Provide()
export class DefaultComponentService {

  @_Config(ConfigKey.config) readonly config: Config

  @Trace({ startActiveSpan: false })
  async hello(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    const ret = await input
    return ret
  }

  @Trace({ startActiveSpan: false })
  helloSync(input: string): string {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

  @Trace<DefaultComponentService['testArgSync']>({
    spanName: (args) => `foo-${args[0]}`,
  })
  testArgSync(input: number): string {
    return input.toString()
  }

  @Trace<DefaultComponentService['testArg']>({
    startActiveSpan: false,
    spanName: (args) => `foo-${args[0]}`,
  })
  async testArg(input: number): Promise<string> {
    const ret = await input.toString()
    return ret
  }

  @Trace<DefaultComponentService['testArg2']>({
    spanName: ([v1, v2]) => `foo-${v1 + 1}-${v2}`,
  })
  async testArg2(v1: number, v2: string): Promise<string> {
    void v2
    const ret = await v1.toString()
    return ret
  }

  async error(triggerError: boolean): Promise<string> {
    if (triggerError) {
      throw new Error('debug for DefaultComponentService.error()')
    }
    return 'OK'
  }

  /** Error will be traced cause decorator */
  @Trace()
  async traceError(triggerError: boolean): Promise<string> {
    if (triggerError) {
      throw new Error('debug for DefaultComponentService.error()')
    }
    return 'OK'
  }

}

