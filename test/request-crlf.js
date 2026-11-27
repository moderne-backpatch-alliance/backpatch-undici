'use strict'

const assert = require('node:assert')
const { once } = require('node:events')
const { createServer } = require('http')
const { test } = require('tap')
const { request, errors } = require('..')

test('should validate content-type CRLF Injection', (t) => {
  t.plan(2)

  const server = createServer((req, res) => {
    t.fail('should not receive any request')
    res.statusCode = 200
    res.end('hello')
  })

  t.teardown(server.close.bind(server))

  server.listen(0, async () => {
    try {
      await request(`http://localhost:${server.address().port}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json\r\n\r\nGET /foo2 HTTP/1.1'
        }
      })
      t.fail('request should fail')
    } catch (e) {
      t.type(e, errors.InvalidArgumentError)
      t.equal(e.message, 'invalid content-type header')
    }
  })
})

test('should validate blob body content-type CRLF Injection', async (t) => {
  let receivedRequest = false
  const server = createServer({ joinDuplicateHeaders: true }, (req, res) => {
    receivedRequest = true
    res.statusCode = 200
    res.end('hello')
  })

  t.teardown(() => server.close())

  server.listen(0)

  await once(server, 'listening')

  class MaliciousBlob extends Blob {
    get type () {
      return 'text/html\r\nX-Injected: true'
    }
  }

  await assert.rejects(
    request(`http://localhost:${server.address().port}/endpoint`, {
      method: 'POST',
      body: new MaliciousBlob(['hello'])
    }),
    (e) => e instanceof errors.InvalidArgumentError && e.message === 'invalid content-type header'
  )
  assert.strictEqual(receivedRequest, false)
})
