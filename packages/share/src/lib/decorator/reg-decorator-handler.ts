import assert from 'node:assert'

import type {
  AopCallbackInputArgsType,
  AroundFactoryParamBase,
  RegisterDecoratorHandlerParam,
} from './custom-decorator.types.js'
import { executeDecoratorHandler } from './reg-decorator-handler.helper.js'


// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
export function registerDecoratorHandler<TDecoratorParam extends {} = any>(
  options: RegisterDecoratorHandlerParam<TDecoratorParam>,
  aroundFactoryOptions: AroundFactoryParamBase,
): void {

  const { decoratorKey, decoratorService } = options
  assert(decoratorKey, 'decoratorKey is required')
  assert(decoratorService, 'decoratorService is required')

  decoratorService.registerMethodHandler(
    decoratorKey,
    (aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorParam>) => executeDecoratorHandler(
      aopCallbackInputOptions,
      options,
      aroundFactoryOptions,
    ),
  )
}

