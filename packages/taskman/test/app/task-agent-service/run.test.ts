import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createTasks } from '../helper'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe.skip(filename, () => {

  describe('should run() work', () => {
    it('normal', (done) => {
      const { agent, svc, repo } = testConfig
      createTasks(svc, repo, 20).then(async () => {
        await agent.run()
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
