import { assert } from 'node:console'

import { MethodTypeUnknown } from '@waiting/shared-types'

import { customDecoratorFactory } from '../../../../src/index.js'

import {
  DecoratorHandler,
  DecoratorHandlerAsyncOnly2,
  DecoratorHandlerMix,
  DecoratorHandlerMulti1,
  DecoratorHandlerMulti2,
  DecoratorHandlerNumber,
  DecoratorHandlerPassthrough,
  DecoratorHandlerRequest,
  DecoratorHandlerSyncOnly2,
} from './decorator-handler.js'
import { CacheableArgs } from './helper.js'


export const METHOD_KEY_Cacheable2 = 'decorator:method_key_cacheable2_test'
export const METHOD_KEY_Cacheable_Sync2 = 'decorator:method_key_cacheable_sync2_test'
export const METHOD_KEY_Cacheable_Async2 = 'decorator:method_key_cacheable_async2_test'
export const METHOD_KEY_Cacheable_number = 'decorator:method_key_cacheable_number_test'
export const METHOD_KEY_Cacheable_request = 'decorator:method_key_cacheable_request_test'
export const METHOD_KEY_Cacheable_request_wrong_inject_scope = 'decorator:method_key_cacheable_request_wrong_inject_scope_test'
export const METHOD_KEY_ClassIgnoreIfMethodDecoratorKeys = 'decorator:classIgnoreIfMethodDecoratorKeys'
export const METHOD_KEY_Multi1 = 'decorator:method_key_multi_1'
export const METHOD_KEY_Multi2 = 'decorator:method_key_multi_2'
export const METHOD_KEY_PassThrough = 'decorator:method_key_cacheable_pass_through'

export const METHOD_KEY_Cacheable_mix = 'decorator:method_key_cacheable_mix'

export function Cacheable2(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable2,
    decoratorHandlerClass: DecoratorHandler,
    before: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    after: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}

export function CacheableAsyncOnly2(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_Async2,
    decoratorHandlerClass: DecoratorHandlerAsyncOnly2,
  })
}

export function CacheableSyncOnly2(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_Sync2,
    decoratorHandlerClass: DecoratorHandlerSyncOnly2,
  })
}


export function CacheableNumber(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Cacheable_number,
    decoratorHandlerClass: DecoratorHandlerNumber,
  })
}

export function CacheableRequest(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Cacheable_request,
    decoratorHandlerClass: DecoratorHandlerRequest,
    before: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    after: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}



export function CacheableMix(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_mix,
    decoratorHandlerClass: DecoratorHandlerMix,
    before: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    after: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}

export function CacheableClassIgnoreIfMethodDecoratorKeys() {
  return customDecoratorFactory({
    decoratorArgs: void 0,
    decoratorKey: METHOD_KEY_ClassIgnoreIfMethodDecoratorKeys,
    classIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Cacheable2],
    decoratorHandlerClass: DecoratorHandler,
    before: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    after: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}

export function CacheableMethodIgnoreIfMethodDecoratorKeys() {
  return customDecoratorFactory({
    decoratorArgs: void 0,
    decoratorKey: METHOD_KEY_ClassIgnoreIfMethodDecoratorKeys,
    classIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Cacheable2],
    methodIgnoreIfMethodDecoratorKeys: [METHOD_KEY_Cacheable2],
    decoratorHandlerClass: DecoratorHandler,
    before: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    after: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}

function assertBeforeAfter(target: object | MethodTypeUnknown, propertyName: unknown, descriptor: unknown, opts: unknown): void {
  if (typeof propertyName === 'undefined') { // class decorator
    assert(target && typeof target === 'function', import.meta.url, `${target.constructor.name} must be a class`)
    assert(typeof descriptor === 'undefined', import.meta.url)
    assert(opts && typeof opts === 'object', import.meta.url)
  }
  else if (typeof propertyName === 'string') { // method decorator
    assert(target && typeof target === 'object', import.meta.url, `${target.constructor.name} ${propertyName} must be class method (object)`)
    assert(propertyName && typeof propertyName === 'string', import.meta.url)
    assert(descriptor && typeof descriptor === 'object', import.meta.url)
    assert(opts && typeof opts === 'object', import.meta.url)
  }
  else {
    throw new Error(`4 invalid propertyName` + import.meta.url)
  }
}


export function Multi1(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Multi1,
    decoratorHandlerClass: DecoratorHandlerMulti1,
  })
}


export function Multi2(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Multi2,
    decoratorHandlerClass: DecoratorHandlerMulti2,
  })
}


export function PassThrough(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_PassThrough,
    decoratorHandlerClass: DecoratorHandlerPassthrough,
  })
}
