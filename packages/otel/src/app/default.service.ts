import assert from 'assert'

import {
  Config as _Config,
  Provide,
} from '@midwayjs/decorator'

import { Trace } from '../lib/trace.decorator'
import { Config, ConfigKey } from '../lib/types'


@Provide()
export class DefaultOtelComponentService {

  @_Config(ConfigKey.config) readonly config: Config

  @Trace(void 0, { startActiveSpan: false })
  async hello(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

}

