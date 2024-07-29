import { Singleton } from '@midwayjs/core'

import { EatThrowInAfter, InputOptions } from './203.eat_throw_in_after.helper.js'


@Singleton()
export class FullService {

  @EatThrowInAfter()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @EatThrowInAfter()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

