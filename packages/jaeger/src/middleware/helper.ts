import { readFile } from 'fs/promises'

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

  if (ctx.request.headers['user-agent']) {
    tags[TracerTag.httpUserAgent] = ctx.request.headers['user-agent']
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

export interface ProcInfo {
  cpuinfo: Record<string, string>
  meminfo: Record<string, string>
  stat: Record<string, string>
}

export async function retrieveSysinfo(): Promise<ProcInfo> {
  const ret: ProcInfo = {
    cpuinfo: {},
    meminfo: {},
    stat: {},
  }
  if (process.platform === 'linux') {
    return ret
  }

  const arr: (keyof ProcInfo)[] = ['cpuinfo', 'meminfo', 'stat']
  for (const name of arr) {
    try {
      const str = await readFile(`/proc/${name}`, 'utf-8')

      const item = ret[name]
      str.split('\n').forEach((line) => {
        const parts = line.split(':')
        if (parts.length === 2) {
          const [key, value] = parts
          if (! key || ! value) { return }
          const val = value.trim().split(' ', 1)[0]
          item[key] = val ? val : ''
        }
      })
    }
    catch (ex) {
      console.warn(ex)
    }
  }

  return ret
}

