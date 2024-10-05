import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { testConfig } from '#@/root.config.js'

import { Dto9, UserDto7, UserDto8 } from './user.dto.js'


describe(fileShortPath(import.meta.url), () => {

  describe('OptionalDto() exclusive vs inclusive keys', () => {
    it('uid vs uid+age = age only ', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto7, {})
      validateService.validate(UserDto8, {})
      validateService.validate(Dto9, {})
    })

    it('uid vs uid+age = age only 7', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto7, {})
      validateService.validate(UserDto7, { age: 1 })

      try {
        validateService.validate(UserDto7, { uid: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid vs age+username = age+username', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto8, {})
      validateService.validate(UserDto8, { age: 1 })
      validateService.validate(UserDto8, { age: 1, userName: 'a' })

      try {
        validateService.validate(UserDto8, { uid: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })


    it('uid+age+username vs uid+age+username = none a', () => {
      const { validateService } = testConfig

      validateService.validate(Dto9, {})

      try {
        validateService.validate(Dto9, { uid: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })
    it('uid+age+username vs uid+age+username = none b', () => {
      const { validateService } = testConfig

      validateService.validate(Dto9, {})

      try {
        validateService.validate(Dto9, { age: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"age" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })
    it('uid+age+username vs uid+age+username = none c', () => {
      const { validateService } = testConfig

      validateService.validate(Dto9, {})

      try {
        validateService.validate(Dto9, { userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"userName" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })
  })

})

