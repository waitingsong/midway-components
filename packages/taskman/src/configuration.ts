/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { Configuration } from '@midwayjs/decorator'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as db from '@mw-components/kmore'


const namespace = 'taskman'

@Configuration({
  namespace,
  imports: [
    jaeger,
    fetch,
    db,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
}

