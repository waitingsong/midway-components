import assert from 'assert'

import {
  initialAuthOpts,
  initialJwtMiddlewareConfig,
  initialJwtConfig,
  JwtMsg,
} from './config'
import {
  JwtConfig,
  JwtMiddlewareConfig,
  JwtPayload,
  JwtToken,
} from './types'


/** Generate jwtConfig with input and default value */
export function parseConfig(input: JwtConfig): JwtConfig {
  const config = {
    agent: initialJwtMiddlewareConfig.agent,
    client: genJwtMiddlewareConfig(input.client),
    enable: initialJwtMiddlewareConfig.enable,
  } as JwtConfig


  /* istanbul ignore else */
  if (typeof input.enable === 'boolean') {
    config.enable = input.enable
  }

  /* istanbul ignore else */
  if (typeof input.ignore !== 'undefined') {
    config.ignore = input.ignore
  }

  /* istanbul ignore else */
  if (typeof input.match !== 'undefined') {
    config.match = input.match
  }

  config.appWork = typeof input.appWork === 'boolean'
    ? input.appWork
    : initialJwtMiddlewareConfig.appWork

  config.appMiddlewareIndex = typeof input.appMiddlewareIndex === 'number'
    ? input.appMiddlewareIndex
    : initialJwtMiddlewareConfig.appMiddlewareIndex

  return config
}

export function genJwtConfig(input?: Partial<JwtConfig>): JwtConfig {
  const ret: JwtConfig = {
    ...initialJwtConfig,
    ...input,
  }
  return ret
}


/** Generate jwtConfig with input and default value */
export function genJwtMiddlewareConfig(input?: Partial<JwtMiddlewareConfig>): JwtMiddlewareConfig {
  const ret: JwtMiddlewareConfig = {
    ...initialJwtMiddlewareConfig,
    ...input,
  }
  return ret
}


export function validateTokenString(input: JwtToken): void {
  if (typeof input === 'string') {
    assert(input.length > 0)
  }
  else {
    throw new TypeError(JwtMsg.InvalidInput)
  }
}


export function validatePayload(input: JwtPayload): void {
  if (typeof input === 'string') {
    assert(input.length > 0, JwtMsg.InvalidInputString)
    return
  }
  else if (Buffer.isBuffer(input)) {
    assert(input.length > 0, JwtMsg.InvalidInputBuffer)
  }
  else if (typeof input === 'object') {
    assert(Object.keys(input).length > 0)
  }
  else {
    throw new TypeError(JwtMsg.InvalidInput)
  }

}


export function validateSignSecret(input: JwtConfig['secret']): void {
  if (typeof input === 'string') {
    assert(input.length > 0, JwtMsg.InvalidInputString)
    return
  }
  else if (Buffer.isBuffer(input)) {
    assert(input.length > 0, JwtMsg.InvalidInputBuffer)
  }
  else if (typeof input === 'object') {
    assert(Object.keys(input).length > 0)
    assert(typeof input.key === 'string' && input.key.length > 0)
    assert(typeof input.passphrase === 'string')
  }
  else {
    throw new TypeError(JwtMsg.InvalidInput)
  }
}


export function validateVerifySecret(input: JwtConfig['verifySecret']): void {
  if (input === false) {
    return
  }
  else if (typeof input === 'string') {
    assert(input.length > 0, JwtMsg.InvalidInputString)
  }
  else if (Buffer.isBuffer(input)) {
    assert(input.length > 0, JwtMsg.InvalidInputBuffer)
  }
  // else if (typeof input === 'function') { // promise callback
  //   return
  // }
  else {
    throw new TypeError(JwtMsg.InvalidInput)
  }
}
