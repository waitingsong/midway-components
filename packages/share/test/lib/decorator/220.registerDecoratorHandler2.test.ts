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

  it(apiMethod.simpleRequest, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.simpleRequest}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 2)
  })

  it(apiMethod.simpleRequest, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.simpleRequest}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 2)
  })

  it(apiMethod.simpleMix, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.simpleMix}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 3)
  })

  it(apiMethod.simpleClassOnly, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.simpleClassOnly}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 3)
  })

  it(apiMethod.classIgnoreIfMethodDecoratorKeys, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.classIgnoreIfMethodDecoratorKeys}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 6, resp.text)
  })

  it(apiMethod.classIgnoreIfMethodDecoratorKeys2, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.classIgnoreIfMethodDecoratorKeys2}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 4, resp.text)
  })

  it(apiMethod.methodIgnoreIfMethodDecoratorKeys, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.methodIgnoreIfMethodDecoratorKeys}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 4, resp.text)
  })

  it(apiMethod.methodIgnoreIfMethodDecoratorKeys2, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.methodIgnoreIfMethodDecoratorKeys2}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 3, resp.text)
  })

  it(apiMethod.methodIgnoreIfMethodDecoratorKeys2, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.multi}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 4, resp.text)
  })

})

