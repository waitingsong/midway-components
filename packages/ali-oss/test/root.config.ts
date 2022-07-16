import { IncomingHttpHeaders } from 'node:http'
import { join } from 'node:path'

import supertest, { SuperTest } from 'supertest'

import { aliOssConfig as config } from '@/config.unittest'
import { Application, IMidwayContainer } from '~/interface'
import {
  AliOssComponent,
  Config,
  MiddlewareConfig,
} from '~/lib/index'


const CI = !! process.env.CI
export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
  config: Config
  cookies: unknown
}

export interface TestConfig {
  CI: boolean
  app: Application
  container: IMidwayContainer
  config: Config
  host: string
  httpRequest: SuperTest<supertest.Test>
  ossClient: AliOssComponent
}
export const testConfig = {
  CI,
  config,
  host: '',
} as TestConfig


export const cloudUrlPrefix = 'mobileFile/debug' + Math.random().toString()
export const nameLT = '联通€-&a\'b^c=.json'
export const testDir = __dirname
export const src = join(testDir, 'tsconfig.json')
export const srcLT = join(testDir, 'files', nameLT)
export const srcDir = join(testDir, 'files')
export const files: string[] = [
  nameLT,
  '1.txt',
  '2.txt',
  '.nycrc.json',
  'tsconfig.json',
  'subdir/1.txt',
  'subdir/2.txt',
  'subdir/.nycrc.json',
  'subdir/tsconfig.json',
]
