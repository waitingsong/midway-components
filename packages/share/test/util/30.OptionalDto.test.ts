import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { testConfig } from '#@/root.config.js'

import { UserDto1, UserDto2, UserDto3 } from './user.dto.js'


describe(fileShortPath(import.meta.url), () => {

  describe('OptionalDto() exclusive keys', () => {
    it('empty keys', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto1, { uid: 1, age: 1, userName: 'a' })

      validateService.validate(UserDto1, {})
      validateService.validate(UserDto2, {})
      validateService.validate(UserDto3, {})
    })

    it('uid not allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto2, {})
      validateService.validate(UserDto2, { age: 1, userName: 'a' })

      try {
        validateService.validate(UserDto2, { uid: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid+age not allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto3, {})
      validateService.validate(UserDto3, { userName: 'a' })

      try {
        validateService.validate(UserDto3, { uid: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('key not belong to DTO not allowed', () => {
      const { validateService } = testConfig

      try {
        validateService.validate(UserDto1, { id: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"id" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('key not belong to DTO not allowed 2', () => {
      const { validateService } = testConfig

      try {
        validateService.validate(UserDto2, { id: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"id" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('key not belong to DTO not allowed 3', () => {
      const { validateService } = testConfig

      try {
        validateService.validate(UserDto3, { id: 1 })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"id" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('age allowed', () => {
      const { validateService } = testConfig
      validateService.validate(UserDto1, { age: 1 })
      validateService.validate(UserDto2, { age: 1 })
    })

    it('age+userName allowed', () => {
      const { validateService } = testConfig
      validateService.validate(UserDto1, { age: 1, userName: 'a' })
      validateService.validate(UserDto2, { age: 1, userName: 'a' })
    })
  })

})

