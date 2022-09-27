import {
  Config as _Config,
  Provide,
} from '@midwayjs/decorator'
import { Trace } from '@mwcp/otel'

import { Msg } from '../lib/types'


@Provide()
export class UserService {

  @Trace()
  async hello(): Promise<string> {
    return Msg.hello
  }
}

