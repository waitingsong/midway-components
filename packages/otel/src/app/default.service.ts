import assert from 'assert'

import { Provide } from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace } from '##/lib/index.js'
import { Config, ConfigKey } from '##/lib/types.js'


@Provide()
export class DefaultOtelComponentService {

  @MConfig(ConfigKey.config) readonly config: Config

  @Trace({ startActiveSpan: false })
  async hello(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

}

