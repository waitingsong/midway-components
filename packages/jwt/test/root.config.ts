import supertest, { SuperTest } from 'supertest'

import { Application } from '~/interface'
import { JwtState } from '~/lib'


export type TestResponse = supertest.Response
export interface TestRespBody {
  jwtState: JwtState
  cookies: unknown
  header: unknown
  url: string
  jwtOriginalErrorText: string
}

export interface TestConfig {
  app: Application
  httpRequest: SuperTest<supertest.Test>
}
export const testConfig = {
} as TestConfig

