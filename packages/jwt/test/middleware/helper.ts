import assert from 'assert/strict'

import { TestResponse, TestRespBody } from '@/root.config'
import {
  JwtMsg,
  JwtState,
} from '~/index'


export async function authShouldPassed(
  resp: TestResponse,
  expectPayload: unknown,
): Promise<void> {

  const { status } = resp
  const { jwtState } = resp.body as TestRespBody

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

  const { status } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === 200)
  assert(! jwtState)
}

export function authShouldFailedWithNotFound2(
  resp: TestResponse,
  expectStatus = 401,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(! jwtState)
  assert(error)
  assert(error.text.includes('401'))
}

export async function authShouldFailedWithNotFound(
  resp: TestResponse,
  expectStatus = 401,
): Promise<void> {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(! jwtState)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.AuthFailed))
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenNotFound))
}

export async function authShouldValidatFailed(
  resp: TestResponse,
): Promise<void> {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === 401)
  assert(jwtState)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.AuthFailed))

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // const omsg = (ex.originalError as Error).message
  // assert(omsg.includes(JwtMsg.TokenValidFailed))
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenValidFailed))
}

export async function authShouldPassthroughNotFound(
  resp: TestResponse,
  expectStatus = 200,
): Promise<void> {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(jwtState)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenNotFound))
}

export async function authShouldPassthroughValidFailed(
  resp: TestResponse,
  expectStatus = 200,
): Promise<void> {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(jwtState)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenValidFailed))
}


export async function authShouldRedirect(
  resp: TestResponse,
  redirectUrl: string,
): Promise<void> {

  const { status } = resp
  const { jwtState } = resp.body as TestRespBody

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

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.AuthFailed))
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenNotFound))
}

export async function authShouldFailedWithNotFoundFromDebug(
  resp: TestResponse,
  expectStatus = 401,
): Promise<void> {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(jwtState)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)

  // const msg = (ex as Error).message
  // assert(msg.includes(JwtMsg.TokenNotFound))
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenNotFound))
}

declare module '@midwayjs/core' {
  interface Context {
    jwtState: JwtState
  }
}
