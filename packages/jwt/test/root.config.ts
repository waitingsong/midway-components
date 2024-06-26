import type { IncomingHttpHeaders } from 'node:http'
import { join } from 'node:path'

import type { Application, IMidwayContainer, JsonResp } from '@mwcp/share'
import { genCurrentDirname } from '@waiting/shared-core'
import type { SuperTest } from 'supertest'
import type supertest from 'supertest'

import type { JwtState } from '../src/lib/types.js'


export const testDir = genCurrentDirname(import.meta.url)
export const baseDir = join(testDir, '..')

const CI = !! ((process.env['CI']
  ?? process.env['MIDWAY_SERVER_ENV'] === 'unittest')
  || process.env['MIDWAY_SERVER_ENV'] === 'local'
  || process.env['NODE_ENV'] === 'unittest'
  || process.env['NODE_ENV'] === 'local'
)

export type TestResponse = supertest.Response
export type TestRespBody = JsonResp<RespData>
export interface RespData {
  header: IncomingHttpHeaders
  url: string
  cookies: unknown
}

export interface TestConfig {
  baseDir: string
  testDir: string
  testAppDir: string
  CI: boolean
  app: Application
  container: IMidwayContainer
  host: string
  httpRequest: SuperTest<supertest.Test>
}

const testAppDir = join(testDir, 'fixtures', 'base-app')
export const testConfig = {
  baseDir,
  testDir,
  testAppDir,
  CI,
  host: '',
  httpRequest: {},
} as TestConfig



export interface RespData2 {
  header: IncomingHttpHeaders
  url: string
  cookies: unknown
  jwtState: JwtState
  jwtOriginalErrorText: string
}

