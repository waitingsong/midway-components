/* eslint-disable @typescript-eslint/no-explicit-any */
import { MidwayWebRouterService } from '@midwayjs/core'
import type { RouterInfo } from '@midwayjs/core'

import type { Context, RouterInfoLite } from './types.js'


const routerInfoMap = new Map<string, RouterInfoLite>()
const cacheLimit = 256

export async function getRouterInfo(ctx: Context, writeCache = true, limit = cacheLimit): Promise<RouterInfoLite | undefined> {
  const key = `${ctx.path}:${ctx.method}`
  const routerInfo = routerInfoMap.get(key) ?? await _getRouterInfo(ctx)
  if (routerInfo && writeCache) {
    saveCache(key, routerInfo, limit)
  }
  return routerInfo
}

async function _getRouterInfo(ctx: Context): Promise<RouterInfoLite | undefined> {
  const container = ctx.app.getApplicationContext()
  const svc = await container.getAsync(MidwayWebRouterService)
  const routerInfo = await svc.getMatchedRouterInfo(ctx.path, ctx.method)
  if (! routerInfo) { return }

  const ret = genLiteFromInfo(routerInfo)
  return ret
}


function saveCache(key: string, data: RouterInfoLite, limit = cacheLimit): void {
  if (routerInfoMap.size >= limit) {
    routerInfoMap.clear()
  }
  routerInfoMap.set(key, data)
}

function genLiteFromInfo(input: RouterInfo): RouterInfoLite {
  const ret: RouterInfoLite = {
    id: input.id ?? '',
    prefix: input.prefix ?? '',
    routerName: input.routerName ?? '',
    url: input.url,
    requestMethod: input.requestMethod,
    handlerName: input.handlerName ?? '',
    funcHandlerName: input.funcHandlerName ?? '',
    controllerId: input.controllerId ?? '',
    functionName: input.functionName ?? '',
    fullUrl: input.fullUrl ?? '',
    fullUrlCompiledRegexp: input.fullUrlCompiledRegexp instanceof RegExp ? input.fullUrlCompiledRegexp : void 0,
    fullUrlFlattenString: input.fullUrlFlattenString ?? '',
  }
  return ret
}
