import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { registerMiddleware } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {
  describe(`Should registerMiddleware() work`, () => {

    it(`default`, () => {
      const { app } = testConfig
      const name = 'UnitTestMiddleware'
      const item = {
        name: name + Math.random().toString(),
      }

      registerMiddleware(app, item)

      const middlewares = app.getMiddleware().getNames()
      assert(middlewares.length > 0)

      const ret = middlewares.includes(item.name)
      assert(ret, JSON.stringify(middlewares, null, 2))

      assert(middlewares[0] !== item.name)
      assert(! middlewares.includes(name))
    })

    it(`first`, () => {
      const { app } = testConfig
      const name = 'UnitTestMiddleware'
      const item = {
        name: name + Math.random().toString(),
      }

      registerMiddleware(app, item, 'first')

      const middlewares = app.getMiddleware().getNames()
      assert(middlewares.length > 0)

      const ret = middlewares.includes(item.name)
      assert(ret, JSON.stringify(middlewares, null, 2))

      assert(middlewares[0] === item.name)
      assert(! middlewares.includes(name))
    })

    it(`last`, () => {
      const { app } = testConfig
      const name = 'UnitTestMiddleware'
      const item = {
        name: name + Math.random().toString(),
      }

      registerMiddleware(app, item, 'last')

      const middlewares = app.getMiddleware().getNames()
      assert(middlewares.length > 0)

      const ret = middlewares.includes(item.name)
      assert(ret, JSON.stringify(middlewares, null, 2))

      assert(middlewares.at(-1) === item.name)
      assert(! middlewares.includes(name))
    })

    it(`duplicate`, () => {
      const { app } = testConfig
      const name = 'UnitTestMiddleware'
      const item = {
        name: name + Math.random().toString(),
      }

      registerMiddleware(app, item, 'first')
      registerMiddleware(app, item, 'first')

      const middlewares = app.getMiddleware().getNames()
      assert(middlewares.length > 0)

      const ret = middlewares.includes(item.name)
      assert(ret, JSON.stringify(middlewares, null, 2))

      assert(middlewares[0] !== middlewares[1])
    })

    it(`duplicate force`, () => {
      const { app } = testConfig
      const name = 'UnitTestMiddleware'
      const item = {
        name: name + Math.random().toString(),
      }

      registerMiddleware(app, item, 'first')
      registerMiddleware(app, item, 'first', true)

      const middlewares = app.getMiddleware().getNames()
      assert(middlewares.length > 0)

      const ret = middlewares.includes(item.name)
      assert(ret, JSON.stringify(middlewares, null, 2))

      assert(middlewares[0] === middlewares[1])
    })

    it(`first and array`, () => {
      const { app } = testConfig
      const name = 'UnitTestMiddleware'
      const item = {
        name: name + Math.random().toString(),
      }

      registerMiddleware(app, [item], 'first')

      const middlewares = app.getMiddleware().getNames()
      assert(middlewares.length > 0)

      const ret = middlewares.includes(item.name)
      assert(ret, JSON.stringify(middlewares, null, 2))

      assert(middlewares[0] === item.name)
      assert(! middlewares.includes(name))
    })


  })
})

