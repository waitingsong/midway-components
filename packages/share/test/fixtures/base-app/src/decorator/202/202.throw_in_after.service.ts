import { Singleton } from '@midwayjs/core'

import { InputOptions, ThrowInAfter } from './202.throw_in_after.helper.js'


@Singleton()
export class FullService {

  @ThrowInAfter()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @ThrowInAfter()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

