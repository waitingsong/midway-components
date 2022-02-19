import supertest, { SuperTest } from 'supertest'

import { Application } from '~/interface'


export type TestResponse = supertest.Response
export interface TestRespBody {
  cookies: unknown
  header: unknown
  url: string
}

export interface TestConfig {
  app: Application
  httpRequest: SuperTest<supertest.Test>
}
export const testConfig = {
} as TestConfig

