import { customDecoratorFactory } from '@mwcp/share'

import { DECORATOR_KEY_Public } from '../config.js'

import { DecoratorHandlerPublic } from './public.decorator-handler.js'


/**
 * No JWT Authentication
 * @Caution
 * - it works even if the route is in the match list
 * - it will cause some latency when first request for each route
 */
export function Public(): MethodDecorator {
  return customDecoratorFactory({
    decoratorArgs: void 0,
    decoratorKey: DECORATOR_KEY_Public,
    enableClassDecorator: false,
    decoratorHandlerClass: DecoratorHandlerPublic,
  })
}

