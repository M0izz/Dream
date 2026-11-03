import { Bee } from '@ethersphere/bee-js'
import { readFeedPointer, renderParagraphs } from './publishing.js'

const params = new URLSearchParams(location.search)
const owner = params.get('owner') || params.get('publisher')
const topic = params.get('topic') || document.querySelector('meta[name="swarm-feed-topic"]')?.content
const status = document.querySelector('#status')

async function openLatest() {
  if (!owner || !/^0x[\da-f]{40}$/i.test(owner)) {
    throw new Error('The stable link is missing a valid feed owner address.')
  }
  if (!topic || !/^[\da-f]{64}$/i.test(topic)) {
    throw new Error('The stable link is missing a valid feed topic.')
  }

  const bee = new Bee(location.origin)
  const feed = bee.feed.makeReader(topic, owner)
  const update = await feed.downloadPayload()
  const pointer = readFeedPointer(new TextDecoder().decode(update.payload))
  const storedPost = await bee.data.download(pointer.reference)
  const post = JSON.parse(new TextDecoder().decode(storedPost))

  if (post.schema !== pointer.schema || typeof post.title !== 'string' || typeof post.body !== 'string') {
    throw new Error('The feed points to content that is not a valid Stillhere post.')
  }

  document.querySelector('#title').textContent = post.title
  document.querySelector('#byline').textContent =
    `${post.author || 'Independent publisher'} · ${new Date(post.publishedAt).toLocaleString()}`
  renderParagraphs(document.querySelector('#content'), post.body)
  const rawLink = document.querySelector('#raw-link')
  rawLink.href = `${location.origin}/bzz/${encodeURIComponent(pointer.reference)}/`
  document.querySelector('#post').hidden = false
  status.hidden = true
}

openLatest().catch((error) => {
  status.textContent = error.message || 'Could not load the latest post. Check the gateway and feed availability.'
  status.classList.add('error')
})
