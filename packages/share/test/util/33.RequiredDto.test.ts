import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { testConfig } from '#@/root.config.js'

import { UserDto1, UserDto2, UserDto3 } from './user2.dto.js'


describe(fileShortPath(import.meta.url), () => {

  describe('RequiredDto() exclusive keys', () => {
    it('empty keys', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto1, { uid: 1, age: 1, userName: 'a' })

      try {
        validateService.validate(UserDto1, { uid: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"age" is required'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid not allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto2, { age: 1, userName: 'a' })

      try {
        validateService.validate(UserDto2, { uid: 1, age: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid not allowed, required', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto2, { age: 1, userName: 'a' })

      try {
        validateService.validate(UserDto2, { userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"age" is required'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid+age not allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto3, { userName: 'a' })

      try {
        validateService.validate(UserDto3, { uid: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid+age not allowed, required', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto3, { userName: 'a' })

      try {
        validateService.validate(UserDto3, { age: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"userName" is required'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

  })

})

