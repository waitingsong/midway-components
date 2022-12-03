/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import assert from 'node:assert/strict'

import { CacheMetaType } from '../../src/index'


export function validateRespOK(resp: any): void {
  assert(resp)
  assert(typeof resp.body === 'object')
  assert(resp.body.value === 'OK')
}

export interface CacheRet<T> extends CacheMetaType {
  value: T
}

