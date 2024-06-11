/* eslint-disable @typescript-eslint/await-thenable */
import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import { Context } from '../types/index.js'

import { Bar, InputOptions } from './122c.helper.js'


@Singleton()
export class SingletonService {

  @Bar()
  async home(options: InputOptions): Promise<number> {
    const ret = await options.input
    return ret
  }

  @Bar()
  async hello2(options: InputOptions, ctx: Context): Promise<number> {
    assert(ctx.host)
    const ret = options.input
    return ret
  }
}
