import { IncomingHttpHeaders } from 'node:http'

import supertest, { SuperTest } from 'supertest'

import { config } from '@/config.unittest'
import { Application, IMidwayContainer } from '~/interface'
import {
  Config,
  MiddlewareConfig,
  TestSpanInfo,
} from '~/lib/index'


const CI = !! process.env.CI
export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
  config: Config
  mwConfig: MiddlewareConfig
  cookies: unknown
  spanInfo: TestSpanInfo
}

export interface TestConfig {
  CI: boolean
  app: Application
  container: IMidwayContainer
  config: Config
  host: string
  httpRequest: SuperTest<supertest.Test>
}
export const testConfig = {
  CI,
  config,
  host: '',
} as TestConfig

