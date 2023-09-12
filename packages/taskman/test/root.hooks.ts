import assert from 'node:assert'

import { testConfig } from './root.config.js'

import { TaskQueueRepository } from '##/index.js'


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
      const { repo } = testConfig
      assert(repo instanceof TaskQueueRepository)
      await Promise.all([repo.db.refTables.ref_tb_task().del()])
    },

    afterEach: async () => {
      const { repo } = testConfig
      assert(repo instanceof TaskQueueRepository)
      await Promise.all([repo.db.refTables.ref_tb_task().del()])
    },
  }

}

