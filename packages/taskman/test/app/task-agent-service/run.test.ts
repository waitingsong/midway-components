import { basename } from '@waiting/shared-core'
import { testConfig } from 'test/test-config'

import { createTasks } from '../helper'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe.skip(filename, () => {

  describe('should run() work', () => {
    it('normal', (done) => {
      const { agent, svc, repo } = testConfig
      createTasks(svc, repo, 20).then(() => {
        agent.run()
        setTimeout(() => {
          agent.stop()
          assert(agent.isRunning === true)
          done()
        }, 500000)
      })
        .catch((ex) => {
          throw ex
        })

    })
  })
})
