/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'


export type CustomClassDecorator = <DecoratorArgs, TFunction extends Function>(
  target: TFunction,
  args: Partial<DecoratorArgs> | undefined,
) => void

export type CustomMethodDecorator = <DecoratorArgs, Target = unknown>(
  target: {},
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<Target>,
  args: Partial<DecoratorArgs> | undefined,
) => TypedPropertyDescriptor<Target> | void

export function customDecoratorFactory<DecoratorArgs, Target = unknown>(
  options: Partial<DecoratorArgs> | undefined,
  /**
   * The decorator function to be called.
   * Throws an error if undefined.
   */
  classDecorator: CustomClassDecorator | undefined,
  /**
   * The decorator function to be called.
   * Throws an error if undefined.
   */
  methodDecorator: CustomMethodDecorator | undefined,
): MethodDecorator & ClassDecorator {

  const DecoratorFactory = (
    target: Target,
    propertyKey?: string,
    descriptor?: TypedPropertyDescriptor<Target>,
  ): TypedPropertyDescriptor<Target> | Target | void => {

    assert(target, 'target is undefined')

    if (typeof target === 'function') { // Class Decorator
      assert(classDecorator, 'classDecorator is not allowed according to the options.classDecorator undefined')
      return classDecorator(target, options)
    }

    if (typeof target === 'object') { // Method Decorator
      assert(methodDecorator, 'methodDecorator is not allowed according to the options.methodDecorator undefined')
      assert(target, 'target is undefined')
      assert(propertyKey, 'propertyKey is undefined')
      assert(descriptor, 'descriptor is undefined')

      if (typeof descriptor.value !== 'function') {
        throw new Error('Only method can be decorated with @Cacheable decorator')
      }

      if (descriptor.value.constructor.name !== 'AsyncFunction') {
        throw new Error('Only async method can be decorated with @Cacheable decorator')
      }

      return methodDecorator<DecoratorArgs, Target>(target, propertyKey, descriptor, options)
    }

    assert(false, 'Invalid decorator usage')
  }

  // @ts-ignore
  return DecoratorFactory
}
