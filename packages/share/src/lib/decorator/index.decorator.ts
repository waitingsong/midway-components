
export * from './custom-decorator-factory.js'
export * from './custom-decorator.helper.js'
export {
  DecoratorHandlerBase,
  DecoratorMetaData,
  CustomDecoratorFactoryOptions,
  DecoratorMetaDataPayload,
  DecoratorExecutorParamBase,
  FnRegCustomDecorator,
  /** 装饰器所在的（注入）实例 */
  InstanceWithDecorator,
  /** 被装饰的类（原型，不包括注入的属性）或者类方法 */
  ClassWithDecorator,
  ClzInstance,
} from './custom-decorator.types.js'
export { registerDecoratorHandlers } from './reg-decorator-handler.js'

