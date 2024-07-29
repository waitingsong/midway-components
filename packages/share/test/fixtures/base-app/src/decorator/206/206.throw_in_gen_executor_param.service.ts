import { Singleton } from '@midwayjs/core'

import { ThrowInGenExecutorParam, InputOptions } from './206.throw_in_gen_executor_param.helper.js'


@Singleton()
export class FullService {

  @ThrowInGenExecutorParam()
  async hello(options: InputOptions): Promise<number> {
    const ret = options.input
    return ret
  }

  @ThrowInGenExecutorParam()
  helloSync(options: InputOptions): number {
    const ret = options.input
    return ret
  }
}

