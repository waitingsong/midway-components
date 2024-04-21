import { Provide } from '@midwayjs/core'


export const data = {
  foo: Math.random().toString(),
  bar: Math.random().toString(),
}


@Provide()
export class CacheService {
  async foo(): Promise<string> {
    return data.foo
  }

  bar(): string {
    return data.bar
  }
}
