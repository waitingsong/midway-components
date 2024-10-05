import { Singleton } from '@midwayjs/core'

import { InputOptions, ThrowInBefore } from './200.throw_in_before.helper.js'


@Singleton()
export class FullService {

  @ThrowInBefore()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @ThrowInBefore()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

