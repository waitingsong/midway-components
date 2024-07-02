
export * from './custom-decorator-factory.js'
export * from './custom-decorator.helper.js'
export {
  DecoratorHandlerBase,
  type DecoratorMetaData,
  type CustomDecoratorFactoryOptions,
  type DecoratorMetaDataPayload,
  type DecoratorExecutorParamBase,
  type FnRegCustomDecorator,
  /** 装饰器所在的（注入）实例 */
  type InstanceWithDecorator,
  /** 被装饰的类（原型，不包括注入的属性）或者类方法 */
  type ClassWithDecorator,
  type ClzInstance,
} from './custom-decorator.types.js'
export { registerDecoratorHandlers } from './reg-decorator-handler.js'

