import assert from 'assert/strict'

import { IMiddleware } from '@midwayjs/core'


import { TestResponse } from '@/root.config'
import {
  Context,
  NextFunction,
  JwtMsg,
  JwtState,
} from '~/index'


const next: NextFunction = async () => { return }

export async function authShouldPassed(
  resp: TestResponse,
  expectPayload: unknown,
): Promise<void> {

  const { status, jwtState } = resp
  assert(status === 200)
  assert(jwtState)
  assert(jwtState.user)
  assert(jwtState.header)
  assert(jwtState.signature)
  assert.deepStrictEqual(jwtState.user, expectPayload)
}

export async function authShouldSkipped(
  ctx: Context,
  mw: IMiddleware<Context, NextFunction>,
): Promise<void> {

  const fn = mw.resolve()
  if (typeof fn !== 'function') {
    throw new TypeError('Not function')
  }
  await fn(ctx, next)
  const { status, jwtState } = ctx
  assert(status === 200)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)
}

export async function authShouldFailedWithNotFound(
  resp: TestResponse,
  expectStatus = 401,
): Promise<void> {

  const { status, jwtState } = resp
  assert(status === expectStatus)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.AuthFailed))

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // if (typeof ex.originalError !== 'undefined') {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //   const omsg = (ex.originalError as Error).message
  //   assert(omsg.includes(JwtMsg.TokenNotFound))
  // }

  return
  // assert(false, `should throw error with status: "${status}", but not.`)
}

export async function authShouldValidatFailed(
  ctx: Context,
  mw: IMiddleware<Context, NextFunction>,
): Promise<void> {

  try {
    const fn = mw.resolve()
    if (typeof fn !== 'function') {
      throw new TypeError('Not function')
    }
    await fn(ctx, next)
  }
  catch (ex: any) {
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
  resp: TestResponse,
  expectStatus = 200,
): Promise<void> {

  const { status, jwtState } = resp
  assert(status === expectStatus)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  const { jwtOriginalError } = jwtState
  assert(jwtOriginalError && jwtOriginalError instanceof Error)
  if (jwtOriginalError) {
    const omsg = jwtOriginalError.message
    assert(omsg.includes(JwtMsg.TokenNotFound))
  }
}

export async function authShouldPassthroughValidFailed(
  ctx: Context,
  mw: IMiddleware<Context, NextFunction>,
  status = 200,
): Promise<void> {

  const fn = mw.resolve()
  if (typeof fn !== 'function') {
    throw new TypeError('Not function')
  }
  await fn(ctx, next)
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
  mw: IMiddleware<Context, NextFunction>,
  redirectUrl: string,
): Promise<void> {

  const fn = mw.resolve()
  if (typeof fn !== 'function') {
    throw new TypeError('Not function')
  }
  await fn(ctx, next)
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
  mw: IMiddleware<Context, NextFunction>,
  status = 200,
): Promise<void> {

  try {
    const fn = mw.resolve()
    if (typeof fn !== 'function') {
      throw new TypeError('Not function')
    }
    await fn(ctx, next)
  }
  catch (ex: any) {
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
  mw: IMiddleware<Context, NextFunction>,
  status = 401,
): Promise<void> {

  try {
    const fn = mw.resolve()
    if (typeof fn !== 'function') {
      throw new TypeError('Not function')
    }
    await fn(ctx, next)
  }
  catch (ex: any) {
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

declare module '@midwayjs/core' {
  interface Context {
    jwtState: JwtState
  }
}
