import { test, expectTypeOf } from 'vitest'

import { foo } from '.'

test('should have a value', () => {
  expectTypeOf(foo).toBeString()
})
