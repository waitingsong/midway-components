import { IMidwayKoaNext } from '@midwayjs/koa'
import { MidwayWebMiddleware } from '@midwayjs/web'

import {
  Context,
  JwtMsg,
} from '~/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const next: IMidwayKoaNext = async () => { return }

export async function authShouldPassed(
  ctx: Context,
  mw: MidwayWebMiddleware,
): Promise<void> {

  // @ts-expect-error
  await mw(ctx, next)
  const { status } = ctx
  assert(status === 200)
}

export async function authShouldFailedWithNotFound(
  ctx: Context,
  mw: MidwayWebMiddleware,
): Promise<void> {

  try {
    // @ts-expect-error
    await mw(ctx, next)
  }
  catch (ex) {
    assert(ctx.status === 401)

    const msg = (ex as Error).message
    assert(msg.includes(JwtMsg.AuthFailed))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const omsg = (ex.originalError as Error).message
    assert(omsg.includes(JwtMsg.TokenNotFound))

    assert(! ctx.jwtState.user)
    return
  }
  assert(false, 'should throw error 401, but not.')
}

export async function authShouldValidatFailed(
  ctx: Context,
  mw: MidwayWebMiddleware,
): Promise<void> {

  try {
    // @ts-expect-error
    await mw(ctx, next)
  }
  catch (ex) {
    assert(ctx.status === 401)
    const msg = (ex as Error).message
    assert(msg.includes(JwtMsg.AuthFailed))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const omsg = (ex.originalError as Error).message
    assert(omsg.includes(JwtMsg.TokenValidFailed))

    assert(! ctx.jwtState.user)
    return
  }
  assert(false, 'should throw error 401, but not.')
}

