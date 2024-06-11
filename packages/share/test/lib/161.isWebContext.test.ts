/* eslint-disable @typescript-eslint/no-unsafe-argument */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { isWebContext } from '##/lib/decorator/reg-decorator-handler.helper.js'


describe(fileShortPath(import.meta.url), () => {

  const ctx = {
    app: {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getApp: () => {},
    res: {},
    response: {},
  } as any

  describe('Should isWebContext() work', () => {
    it('normal', async () => {
      const ret = isWebContext(ctx)
      assert(ret)
    })

    it('invalid partial', async () => {
      let arg = {
        ...ctx,
        app: {},
        getApp: 'fake',
      }
      assert(! isWebContext(arg))

      arg = { ...ctx, res: 'fake' }
      assert(! isWebContext(arg))

      arg = { ...ctx, response: 'fake' }
      assert(! isWebContext(arg))
    })

    it('invalid', async () => {
      const arg = { } as any
      assert(! isWebContext(arg))
      assert(! isWebContext(void 0))
    })
  })
})

