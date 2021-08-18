import { JsonType } from '@waiting/shared-types'
import {
  decode,
  sign,
  verify,
  VerifyOptions,
} from 'jsonwebtoken'

import {
  JwtConfig,
  JwtPayload,
  JwtToken,
  VerifySecret,
  VerifyOpts,
  JwtResult,
} from './types'
import {
  validateSignSecret,
  validateVerifySecret,
  validateTokenString,
  validatePayload,
  genJwtConfig,
} from './util'

import {
  DecodeOptions,
  SignOptions,
  Secret,
} from '~/interface'


export class Jwt {

  protected readonly config: JwtConfig

  constructor(
    config?: Partial<JwtConfig>,
  ) {
    this.config = genJwtConfig(config)
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
  verify<T extends string | JsonType = JsonType>(
    token: JwtToken,
    secretOrPrivateKey?: VerifySecret,
    options?: VerifyOpts,
  ): JwtResult<T> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.verify()') }

    const opts: VerifyOptions = options
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
  decode<T extends string | JsonType = JsonType>(
    token: JwtToken,
  ): JwtResult<T> {

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this) { throw new TypeError('Should call with class name, such as jwt.decode()') }

    const opts: DecodeOptions = {
      complete: true,
      ...this.config.decodeOpts,
    }
    const ret = decode(token, opts)
    return ret as JwtResult<T>
  }

}

