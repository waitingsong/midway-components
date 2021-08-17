/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  App,
  Config,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import { JsonType } from '@waiting/shared-types'
import {
  decode,
  sign,
  verify,
  DecodeOptions,
  SignOptions,
  Secret,
} from 'jsonwebtoken'


import { JwtMsg } from './config'
import {
  JwtConfig,
  JwtPayload,
  JwtToken,
  JwtDecodedPayload,
  VerifySecret,
  VerifyOpts,
  JwtComplete,
} from './types'
import {
  validateSignSecret,
  validateVerifySecret,
  validateTokenString,
  validatePayload,
  genJwtConfig,
} from './util'

import { Application } from '~/interface'


@Provide()
@Scope(ScopeEnum.Singleton)
export class Jwt {

  @App() readonly app: Application

  @Config('jwtConfig') private config: JwtConfig

  @Init()
  async init(): Promise<void> {
    const pconfig = this.app.getConfig('jwtConfig') as Partial<JwtConfig>
    this.config = genJwtConfig(pconfig)
  }

  /**
   * @description using app.config.jwt.secret if secretOrPrivateKey is undefined or false
   */
  sign(
    payload: JwtPayload,
    secretOrPrivateKey?: Secret | false,
    options?: SignOptions,
  ): JwtToken {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.foo()') }

    const opts: SignOptions = options
      ? { ...this.config.signOpts, ...options }
      : { ...this.config.signOpts }

    const secret = typeof secretOrPrivateKey === 'undefined' || secretOrPrivateKey === false
      ? this.config.secret
      : secretOrPrivateKey

    validatePayload(payload)
    validateSignSecret(secret)

    const ret = sign(payload, secret, opts)
    return ret
  }


  /**
   * @description using app.config.jwt.secret if secretOrPrivateKey is undefined or false
   */
  verify<T extends string | JsonType = JsonType>(
    token: JwtToken,
    secretOrPrivateKey?: VerifySecret | false,
    options?: VerifyOpts,
  ): JwtDecodedPayload<T> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.foo()') }

    const opts: VerifyOpts = options
      ? { ...this.config.verifyOpts, ...options }
      : { ...this.config.verifyOpts }

    const secret = typeof secretOrPrivateKey === 'undefined' || secretOrPrivateKey === false
      ? this.config.secret as VerifySecret
      : secretOrPrivateKey

    validateTokenString(token)
    validateVerifySecret(secret)

    const ret = verify(token, secret, opts)
    return ret as JwtDecodedPayload<T>
  }

  /**
   * Decode token,
   * Warning: This will not verify whether the signature is valid.
   * You should not use this for untrusted messages. You most likely want to use jwt.verify instead
   *
   * @param options value of complete always be TRUE
   */
  decode<T extends string | JsonType = JsonType>(
    token: JwtToken,
  ): JwtComplete<T> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.foo()') }

    let opts: DecodeOptions = { complete: true }

    /* istanbul ignore else */
    if (this.config.decodeOpts && Object.keys(this.config.decodeOpts).length) {
      opts = { ...this.config.decodeOpts }
    }

    const ret = decode(token, opts)
    return ret as JwtComplete<T>
  }

  validateToken(
    token: JwtToken,
    secretSet: Set<VerifySecret>,
  ): JwtDecodedPayload {

    /* istanbul ignore next */
    if (! secretSet.size) {
      throw new Error(JwtMsg.VSceretInvalid)
    }

    /* istanbul ignore next */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    if (typeof this.verify !== 'function') {
      throw new TypeError(JwtMsg.VerifyNotFunc)
    }

    let ret: JwtDecodedPayload | null = null
    const msgs: string[] = []
    Array.from(secretSet).some((secret) => {
      try {
        const decoded = this.verify(token, secret, this.config.verifyOpts)
        ret = decoded
        return true
      }
      catch (ex) {
        const ss = typeof secret === 'string' ? secret : secret.toString()
        const start = ss.slice(0, 2)
        let end = ss
        if (! process.env.CI) {
          end = ss.length > 5 ? ss.slice(-2) : '**'
        }
        msgs.push(`Error during verify: with secret "${start}****${end}"`)
      }
    })

    /* istanbul ignore else */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ret === null) {
      throw new Error(JwtMsg.TokenValidFailed + ':\n' + msgs.join('\n'))
    }
    return ret as JwtDecodedPayload
  }


}

