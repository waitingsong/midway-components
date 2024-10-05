import { Singleton } from '@midwayjs/core'

import { InputOptions, ThrowInBeforeDefaultAfterThrow } from './209.throw_in_before_default_after_thrown.helper.js'


@Singleton()
export class FullService {

  @ThrowInBeforeDefaultAfterThrow()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @ThrowInBeforeDefaultAfterThrow()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

