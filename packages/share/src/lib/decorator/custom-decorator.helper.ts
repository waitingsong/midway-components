/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'

import {
  INJECT_CUSTOM_METHOD,
  getClassMetadata,
} from '@midwayjs/core'
import deepmerge from 'deepmerge'

import {
  DecoratorMetaData,
  DecoratorMetaDataPayload,
  InstanceOfDecorator,
} from './custom-decorator.types.js'


export function methodHasDecorated(
  decoratorKey: string, // METHOD_KEY_CacheEvict | METHOD_KEY_Cacheable
  methodName: string,
  metaDataArr: DecoratorMetaData[] | undefined,
  /**
   * skip check if value is undefined
   * @default undefined
   */
  expectImpl: boolean | undefined = undefined,
): boolean {

  assert(decoratorKey)

  if (! methodName) { return false }
  if (! metaDataArr?.length) { return false }

  for (const row of metaDataArr) {
    if (row.key === decoratorKey && row.propertyName === methodName) {
      if (typeof expectImpl === 'undefined') {
        return true
      }
      else if (typeof row.options === 'undefined') {
        return false
      }
      else if (row.options.impl === !! expectImpl) {
        return true
      }
    }
  }

  return false
}


/**
 * @returns Set<value of decoratorKeys>
 */
export function isMethodDecoratoredWith(
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: {}, // class
  propertyName: string, // method name
  decoratorKeys: string[], // ['docorator:method_key_cacheable']
): Set<string> {

  const ret = new Set<string>()

  const metadataArr: DecoratorMetaData[] | undefined = getClassMetadata(INJECT_CUSTOM_METHOD, target)
  if (! metadataArr?.length) {
    return ret
  }

  decoratorKeys.forEach((decoratorKey) => {
    if (methodHasDecorated(decoratorKey, propertyName, metadataArr)) {
      ret.add(decoratorKey)
    }
  })

  return ret
}

export function instanceMethodHasMethodDecorator(
  /** 装饰器所在的实例 */
  target: InstanceOfDecorator,
  decoratorKey: string,
  methodName: string,
): boolean {

  assert(target, 'target is undefined')
  assert(methodName, 'methodName is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')

  const metaDataArr = getClassMetadata(
    INJECT_CUSTOM_METHOD,
    target,
  )

  if (! metaDataArr?.length) {
    return false
  }

  for (const row of metaDataArr) {
    if (row.key !== decoratorKey) { continue }

    if (row.propertyName === methodName) {
      if (typeof row.metadata === 'undefined') {
        return true
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (row.metadata && typeof row.metadata === 'object') {
        if (typeof row.metadata.decoratedType === 'undefined' || row.metadata.decoratedType === 'method') {
          return true
        }
      }
    }
  }

  return false
}

export function instanceHasClassDecorator(
  /** 装饰器所在的实例 */
  target: InstanceOfDecorator,
  decoratorKey: string,
): boolean {

  assert(target, 'target is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')

  const metaDataArr = getClassMetadata(
    INJECT_CUSTOM_METHOD,
    target,
  )

  if (! metaDataArr?.length) {
    return false
  }

  for (const row of metaDataArr) {
    if (row.key !== decoratorKey) { continue }
    if (typeof row.metadata === 'undefined') { continue }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (row.metadata && typeof row.metadata === 'object') {
      if (row.metadata.decoratedType === 'class') {
        return true
      }
    }
  }

  return false
}

export function setImplToFalseIfDecoratedWithBothClassAndMethod(
  /** 装饰器所在的实例 */
  target: InstanceOfDecorator,
  decoratorKey: string,
  inclusiveDecoratorKeys: string[] | undefined,
) {

  assert(target, 'target is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')

  const inclusiveKeysSet = new Set(inclusiveDecoratorKeys)
  inclusiveKeysSet.add(decoratorKey)

  const arr = getClassMetadata<DecoratorMetaData[]>(INJECT_CUSTOM_METHOD, target)
  arr.forEach((row) => {
    // if (row.key !== decoratorKey) { return }
    if (typeof row.options === 'undefined') {
      row.options = {
        impl: true,
      }
    }
    if (row.options.impl === false) { return }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! row.metadata || row.metadata.decoratedType === 'method') { return }

    if (instanceMethodHasMethodDecorator(target, decoratorKey, row.propertyName)) {
      row.options.impl = false
    }

    inclusiveKeysSet.forEach((key) => {
      if (instanceMethodHasMethodDecorator(target, key, row.propertyName)) {
        row.options = {
          impl: false,
        }
      }
    })
  })

  // const arr2 = getClassMetadata<DecoratorMetaData[]>(INJECT_CUSTOM_METHOD, target)
  // void arr2
}


export function retrieveMetadataPayloadsOnClass<TDecoratorParam extends {} = {}>(
  target: InstanceOfDecorator | Function,
  decoratorKey: string,
  methodName: string,
): DecoratorMetaDataPayload<TDecoratorParam>[] {

  assert(target, 'target is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')
  assert(methodName, 'methodName is undefined')

  const arr = getClassMetadata(
    INJECT_CUSTOM_METHOD,
    target,
  )

  if (! arr?.length) {
    return []
  }

  const ret: DecoratorMetaDataPayload<TDecoratorParam>[] = []
  arr.forEach((row: unknown) => {
    assert(typeof row === 'object', 'row is not object')
    assert(row !== null, 'row is null')
    // @ts-expect-error
    if (row.key !== decoratorKey) { return }
    // @ts-expect-error
    if (row.propertyName !== methodName) { return }
    // @ts-expect-error
    if (typeof row.metadata === 'undefined') { return }
    // @ts-expect-error
    if (row.metadata.decoratedType !== 'class') { return }
    // metadata.decoratedType is not enumerable
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (! Object.keys(row.metadata).length) { return }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ret.push({
      // @ts-expect-error
      ...row.metadata,
    })

  })
  return ret
}

export function retrieveMetadataPayloadsOnMethod<TDecoratorParam extends {} = {}>(
  target: InstanceOfDecorator | Function,
  decoratorKey: string,
  methodName: string,
): DecoratorMetaDataPayload<TDecoratorParam>[] {

  assert(target, 'target is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')
  assert(methodName, 'methodName is undefined')

  const arr = getClassMetadata(
    INJECT_CUSTOM_METHOD,
    target,
  )

  if (! arr?.length) {
    return []
  }

  const ret: DecoratorMetaDataPayload<TDecoratorParam>[] = []
  arr.forEach((row: unknown) => {
    assert(typeof row === 'object', 'row is not object')
    assert(row !== null, 'row is null')

    // @ts-expect-error
    if (row.key !== decoratorKey) { return }
    // @ts-expect-error
    if (row.propertyName !== methodName) { return }
    // @ts-expect-error
    if (typeof row.metadata === 'undefined') { return }
    // @ts-expect-error
    if (row.metadata.decoratedType === 'class') { return }
    // metadata.decoratedType is not enumerable
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (! Object.keys(row.metadata).length) { return }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ret.push({
      // @ts-expect-error
      ...row.metadata,
    })

  })
  return ret
}

/**
 * argsFromMethodDecoratorArray 优先级高于 argsFromClassDecorator
 * argsFromMethodDecoratorArray 仅取值第一个（最靠近类的装饰器）
 * - argsFromClassDecorator: 从类装饰器中获取的参数
 * - argsFromMethodDecorator: 从方法装饰器中获取的参数
 */
export function mergeDecoratorMetaDataPayload<TDecoratorParam extends {} = {}>(
  argsFromClassDecoratorArray: DecoratorMetaDataPayload<TDecoratorParam>[] | undefined,
  argsFromMethodDecorator: DecoratorMetaDataPayload<TDecoratorParam> | undefined,
): DecoratorMetaDataPayload<TDecoratorParam> | undefined {

  const argsFromClassDecorator = argsFromClassDecoratorArray?.[0]
  if (argsFromMethodDecorator && argsFromMethodDecorator.decoratedType === 'method') {
    const ret = deepmerge.all([
      argsFromClassDecorator ?? {},
      argsFromMethodDecorator,
    ]) as DecoratorMetaDataPayload<TDecoratorParam>
    return ret
  }
  return argsFromClassDecorator
}

