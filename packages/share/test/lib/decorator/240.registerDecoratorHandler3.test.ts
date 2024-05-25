/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const url = `${apiBase.method}/${apiMethod.handler}`
  const url2 = `${apiBase.method}/${apiMethod.after_throw}`
  const url3 = `${apiBase.method}/${apiMethod.after_throw_re_throw}`

  it(url, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 12, data.toString())
  })

  it(url2, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url2)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url3, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url3)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })
})

