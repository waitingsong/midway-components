import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import type { TraceContext } from '##/index.js'
import { TraceService } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('TraceService TraceContext', () => {
    it('normal', async () => {
      const { container } = testConfig
      const traceService = await container.getAsync(TraceService)
      assert(traceService, 'traceService not found')

      const scope = Symbol('not-request')
      const { span, traceContext } = traceService.startScopeActiveSpan({
        name: 'foo',
        scope,
      })
      assert(span)

      const traceContext2 = traceService.getRootTraceContext(scope)
      assert(traceContext2)
      assert(traceContext2 === traceContext)

      // will skip update
      traceService.setRootContext(scope, traceContext)

      const traceContext3 = traceService.getRootTraceContext(scope)
      assert(traceContext3 === traceContext)

      try {
        traceService.setRootContext(scope, {} as TraceContext)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('scope root trace context exists already'), ex.message)
        return
      }
      finally {
        traceService.endSpan({ span, scope })
      }
      assert(false, 'should throw Error')
    })

    it('child span', async () => {
      const { container } = testConfig
      const traceService = await container.getAsync(TraceService)
      assert(traceService, 'traceService not found')

      const scope = Symbol('not-request')
      const { span, traceContext } = traceService.startScopeActiveSpan({
        name: 'foo1',
        scope,
      })
      assert(span)

      const traceContext2 = traceService.getRootTraceContext(scope)
      assert(traceContext2)
      assert(traceContext2 === traceContext)

      // will skip update
      traceService.setRootContext(scope, traceContext)

      const traceContext3 = traceService.getRootTraceContext(scope)
      assert(traceContext3 === traceContext)

      const { span: span2 } = traceService.startScopeActiveSpan({
        name: 'foo2',
        scope,
      })
      assert(span2)

      try {
        traceService.setRootContext(scope, {} as TraceContext)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('scope root trace context exists already'), ex.message)
        return
      }
      finally {
        traceService.endSpan({ span: span2, scope })
        traceService.endSpan({ span, scope })
      }
      assert(false, 'should throw Error')
    })

    it('retrieveParentTraceInfoBySpan()', async () => {
      const { container } = testConfig
      const traceService = await container.getAsync(TraceService)
      assert(traceService, 'traceService not found')

      const scope = Symbol('not-request-2')
      const { span, traceContext } = traceService.startScopeActiveSpan({
        name: 'foo3',
        scope,
      })
      assert(span)

      const { span: span2 } = traceService.startScopeActiveSpan({
        name: 'foo4',
        scope,
      })
      assert(span2)

      try {
        const info = traceService.retrieveParentTraceInfoBySpan(span2, scope)
        assert(info)
        const { traceContext: ctx3, span: span3 } = info
        assert(ctx3 === traceContext)
        assert(span3 === span)
      }
      finally {
        traceService.endSpan({ span: span2, scope })
        traceService.endSpan({ span, scope })
      }
    })
  })
})
