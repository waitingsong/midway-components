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
  expectPayload: unknown,
): Promise<void> {

  // @ts-expect-error
  await mw(ctx, next)
  const { status, jwtState } = ctx
  assert(status === 200)
  assert(jwtState)
  assert(jwtState.user)
  assert(jwtState.header)
  assert(jwtState.signature)
  assert.deepStrictEqual(ctx.jwtState.user && ctx.jwtState.user, expectPayload)
}

export async function authShouldSkipped(
  ctx: Context,
  mw: MidwayWebMiddleware,
): Promise<void> {

  // @ts-expect-error
  await mw(ctx, next)
  const { status, jwtState } = ctx
  assert(status === 200)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)
}

export async function authShouldFailedWithNotFound(
  ctx: Context,
  mw: MidwayWebMiddleware,
  status = 401,
): Promise<void> {

  try {
    // @ts-expect-error
    await mw(ctx, next)
  }
  catch (ex) {
    assert(ctx.status === status)

    const msg = (ex as Error).message
    assert(msg.includes(JwtMsg.AuthFailed))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const omsg = (ex.originalError as Error).message
    assert(omsg.includes(JwtMsg.TokenNotFound))

    const { jwtState } = ctx
    assert(! jwtState.user)
    assert(! jwtState.secret)
    assert(! jwtState.signature)
    return
  }
  assert(false, `should throw error with status: "${status}", but not.`)
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

    const { jwtState } = ctx
    assert(! jwtState.user)
    assert(! jwtState.secret)
    assert(! jwtState.signature)
    return
  }
  assert(false, 'should throw error 401, but not.')
}

export async function authShouldPassthroughNotFound(
  ctx: Context,
  mw: MidwayWebMiddleware,
  status = 200,
): Promise<void> {

  // @ts-expect-error
  await mw(ctx, next)
  assert(ctx.status === status)
  const { jwtState } = ctx
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  const { jwtOriginalError } = ctx.jwtState
  assert(jwtOriginalError && jwtOriginalError instanceof Error)
  if (jwtOriginalError) {
    const omsg = jwtOriginalError.message
    assert(omsg.includes(JwtMsg.TokenNotFound))
  }
}

export async function authShouldPassthroughValidFailed(
  ctx: Context,
  mw: MidwayWebMiddleware,
  status = 200,
): Promise<void> {

  // @ts-expect-error
  await mw(ctx, next)
  assert(ctx.status === status)
  const { jwtState } = ctx
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  const { jwtOriginalError } = ctx.jwtState
  assert(jwtOriginalError && jwtOriginalError instanceof Error)
  if (jwtOriginalError) {
    const omsg = jwtOriginalError.message
    assert(omsg.includes(JwtMsg.TokenValidFailed))
  }
}


export async function authShouldRedirect(
  ctx: Context,
  mw: MidwayWebMiddleware,
  redirectUrl: string,
): Promise<void> {

  // @ts-expect-error
  await mw(ctx, next)
  const { status, jwtState } = ctx
  assert(status === 302)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  const location = ctx.res.getHeader('location')
  assert(location === redirectUrl)
}

export async function authShouldPassthroughEmptyStringNotFound(
  ctx: Context,
  mw: MidwayWebMiddleware,
  status = 200,
): Promise<void> {

  try {
    // @ts-expect-error
    await mw(ctx, next)
  }
  catch (ex) {
    assert(ctx.status === status)
    const msg = (ex as Error).message
    assert(msg.includes(JwtMsg.AuthFailed))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const omsg = (ex.originalError as Error).message
    assert(omsg.includes(JwtMsg.TokenNotFound))

    const { jwtState } = ctx
    assert(! jwtState.user)
    assert(! jwtState.secret)
    assert(! jwtState.signature)
    return
  }
  assert(false, 'should throw error 401, but not.')
}

export async function authShouldFailedWithNotFoundFromDebug(
  ctx: Context,
  mw: MidwayWebMiddleware,
  status = 401,
): Promise<void> {

  try {
    // @ts-expect-error
    await mw(ctx, next)
  }
  catch (ex) {
    assert(ctx.status === status)

    const msg = (ex as Error).message
    assert(msg.includes(JwtMsg.TokenNotFound))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const omsg = (ex.originalError as Error).message
    assert(omsg.includes(JwtMsg.TokenNotFound))

    const { jwtState } = ctx
    assert(! jwtState.user)
    assert(! jwtState.secret)
    assert(! jwtState.signature)
    return
  }
  assert(false, `should throw error with status: "${status}", but not.`)
}
