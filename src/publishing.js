export const TOPIC_NAME = 'stillhere.latest.v1'
export const POST_SCHEMA = 'stillhere-post-v1'

export function normalizePrivateKey(value) {
  const key = value.trim().replace(/^0x/i, '')
  if (!/^[\da-f]{64}$/i.test(key)) {
    throw new Error('Enter a 32-byte private key (64 hexadecimal characters).')
  }
  return `0x${key}`
}

export function makePost({ title, author, body }, publishedAt = new Date().toISOString()) {
  const cleanTitle = title.trim()
  const cleanBody = body.trim()
  if (!cleanTitle || !cleanBody) throw new Error('Add a title and post before publishing.')
  return {
    schema: POST_SCHEMA,
    title: cleanTitle,
    author: author.trim(),
    body: cleanBody,
    publishedAt,
  }
}

export function makeFeedPointer(post, reference) {
  if (typeof reference !== 'string' || reference.length === 0) {
    throw new Error('Swarm did not return a post reference.')
  }
  return JSON.stringify({
    schema: POST_SCHEMA,
    reference,
    title: post.title,
    author: post.author,
    publishedAt: post.publishedAt,
  })
}

export function readFeedPointer(value) {
  const pointer = typeof value === 'string' ? JSON.parse(value) : value
  if (pointer?.schema !== POST_SCHEMA || typeof pointer.reference !== 'string' || !pointer.reference) {
    throw new Error('This feed does not contain a Stillhere post reference.')
  }
  return pointer
}

export function parseFeedInput(value, defaultTopic) {
  const input = value.trim()
  if (/^0x[\da-f]{40}$/i.test(input)) return { owner: input, topic: defaultTopic }

  let url
  try {
    url = new URL(input)
  } catch {
    throw new Error('Enter a publisher address or a complete Swarm feed/share link.')
  }
  const owner = url.searchParams.get('owner') || url.searchParams.get('publisher')
  const topic = url.searchParams.get('topic') || defaultTopic
  if (!owner || !/^0x[\da-f]{40}$/i.test(owner)) {
    throw new Error('That link must include a 0x publisher address.')
  }
  if (!/^[\da-f]{64}$/i.test(topic)) {
    throw new Error('The feed topic must be 64 hexadecimal characters.')
  }
  return { owner, topic }
}

export function makeFeedUrl(readerReference, owner, topic, gateway = 'https://api.gateway.ethswarm.org') {
  const base = gateway.replace(/\/+$/, '')
  const url = new URL(`${base}/bzz/${readerReference}/`)
  url.searchParams.set('owner', owner)
  url.searchParams.set('topic', topic)
  return url.toString()
}

export function makeRawPostUrl(reference, gateway = 'https://api.gateway.ethswarm.org') {
  return `${gateway.replace(/\/+$/, '')}/bzz/${reference}/`
}

export function renderParagraphs(container, body) {
  container.replaceChildren()
  body.split(/\n\s*\n/).forEach((text) => {
    const paragraph = document.createElement('p')
    paragraph.textContent = text
    container.append(paragraph)
  })
}
