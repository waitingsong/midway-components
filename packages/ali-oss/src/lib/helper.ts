import assert from 'node:assert'

import {
  BaseOptions,
  DataBase,
  FnKey,
  OssClient,
  ProcessRet,
} from '@yuntools/ali-oss'

import { ClientConfig } from './types'


export interface RunnerOptions<T> {
  clientId: string
  client: OssClient
  fnKey: FnKey
  clientConfig: ClientConfig
  options: T | undefined
  src: string | undefined
  target: string | undefined
}
export async function runner<
  T extends BaseOptions,
  R extends ProcessRet<DataBase> | boolean = ProcessRet<DataBase>
>(options: RunnerOptions<T>): Promise<R> {

  const { clientId, client, clientConfig: config, fnKey } = options

  assert(client, `client not found for ${clientId}`)
  assert(config, `config not found for ${clientId}`)
  assert(typeof client[fnKey] === 'function', `${fnKey} not found`)

  const opts = genOptions<T>(options)

  // @ts-expect-error
  const ret = await client[fnKey](opts) as Promise<R>
  return ret
}

export function genOptions<T>(input: RunnerOptions<T>): T {
  const ret = input.options
    ? {
      src: input.src,
      target: input.target,
      bucket: input.clientConfig.bucket,
      ...input.options,
    }
    : {
      src: input.src,
      target: input.target,
      bucket: input.clientConfig.bucket,
    }
  return ret as unknown as T
}
