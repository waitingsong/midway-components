import {
  // IMidwayWebApplication as Application,
  IMidwayWebContext as Context,
} from '@midwayjs/web'
import { JsonObject, JsonType } from '@waiting/shared-types'
import {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
  VerifyOptions,
} from 'jsonwebtoken'

// eslint-disable-next-line import/no-extraneous-dependencies


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
}

export interface JwtOptions {
  /** Authentication options for middleware */
  // authOpts?: JwtAuthenticateOptions
  /** Ignored if authOpts.passthrought true */
  debug?: boolean
  decodeOpts?: DecodeOptions
  /**
   * For signing and verifying if without passing secret param,
   * Note: the type of VerifySecret without object
   */
  secret: Secret
  signOpts?: SignOptions
  verifySecret?: VerifySecret | VerifySecret[] | false
  verifyOpts?: VerifyOpts
}

/** Authentication options for middleware */
export interface JwtAuthenticateOptions {
  /**
   * Retrieving the token from the name of cookie, instead of from HTTP header (Authorization),
   * @default false
   */
  cookie: string | false
  /**
   * This lets downstream middleware make decisions based on whether ctx.jwtState.user is set.
   * You can still handle errors using ctx.jwtState.jwtOriginalError.
   * Default: user
   */
  // key: 'user' | string
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
export type JwtDecodedPayload<T extends string | JsonType = JsonType> = T
export interface JwtComplete<T extends string | JsonType = JsonType> {
  header: JwtHeader
  payload: JwtDecodedPayload<T>
  signature: string
}

export type VerifySecret = string | Buffer
export type VerifyOpts = Omit<VerifyOptions, 'maxAge'>

export type MiddlewarePathPattern = (string | RegExp | PathPatternFunc)[]
export type PathPatternFunc = (ctx: Context) => boolean
export type RedirectURL = string
export type passthroughCallback = (ctx: Context) => Promise<boolean | RedirectURL>

// export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>

/** Bind on Context.jwtState */
export interface JwtState {
  jwtOriginalError: Error
  secret: unknown
  /** Decode Result */
  user: JsonType
}


