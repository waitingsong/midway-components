import { IncomingHttpHeaders } from 'node:http'

import supertest, { SuperTest } from 'supertest'

import { Application, IMidwayContainer } from '~/interface'
import { MiddlewareConfig, TestSpanInfo } from '~/lib/index'


const CI = !! process.env.CI
export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
  mwConfig: MiddlewareConfig
  cookies: unknown
  spanInfo: TestSpanInfo
}

export interface TestConfig {
  CI: boolean
  app: Application
  container: IMidwayContainer
  host: string
  httpRequest: SuperTest<supertest.Test>
}
export const testConfig = {
  CI,
  host: '',
} as TestConfig

