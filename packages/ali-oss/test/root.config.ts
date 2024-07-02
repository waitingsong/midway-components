import type { IncomingHttpHeaders } from 'node:http'
import { join } from 'node:path'

import type { Application, IMidwayContainer, JsonResp } from '@mwcp/share'
import { genCurrentDirname } from '@waiting/shared-core'
import type { SuperTest } from 'supertest'
import type supertest from 'supertest'

import type { AliOssComponent, AliOssManager } from '../src/lib/index.js'


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
  aliOssManager: AliOssManager
  ossClient: AliOssComponent
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


export const cloudUrlPrefix = 'mobileFile/debug' + Math.random().toString()
export const nameLT = '联通€-&a\'b^c=.json'
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

