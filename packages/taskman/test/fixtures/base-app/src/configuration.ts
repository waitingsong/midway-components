import 'tsconfig-paths/register'
import { Configuration } from '@midwayjs/core'


@Configuration({
  imports: [ require('../../../../src'), ],
})
export class AutoConfiguration {
}
