#!/usr/bin/env tsx
import { dirname, join, sep } from 'node:path'
import { cp, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { $, cd } from 'zx'

const currentURL = import.meta.url
const currentPath = fileURLToPath(currentURL)
const currentDir = dirname(currentPath)
const currentFileName = currentPath.split(sep).pop()
const rootDir = join(currentDir, '../../..')
const shareSrcDir = join(rootDir, 'packages/share')

const nodeModulesDir = join(rootDir, 'node_modules')
const mwcpModuleDir = join(nodeModulesDir, '@mwcp')
const shareModuleDir = join(nodeModulesDir, '@mwcp/share')

console.log({ shareSrcDir, shareModuleDir })

cd(shareSrcDir)
// $.verbose = true
await $`npm run build`
await rm(shareModuleDir, { force: true, recursive: true })
cd(mwcpModuleDir)
await mkdir('share')
const src = 'src'
const dist = 'dist'
const pkg = 'package.json'
await cp(join(shareSrcDir, src), `${shareModuleDir}/${src}`, { recursive: true, force: true })
await cp(join(shareSrcDir, dist), `${shareModuleDir}/${dist}`, { recursive: true, force: true })
await cp(join(shareSrcDir, pkg), `${shareModuleDir}/${pkg}`, { force: true })

