
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const path = `${apiBase.demo}/${apiMethod.id}`

  it(path, async () => {
    const { httpRequest } = testConfig

    const url = path + '/123'
    const resp = await httpRequest.get(url)
    assert(resp.ok, resp.text)

    const res = resp.text
    assert(res === 'OK')
  })

})

