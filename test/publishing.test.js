import test from 'node:test'
import assert from 'node:assert/strict'
import {
  makeFeedPointer,
  makeFeedUrl,
  makePost,
  makeRawPostUrl,
  normalizePrivateKey,
  parseFeedInput,
  readFeedPointer,
} from '../src/publishing.js'

const topic = 'a'.repeat(64)
const owner = `0x${'b'.repeat(40)}`
const reference = 'c'.repeat(64)

test('normalizes private keys and rejects malformed values', () => {
  assert.equal(normalizePrivateKey(`0x${'a'.repeat(64)}`), `0x${'a'.repeat(64)}`)
  assert.throws(() => normalizePrivateKey('not a key'), /32-byte private key/)
})

test('creates an original post record and compact feed pointer', () => {
  const post = makePost({ title: 'Water after rain', author: 'Field Notes', body: 'A new report.' }, '2026-11-03T00:00:00.000Z')
  const pointer = readFeedPointer(makeFeedPointer(post, reference))
  assert.equal(pointer.reference, reference)
  assert.equal(pointer.title, post.title)
  assert.equal(JSON.stringify(pointer).length < 4096, true)
  assert.throws(() => makePost({ title: '', body: '' }), /title and post/)
})

test('resolves publisher owner and topic from supported reader inputs', () => {
  assert.deepEqual(parseFeedInput(owner, topic), { owner, topic })
  const input = `https://api.gateway.ethswarm.org/bzz/${reference}/?owner=${owner}&topic=${topic}`
  assert.deepEqual(parseFeedInput(input, topic), { owner, topic })
  assert.throws(() => parseFeedInput('not a link', topic), /complete Swarm feed/)
})

test('creates a stable Swarm reader URL and direct post URL', () => {
  assert.equal(
    makeFeedUrl(reference, owner, topic),
    `https://api.gateway.ethswarm.org/bzz/${reference}/?owner=${owner}&topic=${topic}`,
  )
  assert.equal(makeRawPostUrl(reference), `https://api.gateway.ethswarm.org/bzz/${reference}/`)
})

test('rejects invalid feed data instead of treating it as success', () => {
  assert.throws(() => readFeedPointer('{}'), /Stillhere post reference/)
  assert.throws(() => readFeedPointer('{broken'), SyntaxError)
})
