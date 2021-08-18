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
} from './types'
import { genJwtConfig } from './util'

import { Application } from '~/interface'


@Provide()
@Scope(ScopeEnum.Singleton)
export class JwtComponent {

  @App() private readonly app: Application

  @Config('jwtConfig') protected config: JwtConfig

  public jwt: Jwt

  protected verifySecretSet: Set<VerifySecret>

  @Init()
  async init(): Promise<void> {
    const pconfig = this.app.getConfig('jwtConfig') as Partial<JwtConfig>
    this.config = genJwtConfig(pconfig)

    const verifySet = processSecret(this.config.verifySecret)
    const signSet = processSecret(this.config.secret)
    signSet.forEach(val => verifySet.add(val))
    this.verifySecretSet = verifySet
    this.jwt = new Jwt(this.config)
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

