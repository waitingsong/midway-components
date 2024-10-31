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
    const id2 = 2
    const name = 'harry'

    const options = {
      package: 'helloworld',
      protoPath: join(testConfig.testDir, 'grpc', 'helloworld.proto'),
      url: 'localhost:6565',
    }

    it('normal', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const res = await service.sayHello({ timeout: 3000 }).sendMessage({ id, name })

      console.info({ res })
      assert(res.id === id)
      assert(res.message === `Hello ${name}`)

      await assertAll(res.traceId)
    })

    it('req2', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const res = await service.sayHello({ timeout: 3000 }).sendMessage({ id, name })
      console.info({ res })
      assert(res.id === id)
      assert(res.message === `Hello ${name}`)
      await assertAll(res.traceId)

      const res2 = await service.sayHello({ timeout: 3000 }).sendMessage({ id, name })
      console.info({ res2 })
      assert(res2.id === id)
      assert(res2.message === `Hello ${name}`)
      await assertAll(res2.traceId)
    })

    it('parallel request with same client', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const pms1 = service.sayHello({ timeout: 3000 }).sendMessage({ id, name })
      const pms2 = service.sayHello({ timeout: 3000 }).sendMessage({ id: id2, name })

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

      const pms1 = service.sayHello({ timeout: 3000 }).sendMessage({ id, name })
      const pms2 = service2.sayHello({ timeout: 3000 }).sendMessage({ id: id2, name })

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
        await service.sayError().sendMessage({ id, name })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('Method not implemented'), ex.message)
        return
      }
      assert(false, 'should throw Error')
    })

    it('request grpc server', async () => {
      const service = await createGRPCConsumer<helloworld.GreeterClient>(options)
      const res = await service.sayHello3().sendMessage({ id: id2, name })

      console.info({ res })
      assert(res.id === id2)
      assert(res.message === `Hello ${name}`)

      await assert3(res.traceId)
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


async function assert3(traceId?: string): Promise<void> {
  assert(traceId && traceId.length === 32, `traceId: ${traceId}`)

  const [info] = await retrieveTraceInfoFromRemote(traceId, 3)
  assert(info)
  const [rootSpan, span1, span2] = sortSpans(info.spans)
  assert(rootSpan)
  assert(span1)
  assert(span2)

  assertJaegerParentSpanArray([
    { parentSpan: rootSpan, childSpan: span1 },
    { parentSpan: span1, childSpan: span2 },
  ])

  const path = '/helloworld.Greeter/SayHello3'
  assertRootSpan({
    scheme: 'grpc',
    operationName: `RPC ${path}`,
    path,
    span: rootSpan,
    traceId,
    tags: {
      'http.method': 'SayHello3',
      'http.target': path,
      'http.route': 'unknown',
      'span.kind': 'server',
      'otel.status_code': 'OK',
    },
    mergeDefaultTags: false,
    logs: [
      {},
      { event: 'incoming.request.data', 'http.request.body': JSON.stringify({ id: 2, name: 'harry' }, null, 2) },
      {},
      {},
      {
        event: 'outgoing.response.data',
        'http.response.body': JSON.stringify({ id: 2, message: 'Hello harry', traceId }, null, 2),
        'http.response.code': 200,
      },
    ],
  })

}

