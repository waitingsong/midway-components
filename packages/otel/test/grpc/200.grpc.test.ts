import assert from 'node:assert'
import { join } from 'node:path'

import { createGRPCConsumer } from '@midwayjs/grpc'
import { fileShortPath, retrieveDirname } from '@waiting/shared-core'

import { assertJaegerParentSpanArray, assertRootSpan, retrieveTraceInfoFromRemote, sortSpans } from '##/index.js'
import type { helloworld } from '#@/domain/helloworld.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {
  describe('should create grpc service in one server', () => {
    const id = 1
    const name = 'harry'

    const options = {
      package: 'helloworld',
      protoPath: join(testConfig.testDir, 'grpc', 'helloworld.proto'),
      url: 'localhost:6565',
    }

    it('normal', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const res = await service.sayHello().sendMessage({ id, name })

      console.info({ res })
      assert(res.id === id)
      assert(res.message === `Hello ${name}`)

      await assertAll(res.traceId)
    })

    it('req2', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const res = await service.sayHello().sendMessage({ id, name })
      console.info({ res })
      assert(res.id === id)
      assert(res.message === `Hello ${name}`)
      await assertAll(res.traceId)

      const res2 = await service.sayHello().sendMessage({ id, name })
      console.info({ res2 })
      assert(res2.id === id)
      assert(res2.message === `Hello ${name}`)
      await assertAll(res2.traceId)
    })

    it('parallel request with same client', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const id2 = 2
      const pms1 = service.sayHello().sendMessage({ id, name })
      const pms2 = service.sayHello().sendMessage({ id: id2, name })

      await Promise.all([pms1, pms2]).then(async ([res1, res2]) => {
        console.info({ res1, res2 })
        assert(res1.id === id)
        assert(res1.message === `Hello ${name}`)
        assert(res2.id === id2)
        assert(res2.message === `Hello ${name}`)

        await assertAll(res1.traceId)
        await assertAll(res2.traceId)
      })
    })

    it('parallel request with different client', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const service2 = await createGRPCConsumer<helloworld.GreeterClient>(options)

      const id2 = 2
      const pms1 = service.sayHello().sendMessage({ id, name })
      const pms2 = service2.sayHello().sendMessage({ id: id2, name })

      await Promise.all([pms1, pms2]).then(async ([res1, res2]) => {
        console.info({ res1, res2 })
        assert(res1.id === id)
        assert(res1.message === `Hello ${name}`)
        assert(res2.id === id2)
        assert(res2.message === `Hello ${name}`)

        await assertAll(res1.traceId)
        await assertAll(res2.traceId)
      })
    })

    it('error', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      try {
        await service.sayHello2().sendMessage({ id, name })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('Method not implemented'), ex.message)
        return
      }
      assert(false, 'should throw Error')
    })

  })
})


async function assertAll(traceId?: string): Promise<void> {
  assert(traceId && traceId.length === 32, `traceId: ${traceId}`)

  const [info] = await retrieveTraceInfoFromRemote(traceId, 2)
  assert(info)
  const [rootSpan, span1] = sortSpans(info.spans)
  assert(rootSpan)
  assert(span1)

  assertJaegerParentSpanArray([
    { parentSpan: rootSpan, childSpan: span1 },
  ])

  const path = '/helloworld.Greeter/SayHello'
  assertRootSpan({
    scheme: 'grpc',
    operationName: `RPC ${path}`,
    path,
    span: rootSpan,
    traceId,
    tags: {
      'http.method': 'SayHello',
      'http.target': path,
      'http.route': 'unknown',
      'span.kind': 'server',
      'otel.status_code': 'OK',
    },
    mergeDefaultTags: false,
    mergeDefaultLogs: false,
  })

}
