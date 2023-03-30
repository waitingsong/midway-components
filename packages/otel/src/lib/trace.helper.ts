/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import {
  REQUEST_OBJ_CTX_KEY,
  JoinPoint,
} from '@midwayjs/core'
import type { Context as WebContext } from '@mwcp/share'
import { Attributes, SpanOptions } from '@opentelemetry/api'

import { TraceService } from './trace.service'
import {
  AttrNames,
  ConfigKey,
  TraceContext,
  TraceDecoratorArg,
  TraceDecoratorOptions,
} from './types'


export interface MetaDataType {
  target: new (...args: unknown[]) => unknown
  propertyName: string
  metadata: TraceDecoratorArg | undefined
}

interface GenKeyOptions extends Partial<TraceDecoratorOptions> {
  webContext: WebContext
  methodArgs: unknown[]
  callerClass: string
  callerMethod: string
}

function genKey(options: GenKeyOptions): string {
  const {
    webContext,
    methodArgs,
    spanName,
  } = options

  switch (typeof spanName) {
    case 'string': {
      if (spanName.length > 0) {
        return spanName
      }
      break
    }

    case 'undefined': {
      const name = `${options.callerClass.toString()}/${options.callerMethod.toString()}`
      return name
    }

    case 'function': {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const keyStr = spanName.call(webContext, methodArgs)
      assert(
        typeof keyStr === 'string' || typeof keyStr === 'undefined',
        'keyGenerator function must return a string or undefined',
      )
      if (keyStr) {
        return keyStr
      }
      break
    }

    default: {
      assert(false, 'spanName must be a string or a function')
    }
  }

  const name = `${options.callerClass.toString()}/${options.callerMethod.toString()}`
  return name
}

export interface PrepareAroundFactoryReturn {
  func: (...args: unknown[]) => unknown
  funcArgs: unknown[]
  callerAttr: Attributes
  spanName: string
  spanOptions: Partial<SpanOptions>
  startActiveSpan: boolean
  target: unknown
  traceContext: TraceContext | undefined
  traceService: TraceService
}

export function prepareAroundFactory(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
): PrepareAroundFactoryReturn {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  const instance = joinPoint.target
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const callerClass = instance.constructor?.name ?? metaDataOptions.target.name
  const callerMethod = joinPoint.methodName
  const { args, target } = joinPoint

  const callerAttr: Attributes = {
    [AttrNames.CallerClass]: callerClass,
    [AttrNames.CallerMethod]: callerMethod,
  }

  const { metadata } = metaDataOptions
  const mdata: SpanOptions = metadata && typeof metadata === 'object'
    ? metadata
    : {}

  const keyOpts: GenKeyOptions = {
    ...mdata,
    methodArgs: args,
    webContext,
    callerClass,
    callerMethod,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  // const func = joinPoint.proceed.bind(joinPoint.target)
  const func = joinPoint.proceed.bind(void 0)

  // const traceService = (webContext[`_${ConfigKey.serviceName}`]
  //   ?? await webContext.requestContext.getAsync(TraceService)) as TraceService
  const traceService = webContext[`_${ConfigKey.serviceName}`] as TraceService
  assert(traceService, `traceService undefined on webContext[_${ConfigKey.serviceName}]`)
  assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

  const traceDecoratorArg = args[1] as TraceDecoratorArg | undefined

  const startActiveSpan = typeof traceDecoratorArg === 'object'
    ? traceDecoratorArg.startActiveSpan ?? true
    : true

  const traceContext = typeof traceDecoratorArg === 'object'
    ? traceDecoratorArg.traceContext
    : void 0

  // if (! mdata.startTime) {
  //   const now = Date.now()
  //   mdata.startTime = now
  // }

  const opts: PrepareAroundFactoryReturn = {
    func,
    // index:0 may webcontext
    funcArgs: args,
    callerAttr,
    spanName,
    spanOptions: mdata,
    startActiveSpan,
    target,
    traceContext,
    traceService,
  }
  return opts
}
