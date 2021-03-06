import { MiddlewareConfig as MWConfig, JsonObject } from '@waiting/shared-types'
import {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
  VerifyOptions,
} from 'jsonwebtoken'

import { Context } from '~/interface'


export interface Config {
  /**
   * For signing and verifying if without passing secret param,
   * Note: the type of VerifySecret without object
   */
  secret: Secret
  /** Authentication options for middleware */
  decodeOpts?: DecodeOptions
  signOpts?: SignOptions
  verifySecret?: VerifySecret | VerifySecret[]
  verifyOpts?: VerifyOpts
}


/** Authentication options for middleware */
export interface MiddlewareOptions {
  debug: boolean
  /**
   * Retrieving the token from the name of cookie, instead of from HTTP header (Authorization),
   * @default false
   */
  cookie: string | false
  /**
   * - false (Default): throw error
   * - true: always yield next, even if no valid Authorization header was found,
   *    and ignore value of JwtOptions.debug
   * - <RedirectURL>: redirect and without yield next
   * @default false
   */
  passthrough: boolean | RedirectURL | passthroughCallback
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>
export type JwtAuthenticateOptions = MiddlewareOptions


export type JwtToken = string
export type JwtPayload = string | Buffer | JsonObject
export interface JwtResult<T = JsonObject> {
  header: JwtHeader
  payload: T
  signature: string
}

export type VerifySecret = string | Buffer
export type VerifyOpts = Omit<VerifyOptions, 'maxAge' | 'complete'>

// export type MiddlewarePathPattern = (string | RegExp | PathPatternFunc)[]
// export type PathPatternFunc = (ctx: Context) => boolean
export type RedirectURL = string
export type passthroughCallback = (ctx: Context) => Promise<boolean | RedirectURL>


/** Bind on Context.jwtState */
export interface JwtState<T = unknown> {
  header?: JwtHeader
  secret?: unknown
  signature?: string
  /** Decode Result */
  user?: JwtResult<T>['payload']
  jwtOriginalError?: Error
}

