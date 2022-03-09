import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { Application } from '~/interface'
import { JwtState } from '~/lib'


export type TestResponse = supertest.Response
export interface TestRespBody {
  cookies: unknown
  header: IncomingHttpHeaders
  url: string
  jwtState: JwtState
  jwtOriginalErrorText: string
}

export interface TestConfig {
  app: Application
  httpRequest: SuperTest<supertest.Test>
  host: string
}
export const testConfig = {
} as TestConfig

