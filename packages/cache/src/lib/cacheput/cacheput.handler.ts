import { Singleton, Inject } from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'
import { DecoratorExecutorParamBase } from '@mwcp/share'

import { DecoratorHandlerCacheBase } from '../decorator.handler.types.js'
import { genDecoratorExecutorOptions } from '../helper.js'
import { CacheableArgs, DecoratorExecutorOptions, GenDecoratorExecutorOptionsExt } from '../types.js'

import { before, decoratorExecutor } from './cacheput.helper.js'


/**
 * CachePut decorator handler
 * @description not support sync method
 */
@Singleton()
export class DecoratorHandlerCachePut extends DecoratorHandlerCacheBase {
  @Inject() readonly traceService: TraceService

  override genExecutorParam(options: DecoratorExecutorParamBase): DecoratorExecutorOptions {
    const optsExt: GenDecoratorExecutorOptionsExt = {
      config: this.cacheConfig,
      cachingFactory: this.cachingFactory,
      op: 'cacheput',
      traceService: this.traceService,
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async before(options: DecoratorExecutorOptions<CacheableArgs>) {
    await before(options)
  }

  override around(options: DecoratorExecutorOptions<CacheableArgs>) {
    return decoratorExecutor(options)
  }

}

