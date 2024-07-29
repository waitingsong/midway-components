import { Singleton } from '@midwayjs/core'

import { EatThrowInBefore, InputOptions } from './201.eat_throw_in_before.helper.js'


@Singleton()
export class FullService {

  @EatThrowInBefore()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @EatThrowInBefore()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

