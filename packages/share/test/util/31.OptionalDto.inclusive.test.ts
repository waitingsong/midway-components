import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { testConfig } from '#@/root.config.js'

import { UserDto4, UserDto5, UserDto6, UserDto7 } from './user.dto.js'


describe(fileShortPath(import.meta.url), () => {

  describe('OptionalDto() inclusive keys', () => {
    it('*', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto4, { uid: 1, age: 1, userName: 'a' })

      validateService.validate(UserDto4, {})
      validateService.validate(UserDto5, {})
      validateService.validate(UserDto6, {})
      validateService.validate(UserDto7, {})
    })

    it('uid allowed only', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto5, {})
      validateService.validate(UserDto5, { uid: 1 })

      try {
        validateService.validate(UserDto5, { age: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"age" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid+age allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto6, {})
      validateService.validate(UserDto6, { uid: 1 })
      validateService.validate(UserDto6, { uid: 1, age: 1 })

      try {
        validateService.validate(UserDto6, { userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"userName" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('key not belong to DTO not allowed', () => {
      const { validateService } = testConfig

      try {
        validateService.validate(UserDto4, { id: 1 })
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
        validateService.validate(UserDto5, { id: 1 })
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
        validateService.validate(UserDto6, { id: 1 })
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

      validateService.validate(UserDto4, { age: 1 })
      validateService.validate(UserDto6, { age: 1 })
    })

  })

})

