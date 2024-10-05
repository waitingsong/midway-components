import assert from 'node:assert'

import {
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { JsonObject } from '@waiting/shared-types'
import JWT from 'jsonwebtoken'
import type {
  DecodeOptions,
  Secret,
  SignOptions,
} from 'jsonwebtoken'

import {
  Config,
  ConfigKey,
  JwtPayload,
  JwtResult,
  JwtToken,
  Msg,
  VerifyOpts,
  VerifySecret,
} from './types.js'
import {
  validatePayload,
  validateSignSecret,
  validateTokenString,
  validateVerifySecret,
} from './util.js'


const {
  decode,
  sign,
  verify,
} = JWT


@Provide()
@Scope(ScopeEnum.Singleton)
export class JwtComponent {

  @MConfig(ConfigKey.config) protected readonly config: Config

  private verifySecretSet: Set<VerifySecret>

  @Init()
  async init(): Promise<void> {
    const verifySet = processSecret(this.config.verifySecret)
    const signSet = processSecret(this.config.secret)
    signSet.forEach(val => verifySet.add(val))
    this.verifySecretSet = verifySet
  }

  /**
   * @description using app.config.jwt.secret if secretOrPrivateKey is undefined or false
   */
  sign(
    payload: JwtPayload,
    secretOrPrivateKey?: Secret,
    options?: SignOptions,
  ): JwtToken {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.foo()') }

    const secret = secretOrPrivateKey
      ? secretOrPrivateKey
      : this.config.secret

    const opts: SignOptions = options
      ? { ...this.config.signOpts, ...options }
      : { ...this.config.signOpts }

    validatePayload(payload)
    validateSignSecret(secret)

    const ret = sign(payload, secret, opts)
    return ret

  }


  /**
   * @description using app.config.jwt.secret if secretOrPrivateKey is undefined or false
   */
  verify<T = JsonObject>(
    token: JwtToken,
    secretOrPrivateKey?: VerifySecret,
    options?: VerifyOpts,
  ): JwtResult<T> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.verify()') }

    const opts: JWT.VerifyOptions = options
      ? { ...this.config.verifyOpts, ...options }
      : { ...this.config.verifyOpts }
    opts.complete = true

    const secret = secretOrPrivateKey
      ? secretOrPrivateKey
      : this.config.secret

    validateTokenString(token)
    validateVerifySecret(secret)

    const ret = verify(token, secret, opts)
    return ret as JwtResult<T>
  }


  /**
   * Decode token,
   * Warning: This will not verify whether the signature is valid.
   * You should not use this for untrusted messages. You most likely want to use jwt.verify instead
   *
   * @param options value of complete always be TRUE
   */
  decode<T = JsonObject>(token: JwtToken): JwtResult<T> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.decode()') }

    const opts: DecodeOptions = {
      complete: true,
      ...this.config.decodeOpts,
    }
    const ret = decode(token, opts)
    return ret as JwtResult<T>
  }

  validateToken(
    token: JwtToken,
    secretSet: Set<VerifySecret>,
  ): JwtResult {

    /* istanbul ignore next */
    if (! secretSet.size) { throw new Error(Msg.VerifySecretInvalid) }

    const ret: JwtResult[] = []
    const msgs: string[] = []
    Array.from(secretSet).some((secret) => {
      try {
        const decoded = this.verify(token, secret)
        ret.push(decoded)
        return true
      }
      catch {
        const ss = typeof secret === 'string' ? secret : secret.toString()
        const start = ss.slice(0, 2)
        let end = ss
        /* istanbul ignore else */
        if (! process.env['CI']) {
          end = ss.length > 10 ? ss.slice(-2) : '**'
        }
        msgs.push(`Error during verify: with secret "${start}****${end}"`)
      }
    })

    if (ret.length) {
      const resp = ret[0]
      assert(resp, 'Should have response')
      return resp
    }
    throw new Error(Msg.TokenValidFailed + ':\n' + msgs.join('\n'))
  }

  /**
   * Generate secrets for verify,
   * Note: use ctxSecret only if available
   */
  genVerifySecretSet(ctxSecret?: unknown): Set<VerifySecret> {

    if (ctxSecret) {
      const cs = processSecret(ctxSecret)
      /* istanbul ignore else */
      if (cs.size) {
        return cs
      }
    }
    return this.verifySecretSet
  }

}


function processSecret(input?: unknown): Set<VerifySecret> {
  const ret = new Set<VerifySecret>()

  /* istanbul ignore else */
  if (typeof input === 'string') {
    ret.add(input)
  }
  else if (Buffer.isBuffer(input)) {
    ret.add(input)
  }
  else if (Array.isArray(input)) {
    input.forEach((secret) => {
      if (typeof secret === 'string') {
        ret.add(secret)
      }
      else if (Buffer.isBuffer(secret)) {
        ret.add(secret)
      }
    })
  }

  return ret
}

