import {
  App,
  Config,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'

import { JwtMsg } from './config'
import { Jwt } from './jwt'
import {
  JwtConfig,
  JwtToken,
  JwtDecodedPayload,
  VerifySecret,
  JwtPayload,
  VerifyOpts,
  JwtResult,
} from './types'
import { genJwtConfig } from './util'

import {
  Application,
  JsonType,
  SignOptions,
  Secret,
} from '~/interface'


@Provide()
@Scope(ScopeEnum.Singleton)
export class JwtComponent {

  @App() private readonly app: Application

  protected config: JwtConfig

  private jwt: Jwt

  private verifySecretSet: Set<VerifySecret>

  @Init()
  async init(): Promise<void> {
    const pconfig = this.app.getConfig('jwtConfig') as Partial<JwtConfig>
    console.info('xxxxxxxxxxxxxxxxxxxx', pconfig)
    this.config = genJwtConfig(pconfig)

    const verifySet = processSecret(this.config.verifySecret)
    const signSet = processSecret(this.config.secret)
    signSet.forEach(val => verifySet.add(val))
    this.verifySecretSet = verifySet
    this.jwt = new Jwt(this.config)
  }

  /**
   * @description using app.config.jwt.secret if secretOrPrivateKey is undefined or false
   */
  sign(
    payload: JwtPayload,
    secretOrPrivateKey?: Secret | false,
    options?: SignOptions,
  ): JwtToken {

    const ret = this.jwt.sign(payload, secretOrPrivateKey, options)
    return ret
  }


  /**
   * @description using app.config.jwt.secret if secretOrPrivateKey is undefined or false
   */
  verify<T extends string | JsonType = JsonType>(
    token: JwtToken,
    secretOrPrivateKey?: VerifySecret,
    options?: VerifyOpts,
  ): JwtDecodedPayload<T> {

    const ret = this.jwt.verify<T>(token, secretOrPrivateKey, options)
    return ret
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

    const ret = this.jwt.decode<T>(token)
    return ret
  }

  validateToken(
    token: JwtToken,
    secretSet: Set<VerifySecret>,
  ): JwtDecodedPayload {

    /* istanbul ignore next */
    if (! secretSet.size) { throw new Error(JwtMsg.VSceretInvalid) }

    let ret: JwtDecodedPayload | null = null
    const msgs: string[] = []
    Array.from(secretSet).some((secret) => {
      try {
        // const decoded = this.jwt.verify(token, secret, this.config.verifyOpts)
        const decoded = this.jwt.verify(token, secret)
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
    if (ret) {
      return ret as JwtDecodedPayload
    }
    throw new Error(JwtMsg.TokenValidFailed + ':\n' + msgs.join('\n'))
  }

  /**
   * Generate secrets for verify,
   * Note: use ctxSecret only if available
   */
  genVerifySecretSet(
    ctxSecret?: unknown,
  ): Set<VerifySecret> {

    if (ctxSecret) {
      const cs = processSecret(ctxSecret)
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
      ret.add(secret)
    })
  }

  return ret
}

