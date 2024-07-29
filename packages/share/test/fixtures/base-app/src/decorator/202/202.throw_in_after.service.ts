import { Singleton } from '@midwayjs/core'

import { ThrowInAfter, InputOptions } from './202.throw_in_after.helper.js'


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

