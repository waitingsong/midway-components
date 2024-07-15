import { Rule, RuleType } from '@midwayjs/validate'

import { OptionalDto } from '../../src/util/dto.util.js'


export class UserDto {
  @Rule(RuleType.number().required())
  uid: number

  @Rule(RuleType.string().required())
  userName: string

  @Rule(RuleType.number().required())
  age?: number
}

export class UserDto1 extends OptionalDto(UserDto, []) { }
const f1 = new UserDto1()
f1.uid = 1
f1.age = 1
f1.userName = 'foo'

export class UserDto2 extends OptionalDto(UserDto, ['uid']) {}
const f2 = new UserDto2()
// f2.uid = 1 // err
f2.age = 1
f2.userName = 'foo'

export class UserDto3 extends OptionalDto(UserDto, ['uid', 'age']) {}
const f3 = new UserDto3()
// f3.uid = 1
// f3.age = 1
f3.userName = 'foo'


export class UserDto4 extends OptionalDto(UserDto, [], '*') { }
const f4 = new UserDto4()
f4.uid = 1
f4.age = 1
f4.userName = 'foo'

export class UserDto5 extends OptionalDto(UserDto, [], ['uid']) { }
const f5 = new UserDto5()
f5.uid = 1
// f5.age = 1
// f5.userName = 'foo'

export class UserDto6 extends OptionalDto(UserDto, [], ['uid', 'age']) { }
const f6 = new UserDto6()
f6.uid = 1
f6.age = 1
// f5.userName = 'foo'

export class UserDto7 extends OptionalDto(UserDto, ['uid'], ['uid', 'age']) { }
const f7 = new UserDto7()
// f7.uid = 1
f7.age = 1
// f7.userName = 'foo'

export class UserDto8 extends OptionalDto(UserDto, ['uid'], ['age', 'userName']) { }
const f8 = new UserDto8()
// f8.uid = 1
f8.age = 1
f8.userName = 'foo'

export class Dto9 extends OptionalDto(UserDto, ['uid', 'age', 'userName'], ['uid', 'age', 'userName']) { }
const f9 = new Dto9()
void f9
// f8.uid = 1
// f9.age = 1
// f8.userName = 'foo'
