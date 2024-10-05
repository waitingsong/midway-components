
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  it(apiMethod.methodIgnoreIfMethodDecoratorKeys, async () => {
    const { httpRequest } = testConfig
    const url = `${apiBase.methodCacheable2}/${apiMethod.methodIgnoreIfMethodDecoratorKeys}`

    const resp = await httpRequest.get(url)
    assert(resp)
    assert(resp.ok, resp.text)
    const data = resp.body as number
    assert(data === 4, resp.text)
  })

})

