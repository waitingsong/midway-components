import { Context } from '~/interface'
import { MiddlewarePathPattern } from '~/lib/types'


export function reqestPathMatched(
  ctx: Context,
  rules?: MiddlewarePathPattern,
): boolean {

  if (! rules) {
    return false
  }

  const { path } = ctx

  const ret = rules.some((rule) => {
    if (! rule) {
      return
    }
    else if (typeof rule === 'string') {
      return rule === path
    }
    else if (rule instanceof RegExp) {
      return rule.test(path)
    }
    else if (typeof rule === 'function') {
      return rule(ctx)
    }
    else {
      throw new TypeError('Invalid type of rule value')
    }
  })
  return ret
}

