import assert from 'assert/strict'

import { TestResponse } from '@/root.config'
import {
  JwtMsg,
  JwtState,
} from '~/index'


export async function authShouldPassed(
  resp: TestResponse,
  expectPayload: unknown,
): Promise<void> {

  const { status, jwtState, text } = resp

  assert(text === 'OK')
  assert(status === 200)
  assert(jwtState)
  assert(jwtState.user)
  assert(jwtState.header)
  assert(jwtState.signature)
  assert.deepStrictEqual(jwtState.user, expectPayload)
}

export async function authShouldSkipped(
  resp: TestResponse,
): Promise<void> {

  const { status, jwtState } = resp

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
  resp: TestResponse,
): Promise<void> {

  const { status, jwtState } = resp

  assert(status === 401)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.AuthFailed))

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // const omsg = (ex.originalError as Error).message
  // assert(omsg.includes(JwtMsg.TokenValidFailed))

  return
  // assert(false, 'should throw error 401, but not.')
}

export async function authShouldPassthroughNotFound(
  resp: TestResponse,
  expectStatus = 200,
): Promise<void> {

  const { status, jwtState, text } = resp

  assert(text === 'OK')
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
  resp: TestResponse,
  expectStatus = 200,
): Promise<void> {

  const { status, jwtState, text } = resp

  assert(text === 'OK')
  assert(status === expectStatus)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  const { jwtOriginalError } = jwtState
  assert(jwtOriginalError && jwtOriginalError instanceof Error)
  if (jwtOriginalError) {
    const omsg = jwtOriginalError.message
    assert(omsg.includes(JwtMsg.TokenValidFailed))
  }
}


export async function authShouldRedirect(
  resp: TestResponse,
  redirectUrl: string,
): Promise<void> {

  const { status, jwtState } = resp

  assert(status === 302)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  const location = resp.header('location') as string
  assert(location === redirectUrl)
}

export async function authShouldPassthroughEmptyStringNotFound(
  resp: TestResponse,
  expectStatus = 200,
): Promise<void> {

  const { status, jwtState, text } = resp

  assert(text === 'OK')
  assert(status === expectStatus)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.AuthFailed))

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // const omsg = (ex.originalError as Error).message
  // assert(omsg.includes(JwtMsg.TokenNotFound))

  return
  assert(false, 'should throw error 401, but not.')
}

export async function authShouldFailedWithNotFoundFromDebug(
  resp: TestResponse,
  expectStatus = 401,
): Promise<void> {

  const { status, jwtState } = resp

  assert(status === expectStatus)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.TokenNotFound))

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // const omsg = (ex.originalError as Error).message
  // assert(omsg.includes(JwtMsg.TokenNotFound))

  return
  // assert(false, `should throw error with status: "${expectStatus}", but not.`)
}

declare module '@midwayjs/core' {
  interface Context {
    jwtState: JwtState
  }
}
