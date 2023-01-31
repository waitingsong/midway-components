import assert from 'node:assert'

import {
  INJECT_CUSTOM_METHOD,
  getClassMetadata,
} from '@midwayjs/core'

import {
  DecoratorMetaData,
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
  ) as DecoratorMetaData[] | undefined

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
  ) as DecoratorMetaData[] | undefined

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
  inclusiveDecortaorKeys: string[] | undefined,
) {

  assert(target, 'target is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')

  const inclusiveKeysSet = new Set(inclusiveDecortaorKeys)
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

  const arr2 = getClassMetadata<DecoratorMetaData[]>(INJECT_CUSTOM_METHOD, target)
  void arr2
}

