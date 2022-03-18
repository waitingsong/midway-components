import assert from 'assert/strict'
import { relative } from 'path'


import { testConfig } from 'test/root.config'

import { createTasks } from '../helper'


const filename = relative(process.cwd(), __filename)

describe.skip(filename, () => {

  describe('should run() work', () => {
    it('normal', (done) => {
      const { agent, svc, repo } = testConfig
      createTasks(svc, repo, 20).then(async () => {
        await agent.run()
        setTimeout(() => {
          agent.stop()
            .then(() => {
              assert(agent.isRunning === true)
              done()
            })
            .catch((ex) => {
              throw ex
            })
        }, 500000)
      })
        .catch((ex) => {
          throw ex
        })

    })
  })
})
