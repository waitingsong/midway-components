import assert from 'node:assert'
import { stat } from 'node:fs/promises'

import type { AliOssComponent, DataCp } from '../src/index.js'


export async function assertFileExists(
  client: AliOssComponent,
  cloudFile: string,
): Promise<void> {

  const exists = await client.pathExists(cloudFile)
  assert(exists === true, `${cloudFile} should exists`)
}

export function assertUploadFiles(
  data: DataCp | undefined,
  expectTotalNumber: number,
  expectDirs: number,
  expectFiles: number,
  stderr: string,
): void {

  assert(data)
  assert(typeof data.elapsed === 'string', stderr)
  assert(typeof data.averageSpeed === 'number', stderr)
  assert(typeof data.succeedTotalNumber === 'number', stderr)
  assert(data.succeedTotalNumber === expectTotalNumber, stderr)
  assert(typeof data.succeedTotalSize === 'string', stderr)
  assert(data.succeedTotalSize.length, stderr)

  assert(typeof data.uploadDirs === 'number', stderr)
  assert(typeof data.uploadFiles === 'number', stderr)
  assert(data.uploadDirs === expectDirs, stderr)
  assert(data.uploadFiles === expectFiles, stderr)
}

export async function assertLocalFileExists(file: string): Promise<void> {

  const exists = (await stat(file)).isFile()
  assert(exists === true, `${file} should exists`)
}

