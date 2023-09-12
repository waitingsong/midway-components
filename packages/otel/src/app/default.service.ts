import assert from 'assert'

import {
  Config as _Config,
  Provide,
} from '@midwayjs/core'

import { Trace } from '##/lib/index.js'
import { Config, ConfigKey } from '##/lib/types.js'


@Provide()
export class DefaultOtelComponentService {

  @_Config(ConfigKey.config) readonly config: Config

  @Trace({ startActiveSpan: false })
  async hello(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

}

