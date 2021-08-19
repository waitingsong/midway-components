import { JsonObject, JsonType } from '@waiting/shared-types'
import {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
  VerifyOptions,
} from 'jsonwebtoken'

import { Context } from '~/interface'


export interface JwtConfig {
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

export interface JwtMiddlewareConfig extends JwtAuthenticateOptions {
  /**
   * @default true
   */
  enableMiddleware: boolean
  /**
   * match and ignore are exclusive exists
   * @default
   *   - /
   *   - /login
   *   - /metrics
   *   - /ping
   *   - /favicon.ico
   *   - /favicon.png
   * @description
   *   - `/` match root only
   *   - `/^\/$/` match root only
   */
  ignore?: MiddlewarePathPattern
  /**
   * Ignored if JwtAuthenticateOptions.passthrough true
   * @default false
   */
  debug: boolean
}

/** Authentication options for middleware */
export interface JwtAuthenticateOptions {
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


export type JwtToken = string
export type JwtPayload = string | Buffer | JsonObject
export interface JwtResult<T extends string | JsonType = JsonType> {
  header: JwtHeader
  payload: T
  signature: string
}

export type VerifySecret = string | Buffer
export type VerifyOpts = Omit<VerifyOptions, 'maxAge' | 'complete'>

export type MiddlewarePathPattern = (string | RegExp | PathPatternFunc)[]
export type PathPatternFunc = (ctx: Context) => boolean
export type RedirectURL = string
export type passthroughCallback = (ctx: Context) => Promise<boolean | RedirectURL>

// export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>

/** Bind on Context.jwtState */
export interface JwtState {
  jwtOriginalError?: Error
  secret?: unknown
  /** Decode Result */
  user?: JwtResult
}


