import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { Application } from '~/interface'
import { TestSpanInfo } from '~/lib/types'


export type TestResponse = supertest.Response
export interface TestRespBody {
  cookies: unknown
  header: IncomingHttpHeaders
  url: string
  spanInfo: TestSpanInfo
}

export interface TestConfig {
  app: Application
  httpRequest: SuperTest<supertest.Test>
  host: string
}
export const testConfig = {
} as TestConfig

