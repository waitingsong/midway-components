import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { testConfig } from '#@/root.config.js'

import { UserDto4, UserDto5, UserDto6, UserDto7 } from './user2.dto.js'


describe(fileShortPath(import.meta.url), () => {

  describe('RequiredDto() inclusive keys', () => {
    it('*', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto4, { uid: 1, age: 1, userName: 'a' })

      try {
        validateService.validate(UserDto4, { uid: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"age" is required'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid allowed only', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto5, { uid: 1 })

      try {
        validateService.validate(UserDto5, { age: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is required'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid allowed only, not allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto5, { uid: 1 })

      try {
        validateService.validate(UserDto5, { uid: 1, age: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"age" is not allowed'), ex.message)
        return
      }
      assert(false, 'should throw error')
    })

    it('uid+age allowed, required', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto6, { uid: 1, age: 1 })

      try {
        validateService.validate(UserDto6, { age: 1, userName: 'a' })
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('"uid" is required'), ex.message)
        return
      }

      assert(false, 'should throw error')
    })

    it('uid+age allowed, not allowed', () => {
      const { validateService } = testConfig

      validateService.validate(UserDto6, { uid: 1, age: 1 })

      try {
        validateService.validate(UserDto6, { uid: 1, age: 1, userName: 'a' })
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

