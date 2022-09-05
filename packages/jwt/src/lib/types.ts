import type { Context } from '@mwcp/share'
import { MiddlewareConfig as MWConfig, JsonObject } from '@waiting/shared-types'
import {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
  VerifyOptions,
} from 'jsonwebtoken'


export enum ConfigKey {
  namespace = 'jwt',
  config = 'jwtConfig',
  middlewareConfig = 'jwtMiddlewareConfig',
  componentName = 'jwtComponent',
  middlewareName = 'jwtMiddleware'
}

export enum Msg {
  hello = 'hello jwt',
  AuthFailed = 'Authentication Failed',

  InvalidInput = 'Value of input invalid',
  InvalidInputBuffer = 'Value of input is empty Buffer',
  InvalidInputObject = 'Value of input is invalid Object',
  InvalidInputString = 'Value of input is blank string',

  VerifyNotFunc = 'jwt.verify is not a function',
  TokenNotFound = 'Token not found. Header format is "Authorization: Bearer <token>"',
  TokenValidFailed = 'Token validation failed',
  VSceretInvalid = 'VerifySecret not provided',
}


export interface Config {
  /**
   * Enable default http route, eg. /hello
   * @default false
   */
  enableDefaultRoute?: boolean | undefined
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
  passthrough: boolean | RedirectURL | PassthroughCallback
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
export type PassthroughCallback = (ctx: Context) => Promise<boolean | RedirectURL>


/** Bind on Context.jwtState */
export interface JwtState<T = unknown> {
  header?: JwtHeader
  secret?: unknown
  signature?: string
  /** Decode Result */
  user?: JwtResult<T>['payload']
  jwtOriginalError?: Error
}

