import { Singleton } from '@midwayjs/core'

import { InputOptions, ThrowInAround } from './204.throw_in_around.helper.js'


@Singleton()
export class FullService {

  @ThrowInAround()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @ThrowInAround()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

