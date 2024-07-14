/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getClassExtendedMetadata, saveClassMetadata } from '@midwayjs/core'
import type { RuleType } from '@midwayjs/validate'
import type { TupleToUnion } from '@waiting/shared-types'


const RULES_KEY = 'common:rules' // from midwayjs/validate
type Dto<T> = new() => T
type SchemaMethod = keyof RuleType.Schema

export type DtoFromResultType<
  T extends object,
  KE extends (keyof T)[],
  KI extends (keyof T)[] | void | null | '*',
> = Omit<
  KI extends void | null | '*'
    ? T : KI extends (keyof T)[]
      ? Pick<T, TupleToUnion<KI>> : never,
  KE extends (keyof T)[]
    ? TupleToUnion<KE> : never
>

/**
 * Convert a DTO to a new DTO, excluding some keys, and all of the validation RuleType on keys are optional.
 * @param KExclusiveKeys
 * - if undefined or null, or empty [], all keys will be included; otherwise this keys will be omitted
 * - exclusiveKeys high priority then inclusiveKeys
 * @param KInclusiveKeys
 * - if undefined or '*' or empty [], all keys will be included; otherwise this keys will be picked
 */
export function OptionalDto<T extends object, KExclusiveKeys extends (keyof T)[], KInclusiveKeys extends (keyof T)[]>(
  dto: Dto<T>,
  exclusiveKeys: KExclusiveKeys,
  inclusiveKeys: KInclusiveKeys | void | '*' = '*',
): Dto<DtoFromResultType<T, typeof exclusiveKeys, typeof inclusiveKeys> > {

  return DtoFrom(dto, ['optional'], exclusiveKeys, inclusiveKeys)
}

/**
 * Convert a DTO to a new DTO, excluding some keys, and all of the validation RuleType on keys are required.
 * @param KExclusiveKeys
 * - if undefined or null, or empty [], all keys will be included; otherwise this keys will be omitted
 * - exclusiveKeys high priority then inclusiveKeys
 * @param KInclusiveKeys
 * - if undefined or '*' or empty [], all keys will be included; otherwise this keys will be picked
 */
export function RequiredDto<T extends object, KExclusiveKeys extends (keyof T)[], KInclusiveKeys extends (keyof T)[]>(
  dto: Dto<T>,
  exclusiveKeys: KExclusiveKeys,
  inclusiveKeys: KInclusiveKeys | void | '*' = '*',
): Dto<DtoFromResultType<T, typeof exclusiveKeys, typeof inclusiveKeys> > {

  return DtoFrom(dto, ['required'], exclusiveKeys, inclusiveKeys)
}


/**
 * Convert a DTO to a new DTO, excluding some keys, and all of the validation RuleType on keys are optional.
 * @param KExclusiveKeys
 * - if undefined or null, or empty [], all keys will be included; otherwise this keys will be omitted
 * - exclusiveKeys high priority then inclusiveKeys
 * @param KInclusiveKeys
 * - if undefined or '*' or empty [], all keys will be included; otherwise this keys will be picked
 */
export function DtoFrom<
  T extends object,
  KExclusiveKeys extends (keyof T)[],
  KInclusiveKeys extends (keyof T)[],
>(
  dto: Dto<T>,
  schemaMethods: SchemaMethod[],
  exclusiveKeys: KExclusiveKeys,
  inclusiveKeys: KInclusiveKeys | void | '*' = '*',
): Dto<DtoFromResultType<T, typeof exclusiveKeys, typeof inclusiveKeys> > {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const pickedDto: unknown = function () {}
  // @ts-expect-error
  pickedDto.prototype = dto.prototype
  const fatherRules: Record<string, RuleType.Schema> = getClassExtendedMetadata(RULES_KEY, dto)
  const pickedRules: Record<string, RuleType.Schema> = Object.assign({}, fatherRules)
  if (Array.isArray(exclusiveKeys)) {
    for (const key of exclusiveKeys) {
      // @ts-expect-error
      delete pickedRules[key]
    }
  }

  const includesSet = Array.isArray(inclusiveKeys) ? new Set(inclusiveKeys) : '*'

  Object.keys(pickedRules).forEach((key: string) => {
    const rule = pickedRules[key]
    if (! rule) { return }

    // @ts-expect-error has(key)
    if (includesSet === '*' || includesSet.has(key)) {
      pickedRules[key] = appendSchemaMethods(rule, schemaMethods)
    }
    else {
      delete pickedRules[key]
    }
  })

  saveClassMetadata(RULES_KEY, pickedRules, pickedDto)
  // @ts-expect-error
  return pickedDto
}


function appendSchemaMethods(
  schema: RuleType.Schema,
  methods: SchemaMethod[],
): RuleType.Schema {

  let ret = schema
  methods.forEach((method) => {
    if (typeof schema[method] === 'function') {
      // @ts-expect-error signature
      ret = schema[method]()
    }
  })
  return ret
}

