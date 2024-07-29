import { Singleton } from '@midwayjs/core'

import { EatThrowInAround, InputOptions } from './205.eat_throw_in_around.helper.js'


@Singleton()
export class FullService {

  @EatThrowInAround()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @EatThrowInAround()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

