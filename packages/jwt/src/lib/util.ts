import assert from 'assert'

import { JwtMsg } from './config'
import {
  Config,
  JwtPayload,
  JwtToken,
} from './types'


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


export function validateSignSecret(input: Config['secret']): void {
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


export function validateVerifySecret(input: unknown): void {
  if (typeof input === 'string') {
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
