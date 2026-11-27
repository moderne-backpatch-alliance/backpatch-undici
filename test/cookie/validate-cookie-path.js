'use strict'

const { test } = require('tap')
const { throws } = require('node:assert')
const {
  validateCookiePath
} = require('../../lib/cookies/util')

test('validateCookiePath', async (t) => {
  await t.test('should throw for non-ascii characters', async () => {
    throws(() => validateCookiePath('/a\xE9')) // é, 0xE9
    throws(() => validateCookiePath('/\x80')) // first C1 control
    throws(() => validateCookiePath('/\x9F')) // last C1 control
    throws(() => validateCookiePath('/\xFF')) // 0xFF
    throws(() => validateCookiePath('\u{1F600}'))
  })
})
