import assert from 'node:assert'
import { KeyObject } from 'node:crypto'

import { Msg } from './types.js'
import type { Config, JwtPayload, JwtToken } from './types.js'


export function validateTokenString(input: JwtToken): void {
  if (typeof input === 'string') {
    assert(input.length > 0)
  }
  else {
    throw new TypeError(Msg.InvalidInput)
  }
}


export function validatePayload(input: JwtPayload): void {
  if (typeof input === 'string') {
    assert(input.length > 0, Msg.InvalidInputString)
    return
  }
  else if (Buffer.isBuffer(input)) {
    assert(input.length > 0, Msg.InvalidInputBuffer)
  }
  else if (typeof input === 'object') {
    assert(Object.keys(input).length > 0)
  }
  else {
    throw new TypeError(Msg.InvalidInput)
  }

}


export function validateSignSecret(input: Config['secret']): void {
  if (typeof input === 'string') {
    assert(input.length > 0, Msg.InvalidInputString)
    return
  }
  else if (Buffer.isBuffer(input)) {
    assert(input.length > 0, Msg.InvalidInputBuffer)
  }
  else if (input instanceof KeyObject) {
    assert(input.type)
  }
  else if (typeof input === 'object') {
    assert(Object.keys(input).length > 0)
    const prop = Object.getOwnPropertyDescriptor(input, 'key')
    assert(prop, 'key property not found')
    // assert(typeof input.key === 'string' && input.key.length > 0)
    assert(typeof input.key === 'string' || Buffer.isBuffer(input.key))
    assert(typeof input.passphrase === 'string')
  }
  else {
    throw new TypeError(Msg.InvalidInput)
  }
}


export function validateVerifySecret(input: unknown): void {
  if (typeof input === 'string') {
    assert(input.length > 0, Msg.InvalidInputString)
  }
  else if (Buffer.isBuffer(input)) {
    assert(input.length > 0, Msg.InvalidInputBuffer)
  }
  // else if (typeof input === 'function') { // promise callback
  //   return
  // }
  else {
    throw new TypeError(Msg.InvalidInput)
  }
}
