import { Configuration } from '@midwayjs/decorator'


@Configuration({
  imports: [require('../../../../src')],
  importConfigs: [
    {
      default: { },
    },
  ],
})
export class AutoConfiguration {
}
