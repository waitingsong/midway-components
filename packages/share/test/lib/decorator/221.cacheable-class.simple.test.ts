/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  it(apiMethod.simple, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.simple}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 2)
  })

  it(apiMethod.simpleNumber, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.simpleNumber}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 22)
  })


})

