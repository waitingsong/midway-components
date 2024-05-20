/* eslint-disable @typescript-eslint/no-explicit-any */
import { MidwayWebRouterService, RouterInfo } from '@midwayjs/core'

import type { Context } from './types.js'


const routerInfoMap = new Map<string, RouterInfoLite>()
const cacheLimit = 256

export interface RouterInfoLite {
  /** uuid */
  id: string
  /** router prefix from controller */
  prefix: string
  /** router alias name */
  routerName: string
  /** router path, without prefix */
  url: string | RegExp
  /** request method for http, like get/post/delete */
  requestMethod: string
  /** router handler function key，for IoC container load */
  handlerName: string
  /** serverless func load key, will be override by @ServerlessTrigger and @ServerlessFunction */
  funcHandlerName: string
  /** controller provideId */
  controllerId: string
  /**
   * serverless function name, will be override by @ServerlessTrigger and @ServerlessFunction
   */
  functionName: string
  /**
   * url with prefix
   */
  fullUrl: string
  /**
   * pattern after path-regexp compile
   */
  fullUrlCompiledRegexp: RegExp | undefined
  /**
   * url after wildcard and can be path-to-regexp by path-to-regexp v6
   */
  fullUrlFlattenString: string
}

export async function getRouterInfo(ctx: Context, writeCache = true): Promise<RouterInfoLite | undefined> {
  const key = `${ctx.path}:${ctx.method}`
  const routerInfo = routerInfoMap.get(key) ?? await _getRouterInfo(ctx)
  if (routerInfo && writeCache) {
    saveCache(key, routerInfo)
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


function saveCache(key: string, data: RouterInfoLite): void {
  if (routerInfoMap.size >= cacheLimit) {
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
