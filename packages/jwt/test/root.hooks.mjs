import { jwtConfig, jwtMiddlewareConfig } from '../src/config/config.unittest.js'
import { ConfigKey } from '../src/lib/types.js'

import { testConfig } from './root.config.js'

/**
 * @see https://mochajs.org/#root-hook-plugins
 * beforeAll:
 *  - In serial mode(Mocha’s default ), before all tests begin, once only
 *  - In parallel mode, run before all tests begin, for each file
 * beforeEach:
 *  - In both modes, run before each test
 */
export const mochaHooks = async () => {
  return {
    beforeEach: async () => {
      const { app } = testConfig
      app.addConfigObject({
        [ConfigKey.config]: jwtConfig,
        [ConfigKey.middlewareConfig]: jwtMiddlewareConfig,
      })
      return
    },
  }
}
