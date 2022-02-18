import assert from 'assert/strict'

import { TestResponse, TestRespBody } from '@/root.config'
import {
  JwtMsg,
  JwtState,
} from '~/index'


export function authShouldPassed(
  resp: TestResponse,
  expectPayload: unknown,
): void {

  const { status } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === 200)
  assert(jwtState)
  assert(jwtState.user)
  assert(jwtState.header)
  assert(jwtState.signature)
  assert.deepStrictEqual(jwtState.user, expectPayload)
}

export function authShouldSkipped(
  resp: TestResponse,
): void {

  const { status } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === 200)
  console.info({ jwtState })
  assert(! jwtState.user)
  assert(! jwtState.signature)
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

export function authShouldFailedWithNotFound(
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

export function authShouldValidatFailed(
  resp: TestResponse,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === 401)
  assert(! jwtState)
  assert(error)
  assert(error.text.includes('401'))
}

export function authShouldPassthroughNotFound(
  resp: TestResponse,
  expectStatus = 200,
): void {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(jwtState)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenNotFound))
}

export function authShouldPassthroughValidFailed(
  resp: TestResponse,
  expectStatus = 200,
): void {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(jwtState)
  assert(! jwtState.user)
  assert(! jwtState.secret)
  assert(! jwtState.signature)
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenValidFailed))
}


export function authShouldRedirect(
  resp: TestResponse,
  redirectUrl: string,
): void {

  const { status } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === 302)
  assert(! jwtState)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const loc = resp.header.location as string
  assert(loc === redirectUrl)
}

export function authShouldPassthroughEmptyStringNotFound(
  resp: TestResponse,
  expectStatus = 200,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(! jwtState)
  assert(error)
  assert(error.text.includes('401'))
}

export function authShouldFailedWithNotFoundFromDebug(
  resp: TestResponse,
  expectStatus = 401,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as TestRespBody

  assert(status === expectStatus)
  assert(! jwtState)
  assert(error)
  assert(error.text.includes('401'))
  // assert(error.text.includes(JwtMsg.TokenNotFound))
}

declare module '@midwayjs/core' {
  interface Context {
    jwtState: JwtState
  }
}
