import assert from 'node:assert'
import { join } from 'node:path'
// import { pathToFileURL } from 'node:url'

import { initPathArray } from '@mwcp/jwt'
import { retrieveFirstIp, genCurrentDirname } from '@waiting/shared-core'
import { NpmPkg } from '@waiting/shared-types'

import { ConfigKey, ErrorCode } from '##/lib/index.js'
import packageJson from '#package.json' assert { type: 'json' }


const configDir = genCurrentDirname(import.meta.url)
export const APP_BASE_DIR = join(configDir, '../..')
export const APP_DIST_DIR = join(configDir, '../')

// const pkgPath = join(APP_BASE_DIR, 'package.json')
// const p2 = pathToFileURL(pkgPath).pathname
// const pkg = await import(p2, { assert: { type: 'json' } })
//   .then(({ default: _ }: { default: NpmPkg }) => _)

const pkg = packageJson as unknown as NpmPkg
assert(pkg, 'package.json not found')
assert(pkg.name, 'package.json name not found')

// use for cookie sign key, should change to your own and keep security
export const keys = '1559532739677_8888'

export const koa = {
  port: 7001,
}

export const welcomeMsg = 'Hello Midwayjs!'
export const globalErrorCode = ErrorCode

const ip = retrieveFirstIp()
const nameNorm = pkg.name.replace(/@/ug, '').replace(/\//ug, '-')
export const prometheus = {
  labels: {
    APP_NAME: pkg.name,
    APP_NAME_NORM: nameNorm,
    APP_VER: pkg.version,
    APP_PID: process.pid,
    APP_PPID: process.ppid,
    APP_IPs: ip ? ip.address : 'n/a',
  },
}

const jwtIgnoreArr = [
  ...initPathArray,
  '/hello',
  `/_${ConfigKey.namespace}/hello`,
]
export const jwtMiddlewareConfig = {
  enableMiddleware: true,
  ignore: jwtIgnoreArr,
}


