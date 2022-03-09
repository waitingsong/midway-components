import 'tsconfig-paths/register'
import { Configuration } from '@midwayjs/decorator'


@Configuration({
  imports: [require('../../../../src')],
  importConfigs: [
    {
      default: {
        jwt: {
          expiresIn: '200s',
          secret: 'abc123',
        },
      },
    },
  ],
})
export class AutoConfiguration {
}
