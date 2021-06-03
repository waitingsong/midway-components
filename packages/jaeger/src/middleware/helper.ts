import { IMidwayWebContext } from '@midwayjs/web'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import { NpmPkg } from '@waiting/shared-types'
import { Tags } from 'opentracing'

import { TracerManager } from '../lib/tracer'
import { SpanLogInput, TracerLog, TracerTag } from '../lib/types'
import { retrieveExternalNetWorkInfo } from '../util/common'


const netInfo = retrieveExternalNetWorkInfo()

export function updateSpan(ctx: IMidwayWebContext): void {
  const { tracerManager } = ctx
  const pkg = ctx.app.getConfig('pkg') as NpmPkg
  const tags: SpanLogInput = {
    [Tags.HTTP_METHOD]: ctx.req.method ?? 'n/a',
    [TracerTag.svcName]: pkg.name,
  }

  if (pkg.version) {
    tags[TracerTag.svcVer] = pkg.version
  }
  if (ctx.reqId) {
    tags[TracerTag.reqId] = ctx.reqId
  }

  netInfo.forEach((ipInfo) => {
    if (ipInfo.family === 'IPv4') {
      tags[TracerTag.svcIp4] = ipInfo.cidr
    }
    else {
      tags[TracerTag.svcIp6] = ipInfo.cidr
    }
  })

  tags[Tags.PEER_HOST_IPV4] = ctx.request.ip

  tracerManager.addTags(tags)
}


export function logError(trm: TracerManager, err: Error): void {
  const input: SpanLogInput = {
    event: TracerLog.error,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  }

  // ctx._internalError in error-handler.middleware.ts
  if (err instanceof Error) {
    input[TracerLog.resMsg] = err.message
    const { stack } = err
    if (stack) {
      // udp limit 65k
      // @link https://www.jaegertracing.io/docs/1.22/client-libraries/#emsgsize-and-udp-buffer-limits
      input[TracerLog.errStack] = stack.slice(0, 20000)
    }
  }

  trm.spanLog(input)
}
