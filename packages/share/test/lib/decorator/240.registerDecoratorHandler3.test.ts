/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const url = `${apiBase.method}/${apiMethod.handler}`
  const url2 = `${apiBase.method}/${apiMethod.after_throw}`
  const url3 = `${apiBase.method}/${apiMethod.after_throw_re_throw}`
  const url4 = `${apiBase.method}/${apiMethod.before_throw_re_throw}`
  const url5 = `${apiBase.method}/${apiMethod.before_throw_no_re_throw}`
  const url6 = `${apiBase.method}/${apiMethod.re_throw_at_after}`
  const url7 = `${apiBase.method}/${apiMethod.throw_at_after_return}`
  const url8 = `${apiBase.method}/${apiMethod.normal_aop}`

  it(url, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 12, data.toString())
  })

  it(url2, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url2)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url3, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url3)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url4, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url4)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url5, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url5)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url6, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url6)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url7, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url7)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })

  it(url8, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(url8)
    assert(resp.ok, resp.text)
    const data = resp.text
    assert(data === 'OK', data.toString())
  })
})

