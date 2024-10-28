import type { Context as _Context } from '@midwayjs/grpc'

import type { Context } from '../lib/types.js'


export interface GrpcContext extends _Context {
  /**
   * @example '/helloworld.Greeter/SayHello'
   */
  path: string
  call: object
  pendingStatus: { code: number, details: string }
  status?: number
}

/**
 * @returns 'http' | 'grpc' | ''
 */
export function retrieveRequestProtocolFromCtx(ctx: Context | GrpcContext): string {
  // @ts-expect-error protocol
  if (typeof ctx.request === 'object' && ctx.request.protocol && typeof ctx.request.protocol === 'string'
    && typeof ctx.call === 'undefined') { // http

    // @ts-expect-error protocol
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ctx.request.protocol
  }

  if (typeof ctx.call === 'object' && typeof ctx.writable === 'boolean') { // grpc
    return 'grpc'
  }

  return ''
}

