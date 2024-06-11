import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { getWebContextFromArgs } from '##/lib/decorator/reg-decorator-handler.helper.js'


describe(fileShortPath(import.meta.url), () => {

  const ctx = {
    app: {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getApp: () => {},
    res: {},
    response: {},
  }

  describe('Should getWebContextFromArgs() work', () => {
    it('[ctx]', async () => {
      const ret = getWebContextFromArgs([ctx])
      assert(ret)
    })

    it('[{ webContext}]', async () => {
      const arg = { webContext: ctx } as any
      const ret = getWebContextFromArgs([arg])
      assert(ret)
    })

    it('invalid', async () => {
      const arg = { } as any
      assert(! getWebContextFromArgs([arg, void 0]))
      assert(! getWebContextFromArgs([]))
      assert(! getWebContextFromArgs(void 0))
    })
  })


})

