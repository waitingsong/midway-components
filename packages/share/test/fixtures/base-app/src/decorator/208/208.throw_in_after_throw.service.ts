import { Singleton } from '@midwayjs/core'

import { ThrowInAfterThrow, InputOptions } from './208.throw_in_after_throw.helper.js'


@Singleton()
export class FullService {

  @ThrowInAfterThrow()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @ThrowInAfterThrow()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

