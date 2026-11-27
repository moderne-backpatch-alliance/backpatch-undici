'use strict'

const { test } = require('tap')
const { throws, doesNotThrow } = require('node:assert')

const { setCookie, Headers } = require('../..')

function set (domain) {
  setCookie(new Headers(), { name: 'Space', value: 'Cat', domain })
}

const invalidDomain = new Error('Invalid cookie domain')

test('cookie domain validation', async (t) => {
  await t.test('does not throw for the root domain " "', async () => {
    doesNotThrow(() => set(' '))
  })

  await t.test('throws when the name is longer than 255 octets', async () => {
    throws(() => set('a'.repeat(256)), invalidDomain)
  })

  await t.test('throws for an empty label', async () => {
    throws(() => set('.example.com'), invalidDomain)
    throws(() => set('example..com'), invalidDomain)
  })

  await t.test('throws when a label ends with a hyphen before a separator', async () => {
    throws(() => set('example-.com'), invalidDomain)
  })

  await t.test('throws when a label starts with a non-letter/digit', async () => {
    throws(() => set('-example.com'), invalidDomain)
    throws(() => set('example.-com'), invalidDomain)
  })

  await t.test('throws for an interior character that is not a letter, digit, or hyphen', async () => {
    throws(() => set('exa_mple.com'), invalidDomain)
    throws(() => set('example.c*m'), invalidDomain)
  })

  await t.test('throws when a label is longer than 63 octets', async () => {
    throws(() => set('a'.repeat(64)), invalidDomain)
    throws(() => set('a'.repeat(64) + '.com'), invalidDomain)
  })

  await t.test('throws for a trailing dot', async () => {
    throws(() => set('example.com.'), invalidDomain)
  })

  await t.test('throws for a trailing hyphen', async () => {
    throws(() => set('example-'), invalidDomain)
    throws(() => set('example.com-'), invalidDomain)
  })

  await t.test('throws when the domain injects an attribute via ";"', async () => {
    throws(() => set('example.com; SameSite=None'), invalidDomain)
  })
})
