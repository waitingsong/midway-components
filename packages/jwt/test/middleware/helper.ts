import assert from 'node:assert/strict'

import { JwtMsg } from '##/index.js'
import type { JwtState } from '##/index.js'
import type { TestResponse, RespData2 } from '#@/root.config.js'


export function authShouldPassed(
  resp: TestResponse,
  expectPayload: unknown,
): void {

  const { status } = resp
  const { jwtState } = resp.body as RespData2

  assert(status === 200)
  assert(jwtState)
  assert(jwtState.user)
  assert(jwtState.header)
  assert(jwtState.signature)
  assert.deepStrictEqual(jwtState.user, expectPayload)
}

export function authShouldSkipped(resp: TestResponse): void {

  const { status } = resp
  const { jwtState } = resp.body as RespData2

  assert(status === 200)
  console.info({ jwtState })
  assert(! jwtState.user, 'jwtState.user empty')
  assert(! jwtState.signature, 'jwtState.signature empty')
}

export function authShouldFailedWithNotFound2(
  resp: TestResponse,
  expectStatus = 401,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as RespData2

  assert(status === expectStatus)
  assert(! jwtState, 'jwtState not empty')
  assert(error)
  assert(error.text.includes('401') || error.text.includes(JwtMsg.AuthFailed))
}

export function authShouldFailedWithNotFound(
  resp: TestResponse,
  expectStatus = 401,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as RespData2

  assert(status === expectStatus)
  assert(! jwtState, 'jwtState not empty')
  assert(error, 'error empty')
  assert(error.text.includes('401') || error.text.includes(JwtMsg.AuthFailed))
}

export function authShouldValidatFailed(resp: TestResponse): void {

  const { status, error } = resp
  const { jwtState } = resp.body as RespData2

  assert(status === 401)
  assert(! jwtState, 'jwtState not empty')
  assert(error)
  assert(error.text.includes('401') || error.text.includes(JwtMsg.AuthFailed))
}

export function authShouldPassthroughNotFound(
  resp: TestResponse,
  expectStatus = 200,
): void {

  const { status } = resp
  const { jwtState, jwtOriginalErrorText } = resp.body as RespData2

  assert(status === expectStatus, `status: ${status} != expect: ${expectStatus}`)
  validateData(resp.body as RespData2)
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenNotFound), jwtOriginalErrorText)
}

export function authShouldPassthroughValidFailed(
  resp: TestResponse,
  expectStatus = 200,
): void {

  const { status } = resp
  const { jwtOriginalErrorText } = resp.body as RespData2

  assert(status === expectStatus, `status: ${status} != expect: ${expectStatus}`)
  validateData(resp.body as RespData2)
  assert(jwtOriginalErrorText.includes(JwtMsg.TokenValidFailed), jwtOriginalErrorText)
}


export function authShouldRedirect(
  resp: TestResponse,
  redirectUrl: string,
): void {

  const { status } = resp
  const { jwtState } = resp.body as RespData2

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
  const { jwtState } = resp.body as RespData2

  assert(status === expectStatus)
  assert(! jwtState)
  assert(error)
  assert(error.text.includes('401') || error.text.includes(JwtMsg.AuthFailed))
}

export function authShouldFailedWithNotFoundFromDebug(
  resp: TestResponse,
  expectStatus = 401,
): void {

  const { status, error } = resp
  const { jwtState } = resp.body as RespData2

  assert(status === expectStatus)
  assert(! jwtState)
  assert(error)
  assert(error.text.includes('401') || error.text.includes(JwtMsg.TokenNotFound))
}

function validateData(data: RespData2): void {
  const { jwtState } = data

  assert(jwtState, 'jwtState empty')
  assert(! jwtState.user, 'jwtState.user empty')
  assert(! jwtState.secret, 'jwtState.secret empty')
  assert(! jwtState.signature, 'jwtState.signature empty')
}

declare module '@midwayjs/core' {
  interface Context {
    jwtState: JwtState
  }
}
