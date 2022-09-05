import { IncomingHttpHeaders } from 'node:http'

import type { Application, IMidwayContainer } from '@mwcp/share'
import supertest, { SuperTest } from 'supertest'

import { TestSpanInfo } from '~/lib/types'



const CI = !! process.env['CI']
export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
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

